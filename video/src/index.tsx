import {
  AbsoluteFill,
  Composition,
  defineScenes,
  Easing,
  noise1d,
  registerRoot,
  useFps,
  useFrame,
} from "@archastro/clapper-core";
import type { CSSProperties } from "react";
import { Aurora } from "./aurora";
import { LABELS, TITLE } from "./data";
import { Score } from "./score";
import { clamp01, ditherClip, lerp, ramp } from "./util";
import { type Morph, STOCK, WIN_H, WIN_W, Window } from "./Window";
import "./theme.css";

import { FPS } from "./fps";
export { FPS };

/** Beats in seconds. One continuous take; scenes only mark the beats for review and sound. */
export const BEATS = {
  open: [0, 4.6],
  chats: [4.6, 9.4],
  status: [9.4, 12.4],
  drafts: [12.4, 16.6],
  pinned: [16.6, 20.4],
  chat: [20.4, 26.6],
  composer: [26.6, 30.8],
  newchat: [30.8, 35.6],
  palette: [35.6, 40.2],
  settings: [40.2, 44.8],
  reveal: [44.8, 51.6],
  title: [51.6, 59.0],
} as const;
type Beat = keyof typeof BEATS;

export const SCENES = defineScenes(
  Object.fromEntries(Object.entries(BEATS).map(([k, [a, b]]) => [k, { seconds: b - a }])) as Record<Beat, { seconds: number }>,
  { fps: FPS },
);

const io = Easing.inOutCubic;

function morphAt(s: number): Morph {
  return {
    seconds: s,
    rows: ramp(s, 5.5, 7.3, io),
    side: ramp(s, 5.5, 7.3, io),
    status: ramp(s, 10.2, 11.0, io),
    drafts: ramp(s, 13.2, 14.3, io),
    draftsOpen: ramp(s, 14.9, 15.35, Easing.outCubic) - ramp(s, 15.9, 16.3, Easing.inCubic),
    pinned: ramp(s, 17.5, 18.5, io),
    glass: ramp(s, 21.0, 23.0, Easing.inOutQuint),
    chat: ramp(s, 23.6, 24.7, Easing.linear),
    composer: ramp(s, 27.6, 28.8, Easing.linear),
    newchat: ramp(s, 31.2, 32.1, io) - ramp(s, 44.9, 45.8, io),
    newchatSkin: ramp(s, 32.9, 33.9, Easing.linear),
    palette: ramp(s, 36.0, 36.35, Easing.outCubic) - ramp(s, 40.2, 40.45, Easing.inCubic),
    paletteSkin: ramp(s, 37.0, 38.3, Easing.linear),
    settings: ramp(s, 40.6, 41.0, Easing.outCubic) - ramp(s, 44.3, 44.65, Easing.inCubic),
    settingsSkin: ramp(s, 41.7, 43.0, Easing.linear),
  };
}

interface Cam {
  t: number;
  fx: number;
  fy: number;
  z: number;
  ry: number;
  rx: number;
  dof: number;
  fw?: number;
  fh?: number;
}

const CAM: Cam[] = [
  { t: 0, fx: 720, fy: 450, z: 0.92, ry: -18, rx: 9, dof: 0, fw: 900, fh: 600 },
  { t: 4.0, fx: 720, fy: 450, z: 1.06, ry: -9, rx: 5, dof: 0, fw: 900, fh: 600 },
  { t: 5.4, fx: 140, fy: 330, z: 2.3, ry: 10, rx: 3, dof: 0.9, fw: 230, fh: 320 },
  { t: 9.0, fx: 140, fy: 350, z: 2.42, ry: 7, rx: 2, dof: 0.9, fw: 230, fh: 320 },
  { t: 10.0, fx: 140, fy: 768, z: 2.6, ry: 6, rx: -4, dof: 0.9, fw: 210, fh: 150 },
  { t: 12.0, fx: 140, fy: 774, z: 2.7, ry: 4, rx: -5, dof: 0.9, fw: 210, fh: 150 },
  { t: 13.0, fx: 140, fy: 200, z: 2.6, ry: 9, rx: 4, dof: 0.9, fw: 210, fh: 170 },
  { t: 16.2, fx: 140, fy: 230, z: 2.62, ry: 7, rx: 3, dof: 0.9, fw: 210, fh: 230 },
  { t: 17.2, fx: 140, fy: 360, z: 2.35, ry: 10, rx: 3, dof: 0.9, fw: 230, fh: 300 },
  { t: 20.0, fx: 140, fy: 370, z: 2.42, ry: 8, rx: 2, dof: 0.9, fw: 230, fh: 300 },
  { t: 21.2, fx: 860, fy: 430, z: 1.2, ry: -9, rx: 5, dof: 0.15, fw: 700, fh: 520 },
  { t: 23.4, fx: 940, fy: 210, z: 1.95, ry: -6, rx: 3, dof: 0.75, fw: 520, fh: 230 },
  { t: 26.0, fx: 900, fy: 300, z: 1.8, ry: -3, rx: 2, dof: 0.6, fw: 480, fh: 260 },
  { t: 27.3, fx: 856, fy: 802, z: 2.15, ry: -4, rx: -6, dof: 0.85, fw: 560, fh: 130 },
  { t: 30.4, fx: 880, fy: 806, z: 2.25, ry: 3, rx: -4, dof: 0.85, fw: 560, fh: 130 },
  { t: 31.6, fx: 856, fy: 470, z: 1.18, ry: -7, rx: 4, dof: 0.15, fw: 760, fh: 520 },
  { t: 35.2, fx: 856, fy: 480, z: 1.3, ry: -11, rx: 3, dof: 0.15, fw: 760, fh: 520 },
  { t: 36.2, fx: 856, fy: 300, z: 1.75, ry: -4, rx: 3, dof: 0.7, fw: 400, fh: 300 },
  { t: 39.8, fx: 856, fy: 300, z: 1.85, ry: 2, rx: 2, dof: 0.7, fw: 400, fh: 300 },
  { t: 41.2, fx: 900, fy: 345, z: 1.72, ry: -6, rx: 3, dof: 0.6, fw: 540, fh: 300 },
  { t: 44.2, fx: 930, fy: 355, z: 1.8, ry: 3, rx: 2, dof: 0.6, fw: 540, fh: 300 },
  { t: 45.6, fx: 720, fy: 450, z: 1.02, ry: -13, rx: 6, dof: 0 },
  { t: 51.0, fx: 720, fy: 450, z: 1.08, ry: -5, rx: 4, dof: 0 },
  { t: 53.0, fx: 720, fy: 450, z: 0.62, ry: 2, rx: 12, dof: 0 },
  { t: 59, fx: 720, fy: 450, z: 0.6, ry: 2, rx: 12, dof: 0 },
];

