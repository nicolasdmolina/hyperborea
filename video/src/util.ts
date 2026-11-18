import { Easing } from "@archastro/clapper-core";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 over [a, b] seconds with an ease. */
export function ramp(time: number, a: number, b: number, ease = Easing.inOutCubic) {
  return ease(clamp01((time - a) / (b - a)));
}

function parse(c: string): [number, number, number, number] {
  const h = c.replace("#", "");
  const n = h.length === 3 || h.length === 4 ? h.split("").map((x) => x + x).join("") : h;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
    n.length >= 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1,
  ];
}

/** Mix two hex colors (with optional alpha) and return rgba(). */
export function mixColor(a: string, b: string, t: number) {
  const x = parse(a);
  const y = parse(b);
  const m = x.map((v, i) => lerp(v, y[i], t));
  return `rgba(${m[0].toFixed(1)},${m[1].toFixed(1)},${m[2].toFixed(1)},${m[3].toFixed(3)})`;
}

// 8x8 Bayer matrix, values 0..63
const B8 = (() => {
  const b2 = [
    [0, 2],
    [3, 1],
  ];
  let m = b2;
  for (let s = 2; s < 8; s *= 2) {
    const n: number[][] = [];
    for (let y = 0; y < s * 2; y++) {
      n.push([]);
      for (let x = 0; x < s * 2; x++) {
        const q = m[y % s][x % s] * 4;
        const off = [[0, 2], [3, 1]][Math.floor(y / s)][Math.floor(x / s)];
        n[y].push(q + off);
      }
    }
    m = n;
  }
  return m;
})();

/**
 * Clip path for a dithered wipe: cells switch on in Bayer order as the wipe front passes.
 * dir: unit vector of the wipe across the box. spread: how wide the dithered edge is (0..1 of the box).
 * Returns a CSS clip-path value, or null when fully off/on.
 */
export function ditherClip(
  t: number,
  w: number,
  h: number,
  cell: number,
  dir: [number, number] = [0.8, 0.6],
  spread = 0.45,
): string | "none" | "all" {
  if (t <= 0) return "none";
  if (t >= 1) return "all";
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const span = Math.abs(dir[0]) * w + Math.abs(dir[1]) * h;
  const ox = dir[0] < 0 ? w : 0;
  const oy = dir[1] < 0 ? h : 0;
  const front = t * (1 + spread);
  let d = "";
  for (let r = 0; r < rows; r++) {
    let run = -1;
    for (let c = 0; c <= cols; c++) {
      let on = false;
      if (c < cols) {
        const px = c * cell + cell / 2;
        const py = r * cell + cell / 2;
        const u = ((px - ox) * dir[0] + (py - oy) * dir[1]) / span; // 0..1 along the wipe
        const local = (front - u * 1) / spread; // >1 fully on, <0 off
        const th = (B8[r % 8][c % 8] + 0.5) / 64;
        on = local > th;
      }
      if (on && run < 0) run = c;
      if (!on && run >= 0) {
        d += `M${run * cell} ${r * cell}h${(c - run) * cell}v${cell}h${-(c - run) * cell}z`;
        run = -1;
      }
    }
  }
  return d ? `path("${d}")` : "none";
}
