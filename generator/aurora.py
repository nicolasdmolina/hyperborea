"""Dithered aurora-over-mountains scene generator.

Renders 480x270 frames, ordered-dithered to a small ice palette, as a
seamless loop (every moving part is periodic in the loop phase).
Output: a vertical sprite strip PNG per option, used as a CSS
step-animation background.
"""
import sys, json, math
import numpy as np
from PIL import Image

W, H = 480, 270

BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16.0
DITHER = np.tile(BAYER4, (H // 4 + 1, W // 4 + 1))[:H, :W] - 0.47


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def lerp_ramp(stops, t):
    """stops: list of (pos, hex). t: array 0..1 -> rgb array."""
    t = np.clip(t, 0, 1)
    pos = np.array([s[0] for s in stops])
    cols = np.array([hexrgb(s[1]) for s in stops])
    out = np.zeros(t.shape + (3,))
    for c in range(3):
        out[..., c] = np.interp(t, pos, cols[:, c])
    return out


def ridge(seed, base, amp, rough, peaks=()):
    """Fractal ridge line y(x) plus optional (x, height, width) peaks."""
    rng = np.random.default_rng(seed)
    n = 513
    pts = np.zeros(n)
    step, scale = n - 1, amp
    pts[0], pts[-1] = rng.normal(0, amp * .3), rng.normal(0, amp * .3)
    while step > 1:
        half = step // 2
        for i in range(half, n - 1, step):
            pts[i] = (pts[i - half] + pts[i + half]) / 2 + rng.normal(0, scale)
        scale *= rough
        step = half
    xs = np.linspace(0, W, n)
    y = np.interp(np.arange(W), xs, pts)
    x = np.arange(W)
    for px, ph, pw in peaks:
        # sharp-ish triangular peak with a slightly concave flank
        d = np.abs(x - px) / pw
        y -= ph * np.clip(1 - d, 0, 1) ** 1.35
    return base + y


def nearest_palette(rgb, pal):
    d = ((rgb[..., None, :] - pal[None, None, :, :]) ** 2 * np.array([0.9, 1.2, 1.0])).sum(-1)
    return d.argmin(-1)


def render(opt, k, n):
    th = 2 * math.pi * k / n
    rng = np.random.default_rng(opt['seed'])
    yy, xx = np.mgrid[0:H, 0:W].astype(float)

    # ---------- sky
    sky = lerp_ramp(opt['sky'], yy / H)

    # ---------- aurora: ribbon curtains sampled along their length so they can fold
    aur = np.zeros((H, W, 3))
    glow_at_x = np.zeros(W)
    ycol = np.arange(H, dtype=float)[None, :]
    for ci, c in enumerate(opt['curtains']):
        S = 2400
        s = np.linspace(-1, 1, S)
        x = c['center'] + s * c['span']
        for (a, f, ph, m) in c.get('folds', []):
            x = x + a * np.sin(s * f + ph + m * th)
        e = c['base'] + c['slope'] * (x - 240) + c.get('bow', 0) * s ** 2
        for (a, f, ph, m) in c['waves']:
            e = e + a * np.sin(s * f + ph + m * th)
        rays = np.zeros(S)
        for (a, f, ph, m) in c['rays']:
            rays += a * np.sin(s * f + ph + m * th)
        rays = 0.5 + 0.5 * np.tanh(rays * 1.2)
        knots = np.ones(S)
        for (a, f, ph, m) in c.get('knots', []):
            knots += a * np.sin(s * f + ph + m * th)
        knots = np.clip(knots, 0.15, None)
        hgt = c['height'] * (1 - c.get('rayamt', .5) * 0.6 + c.get('rayamt', .5) * 0.9 * rays)
        env = np.clip(1 - np.abs(s) ** c.get('taper', 2.4), 0, 1)
        bright = c['gain'] * env * knots * (1 - c.get('rayamt', .5) * 0.5 + c.get('rayamt', .5) * 0.6 * rays)
        d = e[:, None] - ycol  # S x H, height above lower edge
        up = np.maximum(d, 0)
        v = np.where(d >= 0, np.exp(-up / hgt[:, None]) * np.clip(1 - up / (hgt[:, None] * 2.8), 0, 1) ** 1.5,
                     np.exp(d / c.get('under', 4.0)))
        v = v + np.exp(-((d - 1.0) / 2.0) ** 2) * c.get('edge', .35)
        tcol = np.clip(up / (hgt[:, None] * 1.5), 0, 1)
        col = lerp_ramp(c['ramp'], tcol)  # S x H x 3
        contrib = col * (v * bright[:, None])[..., None]
        norm = (2 * c['span'] / S)
        xi = np.round(x).astype(int)
        for dx, wgt in ((-1, .25), (0, .5), (1, .25)):
            xx_ = xi + dx
            ok = (xx_ >= 0) & (xx_ < W)
            tmp = np.zeros((W, H, 3))
            np.add.at(tmp, xx_[ok], contrib[ok] * wgt * norm)
            aur += tmp.transpose(1, 0, 2)
        gb = np.zeros(W)
        np.add.at(gb, np.clip(xi, 0, W - 1), bright * norm)
        glow_at_x += gb

    lum = aur.mean(-1)
    tm = (1 - np.exp(-lum / 170.0)) * 235.0 / np.maximum(lum, 1e-3)
    aur = aur * tm[..., None]
    img = sky + aur

    # ---------- stars (behind aurora glow, hidden by mountains later)
    sr = np.random.default_rng(opt['seed'] + 7)
    ns = opt.get('stars', 260)
    sx = sr.integers(0, W, ns)
    sy = (sr.random(ns) ** 1.6 * H * 0.78).astype(int)
    sb = sr.random(ns) ** 2.2
    tw_m = sr.integers(1, 4, ns)
    tw_p = sr.random(ns) * 6.28
    tw = 0.55 + 0.45 * np.sin(th * tw_m + tw_p)
    lum = aur.sum(-1)[sy, sx] / 3
    vis = np.clip(1 - lum / 90, 0, 1)
    sval = (60 + 195 * sb * tw) * vis
    star_col = hexrgb(opt.get('star', '#e8f6ff')) / 255
    for i in range(ns):
        img[sy[i], sx[i]] = np.maximum(img[sy[i], sx[i]], star_col * sval[i])
        if sb[i] > .82:  # a few cross stars
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = sx[i] + dx, sy[i] + dy
                if 0 <= X < W and 0 <= Y < H:
                    img[Y, X] = np.maximum(img[Y, X], star_col * sval[i] * .45)

    # ---------- mountains (far to near)
    land = np.zeros((H, W), bool)
    gx = glow_at_x / (glow_at_x.max() + 1e-6)
    gx = np.convolve(gx, np.ones(41) / 41, mode='same')
    for li, m in enumerate(opt['ranges']):
        r = ridge(m['seed'], m['base'], m['amp'], m['rough'], m.get('peaks', ()))
        X = xx[0]
        mask = yy >= r[None, :]
        depth = yy - r[None, :]
        slope = np.gradient(np.convolve(r, np.ones(5) / 5, mode='same'))
        ldir = m.get('light_dir', 1)  # 1 = light from the left
        # which face is lit: slope-based, overridden near named peaks by a meandering spine
        litv = np.full((H, W), 0.5)
        for (px, ph, pw) in m.get('peaks', ()):
            spine = px + 4 * np.sin(depth * 0.09 + px) + depth * 0.1 * ldir
            side = np.clip(0.5 - (xx - spine) * ldir * 0.35, 0, 1)
            infl = np.clip(1 - np.abs(xx - px) / pw, 0, 1) ** 0.7 * np.clip(1 - depth / (ph * 1.4 + 10), 0, 1)
            litv = litv + (side - 0.5) * infl
        litv = np.clip(litv, 0, 1)
        base_rock = lerp_ramp(m['body'], np.clip(depth / m.get('fade', 80), 0, 1))
        rock = base_rock * (0.8 + 0.45 * litv[..., None])
        sd = m.get('snow', 0)
        rr = np.random.default_rng(m['seed'])
        nx = np.interp(X, np.linspace(0, W, 40), rr.random(40))
        nx2 = np.interp(X, np.linspace(0, W, 120), rr.random(120))
        gully = np.clip(np.sin(X * 0.3 + nx * 7), 0, 1) ** 2 * (0.4 + 0.8 * nx2) * m.get('gullies', 0.5)
        line = sd * (0.55 + 0.6 * nx)[None, :] * (0.45 + 0.75 * litv)
        line = line * (1 + gully[None, :] * (0.4 + 0.8 * litv)) + np.sin(X * 1.7 + nx * 20)[None, :] * 1.2
        snowy = mask & (depth < line) & (sd > 0)
        gx2 = gx[None, :] * m.get('aurora_light', .25)
        ramp = m.get('snow_ramp', [(0, '#dff3ff'), (1, '#5d7fa8')])
        sc_lit = lerp_ramp(ramp, np.clip(depth / (line + 1e-6), 0, 1) * 0.45 - gx2 * 0.4)
        sc_sh = lerp_ramp(ramp, 0.62 + np.clip(depth / (line + 1e-6), 0, 1) * 0.38)
        snow_col = sc_lit * litv[..., None] + sc_sh * (1 - litv[..., None])
        lit = litv - 0.5
        mcol = np.where(snowy[..., None], snow_col, rock)
        rim = (depth < 1.0) & mask & (lit >= 0)
        mcol = np.where(rim[..., None], np.maximum(mcol, hexrgb(m.get('rim', '#9fd0ff')) * (0.5 + 0.6 * gx[None, :, None])), mcol)
        if 'haze' in m:
            hz = hexrgb(m['haze'])
            mix = np.clip(1 - depth / m.get('haze_depth', 40), 0, 1)[..., None] * m.get('haze_amt', 0.3)
            mcol = mcol * (1 - mix) + hz * mix
        if 'trees' in m:
            T = m['trees']
            tr = np.random.default_rng(m['seed'] + 5)
            ty = np.full(W, 1e9)
            tx = 0.0
            while tx < W:
                ti = int(tx)
                th_ = T['h'] * (0.55 + 0.6 * tr.random())
                top = r[ti] - th_
                ty = np.minimum(ty, top + np.abs(X - ti) * T.get('k', 2.4))
                tx += T['gap'] * (0.5 + tr.random())
            tmask = (yy >= ty[None, :]) & ~mask
            tcol = hexrgb(T['col'])
            # faint rim light on tree tips from the aurora
            tip = tmask & (yy < ty[None, :] + 1.0)
            img = np.where(tmask[..., None], tcol, img)
            img = np.where(tip[..., None], tcol + hexrgb(T.get('rim', '#3a6aa8')) * (0.2 + 0.5 * gx[None, :, None]), img)
            land |= tmask
        img = np.where(mask[..., None], mcol, img)
        land |= mask
        if 'mist' in m:
            my = m['mist']['y']
            mv = np.exp(-((yy - my) / m['mist']['h']) ** 2)
            mv *= 0.6 + 0.4 * np.sin(xx * 0.03 + th * m['mist'].get('m', 1) + yy * 0.1)
            img = img + hexrgb(m['mist']['col']) * (mv * m['mist']['amt'])[..., None]

    # ---------- lake reflection
    if 'lake' in opt:
        L = opt['lake']
        wy = L['y']
        src = img.copy()
        for y in range(wy, H):
            sy_ = int(wy - 1 - (y - wy) * L.get('squash', 2.2))
            if sy_ < 0:
                break
            dist = (y - wy) / (H - wy)
            off = (L['ripple'] * (0.4 + dist) * np.sin(y * 0.9 + th * 2 + xx[0] * 0.02)).astype(int)
            xs = np.clip(np.arange(W) + off, 0, W - 1)
            row = src[sy_, xs] * (L['dim'] * (1 - 0.35 * dist))
            row += hexrgb(L['tint']) * 0.15
            # ripple streaks
            streak = (np.sin(xx[0] * 0.35 + y * 2.1 + th * 3) > 0.93) * 0.25
            row *= (1 + streak)[:, None]
            img[y] = row
        # shoreline

    # ---------- falling snow
    if 'snowfall' in opt:
        S = opt['snowfall']
        fr = np.random.default_rng(opt['seed'] + 99)
        nf = S['n']
        fx0 = fr.random(nf) * W
        fy0 = fr.random(nf) * H
        fm = fr.integers(1, 3, nf)
        fs = fr.random(nf)
        fy = (fy0 + fm * H * (k / n)) % H
        fx = (fx0 + 6 * np.sin(th * fm + fy0) + fy * 0.12) % W
        fc = hexrgb(S['col'])
        for i in range(nf):
            X, Y = int(fx[i]), int(fy[i])
            img[Y, X] = np.maximum(img[Y, X], fc * (0.45 + 0.55 * fs[i]))

    img = np.clip(img, 0, 255)

    # ---------- ordered dither to palette
    names = opt['palette_sky'] + [p for p in opt['palette_land'] if p not in opt['palette_sky']]
    pal = np.array([hexrgb(p) for p in names])
    jit = DITHER[..., None] * opt.get('spread', 34)
    sky_ids = np.array([names.index(p) for p in opt['palette_sky']])
    land_ids = np.array([names.index(p) for p in opt['palette_land']])
    if 'lake' in opt:
        land[opt['lake']['y']:] = False  # reflections use sky colours
    i_sky = sky_ids[nearest_palette(img + jit, pal[sky_ids])]
    i_land = land_ids[nearest_palette(img + jit, pal[land_ids])]
    idx = np.where(land, i_land, i_sky)
    return idx.astype(np.uint8), pal.astype(np.uint8)


def build(opt, n, out_strip, out_still=None):
    frames = []
    for k in range(n):
        idx, pal = render(opt, k, n)
        frames.append(idx)
    strip = np.concatenate(frames, 0)
    im = Image.fromarray(strip, 'P')
    flat = pal.flatten().tolist()
    im.putpalette(flat + [0] * (768 - len(flat)))
    im.save(out_strip, optimize=True, bits=8)
    if out_still:
        st = Image.fromarray(frames[0], 'P')
        st.putpalette(flat + [0] * (768 - len(flat)))
        st.convert('RGB').resize((W * 3, H * 3), Image.NEAREST).save(out_still)
    return strip.shape


if __name__ == '__main__':
    opts = json.load(open(sys.argv[1]))
    n = int(sys.argv[2])
    only = sys.argv[3:] or list(opts)
    for name in only:
        shape = build(opts[name], n, f'out/{name}-strip.png', f'out/{name}-still.png')
        print(name, shape)