function camAt(s: number) {
  let i = 0;
  while (i < CAM.length - 2 && s > CAM[i + 1].t) i++;
  const a = CAM[i];
  const b = CAM[i + 1];
  const k = io(clamp01((s - a.t) / (b.t - a.t)));
  const f = (x: number, y: number) => lerp(x, y, k);
  return {
    fx: f(a.fx, b.fx),
    fy: f(a.fy, b.fy),
    z: f(a.z, b.z),
    ry: f(a.ry, b.ry) + noise1d(s * 0.35, "ry") * 1.6,
    rx: f(a.rx, b.rx) + noise1d(s * 0.3, "rx") * 1.0,
    rz: noise1d(s * 0.25, "rz") * 0.5,
    dof: f(a.dof, b.dof),
    fw: f(a.fw ?? 600, b.fw ?? 600),
    fh: f(a.fh ?? 400, b.fh ?? 400),
  };
}

function Backdrop({ s, cam }: { s: number; cam: ReturnType<typeof camAt> }) {
  const cell = 6;
  const w = 480 * cell;
  const h = 270 * cell;
  const px = -(cam.fx - 720) * 0.06;
  const py = -(cam.fy - 450) * 0.04;
  return (
    <AbsoluteFill style={{ background: "#01040a", overflow: "hidden" }}>
      <Aurora seconds={s} cell={cell} style={{ left: (1920 - w) / 2 + px, top: 1080 - h + 160 + py }} grid={1} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, #01040a26 0%, #01040a8c 70%, #01040add 100%)" }} />
    </AbsoluteFill>
  );
}

function Label({ s }: { s: number }) {
  const entries = Object.entries(BEATS) as [Beat, readonly [number, number]][];
  const [ta] = BEATS.title;
  const scrim = 1 - ramp(s, ta - 0.6, ta, Easing.inCubic);
  return (
    <>
      <div style={{ position: "absolute", left: -160, bottom: -200, width: 640, height: 360, opacity: scrim, background: "radial-gradient(closest-side, #01040a99, #01040a40 55%, #01040a00)" }} />
      {entries.map(([k, [a, b]]) => {
        if (k === "title") return null;
        const inn = ramp(s, a + 0.35, a + 0.85, Easing.outCubic);
        const out = ramp(s, b - 0.45, b - 0.05, Easing.inCubic);
        const v = inn * (1 - out);
        if (v <= 0.001) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 0, bottom: 62, padding: "8px 56px 8px 84px", borderRadius: "0 999px 999px 0", background: "linear-gradient(90deg,#01040aeb,#01040ad9 70%,#01040a00)", display: "flex", alignItems: "center", gap: 16, opacity: v, transform: `translateY(${(1 - inn) * 10 - out * 6}px)` }}>
            <div style={{ width: 40 * inn, height: 1, background: "#8fd6ff" }} />
            <div className="label">{LABELS[k as keyof typeof LABELS]}</div>
          </div>
        );
      })}
    </>
  );
}

function TitleCard({ s }: { s: number }) {
  const [a] = BEATS.title;
  const t = s - a;
  const bg = ramp(s, a - 0.6, a + 0.9, Easing.inOutCubic);
  if (bg <= 0) return null;
  // type "T3 Code", hold, delete it, type the name
  const from = TITLE.from;
  const name = TITLE.name;
  const t1 = 0.9;
  const typeA = Math.min(from.length, Math.max(0, Math.floor((t - t1) / 0.075)));
  const holdEnd = t1 + from.length * 0.075 + 0.6;
  const del = Math.min(from.length, Math.max(0, Math.floor((t - holdEnd) / 0.04)));
  const t2 = holdEnd + from.length * 0.04 + 0.25;
  const typeB = Math.min(name.length, Math.max(0, Math.floor((t - t2) / 0.08)));
  const done = t2 + name.length * 0.08;
  const text = t < t2 ? from.slice(0, Math.max(0, typeA - del)) : name.slice(0, typeB);
  const caretOn = t < done + 0.6 ? true : Math.floor((t - done) / 0.5) % 2 === 0;
  const sub = ramp(t, done + 0.15, done + 0.8, Easing.outCubic);
  const isName = t >= t2;
  const ink: CSSProperties = isName
    ? { background: "linear-gradient(180deg,#ffffff 20%,#bfe9ff 70%,#8fd6ff)", WebkitBackgroundClip: "text", color: "transparent" }
    : { color: "#f2f8ff" };
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "#01040a" }} />
      <Aurora seconds={s} cell={4} style={{ left: 0, top: 0 }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 47%, #01040ac4, #01040a40 70%, #0000)" }} />
      <div style={{ position: "absolute", top: 430, left: 0, right: 0, textAlign: "center" }}>
        <span className="title" style={ink}>
          {text}
        </span>
        <span className="caret" style={{ opacity: caretOn && t > 0.5 ? 1 : 0 }} />
      </div>
      <div className="subline" style={{ position: "absolute", top: 566, left: 0, right: 0, textAlign: "center", opacity: sub, transform: `translateY(${(1 - sub) * 8}px)` }}>
        {TITLE.line}
      </div>
      {TITLE.byline && (
        <div className="byline" style={{ position: "absolute", top: 632, left: 0, right: 0, textAlign: "center", opacity: ramp(t, done + 0.5, done + 1.1) * 0.9 }}>
          {TITLE.byline}
        </div>
      )}
    </AbsoluteFill>
  );
}

const FINAL: Morph = { ...STOCK, rows: 1, status: 1, drafts: 1, pinned: 1, glass: 1, chat: 1, composer: 1, newchatSkin: 1, side: 1 };

function Film() {
  const frame = useFrame();
  const fps = useFps();
  const s = frame / fps;
  const cam = camAt(s);
  let m = morphAt(s);
  // reveal: wipe back to stock, hold, then wipe forward to Hyperborea
  const [ra] = BEATS.reveal;
  const back = ramp(s, ra + 1.2, ra + 2.3, Easing.linear);
  const fwd = ramp(s, ra + 3.3, ra + 4.6, Easing.linear);
  const inReveal = s >= ra && s < BEATS.title[0] + 1;
  const stockShare = inReveal ? back * (1 - fwd) : 0;
  if (inReveal) m = { ...FINAL, seconds: s, newchat: m.newchat };
  const winOpacity = 1 - ramp(s, BEATS.title[0] - 0.4, BEATS.title[0] + 0.7, Easing.inCubic);

  const sx = 960;
  const sy = 540;
  const transform = `translate(${sx - cam.fx}px, ${sy - cam.fy}px) rotateY(${cam.ry}deg) rotateX(${cam.rx}deg) rotateZ(${cam.rz}deg) scale(${cam.z})`;
  const blur = cam.dof * 7;
  const mask = `radial-gradient(ellipse ${cam.fw * 1.2}px ${cam.fh * 1.3}px at ${cam.fx}px ${cam.fy}px, #000 60%, #0000 100%)`;

  const win = (key: string, mm: Morph) => {
    if (stockShare <= 0) return <Window key={key} m={mm} />;
    // stock window on top, revealed by a dithered wipe
    const clip = ditherClip(stockShare, WIN_W, WIN_H, 12, back < 1 ? [0.85, 0.5] : [-0.85, -0.5], 0.5);
    return (
      <div key={key} style={{ position: "relative", width: WIN_W, height: WIN_H }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Window m={mm} />
        </div>
        {clip !== "none" && (
          <div style={{ position: "absolute", inset: 0, clipPath: clip === "all" ? undefined : clip }}>
            <Window m={{ ...STOCK, seconds: s }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill className="film">
      <Score />
      <Backdrop s={s} cam={cam} />
      {winOpacity > 0 && (
        <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "50% 50%", opacity: winOpacity }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: WIN_W, height: WIN_H, transformOrigin: `${cam.fx}px ${cam.fy}px`, transform }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: "0 60px 140px -30px #000000f0, 0 0 0 1px #00000080" }} />
            {blur > 0.3 ? (
              <>
                <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px) brightness(0.86)` }}>{win("blur", m)}</div>
                <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask }}>{win("sharp", m)}</div>
              </>
            ) : (
              win("only", m)
            )}
          </div>
        </AbsoluteFill>
      )}
      <Label s={s} />
      <TitleCard s={s} />
    </AbsoluteFill>
  );
}

function Root() {
  return (
    <>
      <Composition id="hyperborea" component={Film} width={1920} height={1080} fps={FPS} scenes={SCENES} />
    </>
  );
}
registerRoot(Root);
