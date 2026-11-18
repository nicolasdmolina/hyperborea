import type { CSSProperties, ReactNode } from "react";
import { Aurora } from "./aurora";
import { ACTIVE, CHAT, DRAFTS, PINNED, PROJECTS, SETTINGS, SETTLED_COUNT, type Thread, WORKING } from "./data";
import { Icon, Spark, Spinner } from "./icons";
import { clamp01, ditherClip, lerp, mixColor } from "./util";

/** How far each part of the window has turned from stock T3 Code (0) into Hyperborea (1). */
export interface Morph {
  rows: number;
  status: number;
  drafts: number;
  draftsOpen: number;
  pinned: number;
  glass: number;
  chat: number;
  composer: number;
  newchat: number;
  newchatSkin: number;
  /** sidebar colours go icy with the first sidebar beat, before the aurora floods the window */
  side: number;
  palette: number;
  paletteSkin: number;
  settings: number;
  settingsSkin: number;
  seconds: number;
}

export const STOCK: Morph = {
  rows: 0, status: 0, drafts: 0, draftsOpen: 0, pinned: 0, glass: 0, chat: 0, composer: 0,
  newchat: 0, newchatSkin: 0, side: 0, palette: 0, paletteSkin: 0, settings: 0, settingsSkin: 0, seconds: 0,
};

export const WIN_W = 1440;
export const WIN_H = 900;
const SB = 272;
const FONT = '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif';
const MONO = '"SF Mono", ui-monospace, Menlo, monospace';

const abs = (x: number, y: number, extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/** Two looks of the same box, swapped by a dithered pixel wipe. */
export function Swap({
  t, w, h, cell = 6, dir = [0.8, 0.6], render, style,
}: {
  t: number; w: number; h: number; cell?: number; dir?: [number, number];
  render: (hyper: boolean) => ReactNode; style?: CSSProperties;
}) {
  const clip = ditherClip(t, w, h, cell, dir);
  const box: CSSProperties = { position: "absolute", inset: 0 };
  return (
    <div style={{ position: "absolute", width: w, height: h, ...style }}>
      {clip !== "all" && <div style={box}>{render(false)}</div>}
      {clip !== "none" && <div style={{ ...box, clipPath: clip === "all" ? undefined : clip }}>{render(true)}</div>}
    </div>
  );
}

function Mono({ p, size = 14 }: { p: string; size?: number }) {
  const pr = PROJECTS[p];
  return (
    <div style={{ width: size, height: size, borderRadius: 3.5, background: pr.bg, color: pr.fg, font: `700 ${size * 0.46}px ${MONO}`, display: "grid", placeItems: "center", letterSpacing: "-0.02em", flex: "none" }}>
      {pr.mono}
    </div>
  );
}

// ---------- sidebar ----------

const ROW_X = 8;
const ROW_W = SB - 16;

function rowHeight(rows: number) {
  return lerp(68, 54, rows);
}

function statusColor(s: Thread["status"], g: number) {
  if (s === "done") return mixColor("#4ade80", "#7ee2b8", g);
  if (s === "input") return mixColor("#60a5fa", "#8fd6ff", g);
  if (s === "working") return mixColor("#60a5fa", "#6fc3ff", g);
  return "#888";
}

function Row({ th, y, m, rowsT, opacity = 1, draft = false }: { th: Thread; y: number; m: Morph; rowsT: number; opacity?: number; draft?: boolean }) {
  const g = Math.max(m.glass, m.side);
  const r = rowsT;
  const s = m.status;
  const text = mixColor("#ededed", "#e8f4ff", g);
  const muted = mixColor("#8f8f8f", "#93abc6", g);
  const pinW = th.pinned ? 16 * (1 - m.pinned) : 0;
  const h = draft ? 54 : rowHeight(r);
  const sc = statusColor(th.status, g);
  const angle = m.seconds * 240;
  // status label on line 1 (stock) collapses to an icon beside the time (hyper)
  const labelText = th.status === "done" ? "Done" : th.status === "input" ? "Input" : th.status === "working" ? "Working" : "";
  const sel = !!th.current;
  const topY = 7;
  const titleY = draft ? 27 : lerp(25, 28, r);
  const botY = lerp(45, topY, r);
  const showTime = th.status ? s : 1; // stock hides the time when a status label is shown
  const timeColor = th.status === "working" ? sc : muted;
  return (
    <div style={{ ...abs(ROW_X, y), width: ROW_W, height: h, opacity, overflow: "hidden", borderRadius: lerp(8, 10, g) }}>
      {sel && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "#1d1d1d", opacity: 1 - g }} />
          <div style={{ position: "absolute", inset: 0, opacity: g, background: "linear-gradient(90deg,#8fd6ff52,#4f9dff1f 60%,#4f9dff00)", boxShadow: "inset 0 -14px 22px -16px #3f9cff8c,inset 0 1px 0 #ffffff0a" }} />
        </>
      )}
      {draft && <div style={{ position: "absolute", inset: 0, background: "#bfe9ff08", opacity: g }} />}
      <div style={abs(10, 9)}><Mono p={th.project} /></div>
      {th.pinned && pinW > 0.5 && (
        <div style={{ ...abs(30, 8), opacity: 1 - m.pinned }}><Icon name="pin" size={13} color={muted} /></div>
      )}
      <div style={{ ...abs(30 + pinW, topY), font: `400 12px/16px ${FONT}`, color: muted, whiteSpace: "nowrap" }}>{PROJECTS[th.project].name}</div>
      {/* right cluster */}
      <div style={{ ...abs(0, topY), right: 10, left: "auto", display: "flex", alignItems: "center", gap: 6, height: 16, font: `400 12px/16px ${FONT}`, color: muted }}>
        {labelText && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: sc }}>
            {th.status === "working" ? <Spinner color={sc} angle={angle} size={13} /> : <Icon name={th.status === "done" ? "check" : "help"} size={13} color={sc} />}
            <span style={{ display: "inline-block", maxWidth: 60 * (1 - s), opacity: 1 - s, overflow: "hidden", whiteSpace: "nowrap", fontWeight: 500 }}>{labelText}</span>
          </div>
        )}
        {th.age && (
          <span style={{ display: "inline-block", maxWidth: th.status && th.status !== "working" ? 40 * showTime : 40, opacity: th.status && th.status !== "working" ? showTime : 1, overflow: "hidden", color: timeColor, fontVariantNumeric: "tabular-nums" }}>{th.age}</span>
        )}
        {!draft && <span style={{ display: "inline-block", width: 19 * r }} />}
        {draft && <Icon name="draft" size={12} color={muted} />}
      </div>
      {!draft && <div style={{ ...abs(0, botY), right: 10, left: "auto" }}><Spark size={13} /></div>}
      <div
        style={{
          ...abs(10, titleY),
          width: ROW_W - 20,
          font: `${Math.round(lerp(500, 400, r))} 14px/18px ${FONT}`,
          color: sel ? "#f4faff" : text,
          whiteSpace: "nowrap",
          overflow: "hidden",
          WebkitMaskImage: `linear-gradient(90deg,#000 calc(100% - ${32 * r}px),${r > 0.02 ? "#0000" : "#000"})`,
        }}
      >
        {th.title}
      </div>
      {!draft && (
        <>
          {/* branch line fades and slides up under the title */}
          <div style={{ ...abs(10, 45 - 8 * r), display: "flex", alignItems: "center", gap: 5, font: `400 12px/16px ${FONT}`, color: muted, opacity: 1 - clamp01(r * 1.6) }}>
            <Icon name="branch" size={12} color={muted} />
            {th.branch}
          </div>
          <div style={{ ...abs(0, botY), right: 10 + 19 + 30 * r, left: "auto", display: "flex", alignItems: "center", gap: 6, height: 16, color: muted, font: `400 12px/16px ${FONT}` }}>
            {th.prs && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, opacity: 1 - clamp01(r * 1.8) }}>
                <Icon name="pr" size={12} color={muted} />
                {th.prs}
              </span>
            )}
            <span style={{ opacity: 1 - clamp01(r * 1.4) }}><Icon name="laptop" size={13} color={muted} /></span>
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({ y, label, count, chevron, m, opacity = 1, hover = 0 }: { y: number; label: string; count?: number; chevron?: "right" | "down"; m: Morph; opacity?: number; hover?: number }) {
  const muted = mixColor("#9a9a9a", "#93abc6", Math.max(m.glass, m.side));
  return (
    <div style={{ ...abs(10, y), width: SB - 20, height: 32, display: "flex", alignItems: "center", padding: "0 8px", boxSizing: "border-box", font: `500 12px/1 ${FONT}`, color: hover ? mixColor("#93abc6", "#e8f4ff", hover) : muted, opacity, borderRadius: 6, background: hover ? `rgba(191,233,255,${0.08 * hover})` : undefined }}>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && <span style={{ fontWeight: 400, fontVariantNumeric: "tabular-nums", marginRight: chevron ? 6 : 0 }}>{count}</span>}
      {chevron && <Icon name={chevron} size={12} color={muted} />}
    </div>
  );
}

function Sidebar({ m }: { m: Morph }) {
  const g = Math.max(m.glass, m.side);
  const muted = mixColor("#9a9a9a", "#93abc6", g);
  const text = mixColor("#ededed", "#e8f4ff", g);
  const els: ReactNode[] = [];
  let y = 112;
  let ri = 0;
  const rl = () => clamp01(m.rows * 1.45 - (ri++) * 0.07); // later rows follow a beat behind
  // Drafts: stock shows each draft row then a divider; Hyperborea folds them under one header.
  const dh = 32 * m.drafts;
  if (m.drafts > 0.01) {
    els.push(<SectionHeader key="dh" y={y} label="Drafts" count={DRAFTS.length} chevron={m.draftsOpen > 0.5 ? "down" : "right"} m={m} opacity={m.drafts} hover={m.draftsOpen} />);
  }
  y += dh;
  const fold = m.drafts * (1 - m.draftsOpen);
  DRAFTS.forEach((d, i) => {
    const h = 58 * (1 - fold);
    if (h > 0.5)
      els.push(
        <div key={`d${i}`} style={{ position: "absolute", left: 0, top: y, width: SB, height: h, overflow: "hidden" }}>
          <Row th={d} y={0} m={m} rowsT={m.rows} draft opacity={clamp01(1 - fold * 1.6)} />
        </div>,
      );
    y += h;
  });
  const div = 17 * (1 - m.drafts);
  if (div > 0.5) {
    els.push(<div key="div" style={{ ...abs(18, y + 8), width: SB - 36, height: 1, background: "#262626", opacity: 1 - m.drafts }} />);
  }
  y += div;
  const ph = 38 * m.pinned;
  if (m.pinned > 0.01) els.push(<SectionHeader key="ph" y={y + 6 * m.pinned - 6} label="Pinned" m={m} opacity={m.pinned} />);
  y += ph;
  PINNED.forEach((t, i) => {
    const r = rl();
    els.push(<Row key={`p${i}`} th={t} y={y} m={m} rowsT={r} />);
    y += rowHeight(r) + 4;
  });
  if (m.pinned > 0.01) els.push(<SectionHeader key="ah" y={y + 6 * m.pinned - 6} label="Active" m={m} opacity={m.pinned} />);
  y += ph;
  ACTIVE.forEach((t, i) => {
    const r = rl();
    els.push(<Row key={`a${i}`} th={t} y={y} m={m} rowsT={r} />);
    y += rowHeight(r) + 4;
  });
  const step = rowHeight(m.rows) + 4;
  // bottom group
  const foot = WIN_H - 44;
  const settled = foot - 38;
  const workRows = WORKING.length * step;
  const workTop = settled - workRows - 4;
  const workHead = workTop - 34;
  return (
    <div style={{ ...abs(0, 0), width: SB, height: WIN_H }}>
      <div style={{ position: "absolute", inset: 0, background: "#070707", opacity: 1 - g, borderRight: "1px solid #1c1c1c" }} />
      {/* icy sidebar before the aurora reaches the window */}
      <div style={{ position: "absolute", inset: 0, opacity: m.side * (1 - m.glass), background: "linear-gradient(180deg,#0a1b30,#06111f 60%,#081a2e)", borderRight: "1px solid #17324f" }} />
      <div style={{ position: "absolute", inset: 0, opacity: g, background: "rgba(3,9,20,.38)", backdropFilter: "blur(22px) saturate(1.3)", borderRight: "1px solid #0a1220" }} />
      {/* traffic lights + title row */}
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <div key={c} style={{ ...abs(18 + i * 20, 16), width: 12, height: 12, borderRadius: 6, background: c }} />
      ))}
      <div style={{ ...abs(16, 44), display: "flex", alignItems: "center", gap: 10, font: `600 14px/20px ${FONT}`, color: text }}>
        <Icon name="panel" size={16} color={muted} />
        <span>T3 Code</span>
        <Icon name="left" size={15} color={muted} />
        <Icon name="arrowRight" size={15} color={muted} />
        <span style={{ font: `500 10.5px/1 ${FONT}`, padding: "3px 6px", borderRadius: 5, background: mixColor("#262626", "#1f4f86", g), color: mixColor("#c4c4c4", "#d6efff", g) }}>Nightly</span>
      </div>
      <div style={{ ...abs(16, 78), width: SB - 32, height: 26, display: "flex", alignItems: "center", gap: 8, font: `400 14px/20px ${FONT}`, color: muted }}>
        <Icon name="search" size={15} color={muted} />
        <span style={{ flex: 1 }}>Search</span>
        <Icon name="filter" size={15} color={muted} />
        <Icon name="folderPlus" size={15} color={muted} />
        <Icon name="pen" size={15} color={muted} />
      </div>
      <div style={{ ...abs(0, 0), width: SB, height: workHead - 2, overflow: "hidden" }}>{els}</div>
      <SectionHeader y={workHead} label="Working" count={WORKING.length} chevron="down" m={m} />
      {WORKING.map((t, i) => (
        <Row key={`w${i}`} th={t} y={workTop + i * step} m={m} rowsT={m.rows} />
      ))}
      <SectionHeader y={settled} label="Settled" count={SETTLED_COUNT} chevron="right" m={m} />
      <div style={{ ...abs(18, foot + 12), width: SB - 36, display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name="gear" size={15} color={muted} />
        <Icon name="pr" size={15} color={muted} />
        <Icon name="chart" size={15} color={muted} />
        <span style={{ flex: 1 }} />
        <Icon name="refresh" size={15} color={muted} />
      </div>
    </div>
  );
}

// ---------- main pane ----------

const MAIN_W = WIN_W - SB;
const COL_W = 700;
const COL_X = SB + (MAIN_W - COL_W) / 2;

function Composer({ m, hyper, button }: { m: Morph; hyper: boolean; button: "stop" | "send" }) {
  const g = hyper ? 1 : 0;
  const muted = hyper ? "#8ea6c2" : "#8a8a8a";
  const fresh = m.newchat;
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden" }}>
      {hyper ? (
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: `linear-gradient(90deg,#8fd6ff30,#4f9dff12 60%,#4f9dff05),rgba(6,16,30,${lerp(0.62, 0.8, fresh)})`, boxShadow: "inset 0 -18px 28px -20px #3f9cff66,inset 0 1px 0 #ffffff0d, inset 0 0 0 1px #bfe9ff1f", backdropFilter: "blur(18px) saturate(1.2)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#141414", boxShadow: "inset 0 0 0 1px #262626" }} />
      )}
      <div style={{ ...abs(18, 16), font: `400 14.5px/20px ${FONT}`, color: hyper ? "#7f95ad" : "#7a7a7a" }}>{CHAT.placeholder}</div>
      <div style={{ ...abs(16, 66) }}><Icon name="clip" size={16} color={muted} /></div>
      <div style={{ ...abs(0, 60), right: 12, left: "auto", display: "flex", alignItems: "center", gap: 12, font: `500 13.5px/1 ${FONT}`, color: hyper ? "#e2f0fc" : "#e5e5e5" }}>
        <Spark size={14} />
        <span>{CHAT.model}</span>
        <Icon name="mic" size={15} color={muted} />
        <SendButton hyper={hyper} kind={button} g={g} />
      </div>
    </div>
  );
}

function SendButton({ hyper, kind }: { hyper: boolean; kind: "stop" | "send"; g: number }) {
  const size = 30;
  let bg: string;
  let shadow = "none";
  if (!hyper) bg = kind === "stop" ? "#dc2626e6" : "#3b82f6";
  else {
    const k = kind === "stop" ? "#ff8b8b80,#ff8b8b26 60%,#c4404026" : "#8fd6ff80,#4f9dff26 60%,#2a6fd026";
    const kg = kind === "stop" ? "#ff9d9dcc" : "#9adaffcc";
    const kr = kind === "stop" ? "#ffb4b433" : "#bfe9ff33";
    bg = `radial-gradient(100% 60% at 50% 0%,#ffffff1f,#0000 70%),linear-gradient(150deg,${k}),#071a30`;
    shadow = `inset 0 1px 0 #ffffff26,inset 0 -8px 14px -10px ${kg},0 0 0 1px ${kr},0 4px 14px -6px ${kg}`;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: bg, boxShadow: shadow, display: "grid", placeItems: "center" }}>
      {kind === "stop" ? (
        <div style={{ width: 10, height: 10, borderRadius: 2, background: "#fff" }} />
      ) : (
        <Icon name="up" size={15} color="#fff" stroke={2.2} />
      )}
    </div>
  );
}

function UserBubble({ hyper }: { hyper: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: hyper ? 14 : 18,
        background: hyper ? "linear-gradient(90deg,#8fd6ff3d,#4f9dff1a 60%,#4f9dff0a),#0612209e" : "#262626",
        boxShadow: hyper ? "inset 0 -14px 22px -16px #3f9cff8c,inset 0 1px 0 #ffffff0a" : "none",
        font: `400 14.5px/21px ${FONT}`,
        color: hyper ? "#eef7ff" : "#ececec",
        padding: "10px 16px",
        boxSizing: "border-box",
      }}
    >
      {CHAT.user}
    </div>
  );
}

function Thread({ m }: { m: Morph }) {
  const g = m.glass;
  const text = mixColor("#e6e6e6", "#e2eef9", g);
  const muted = mixColor("#8a8a8a", "#8ea6c2", g);
  const strong = mixColor("#ffffff", "#f4fbff", g);
  const bubbleW = 470;
  return (
    <>
      <Swap
        t={m.chat}
        w={bubbleW}
        h={64}
        cell={5}
        style={{ left: COL_X + COL_W - bubbleW, top: 82 }}
        render={(hy) => <UserBubble hyper={hy} />}
      />
      <div style={{ ...abs(COL_X + 4, 168), display: "flex", alignItems: "center", gap: 8, font: `400 13px/18px ${FONT}`, color: muted }}>
        <Icon name="term" size={14} color={muted} />
        {CHAT.work}
      </div>
      <div style={{ ...abs(COL_X + 4, 202), width: COL_W - 8, font: `400 14.5px/23px ${FONT}`, color: text }}>
        <p style={{ margin: 0 }}>
          {CHAT.lead[0]}
          <b style={{ color: strong, fontWeight: 600 }}>{CHAT.lead[1]}</b>
          {CHAT.lead[2]}
        </p>
        <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
          {CHAT.bullets.map(([k, v]) => (
            <li key={k} style={{ marginBottom: 4 }}>
              <b style={{ color: strong, fontWeight: 600 }}>{k}</b> {v}
            </li>
          ))}
        </ul>
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 10,
            background: mixColor("#141414", "#050d1acc", g),
            boxShadow: `inset 0 0 0 1px ${mixColor("#232323", "#bfe9ff17", g)}`,
            font: `400 13px/19px ${MONO}`,
            color: mixColor("#d4d4d4", "#cfe6fb", g),
          }}
        >
          <span style={{ color: mixColor("#c084fc", "#8fd6ff", g) }}>for await</span> (
          <span style={{ color: mixColor("#c084fc", "#8fd6ff", g) }}>const</span> batch{" "}
          <span style={{ color: mixColor("#c084fc", "#8fd6ff", g) }}>of</span>{" "}
          <span style={{ color: mixColor("#60a5fa", "#9adaff", g) }}>search</span>(query)){" "}
          <span style={{ color: mixColor("#60a5fa", "#9adaff", g) }}>render</span>(batch);
        </div>
      </div>
    </>
  );
}

function NewChat({ m }: { m: Morph }) {
  const bw = 640;
  const bh = 230;
  const bx = SB + (MAIN_W - bw) / 2;
  const by = 230;
  return (
    <Swap
      t={m.newchatSkin}
      w={bw}
      h={bh}
      cell={6}
      style={{ left: bx, top: by }}
      render={(hy) => (
        <>
          {!hy && (
            <div style={{ ...abs(bw / 2 - 30, 26), opacity: clamp01(1 - m.newchatSkin * 1.6), width: 60, height: 60, borderRadius: 14, background: "#1c1c1c", boxShadow: "inset 0 0 0 1px #2e2e2e", display: "grid", placeItems: "center", font: `800 24px/1 ${FONT}`, letterSpacing: "-0.04em", color: "#e5e5e5" }}>
              T3
            </div>
          )}
          <div style={{ ...abs(0, 352 - by), width: bw, textAlign: "center", font: `500 31px/38px ${FONT}`, letterSpacing: "-0.01em", color: hy ? "#f2f9ff" : "#f2f2f2", textShadow: hy ? "0 2px 18px rgba(1,4,10,0.8)" : undefined }}>
            What should we work on?
          </div>
          <div style={{ ...abs(0, 398 - by), width: bw, textAlign: "center", font: `500 14px/20px ${FONT}`, color: hy ? "#e0eefa" : "#bdbdbd" }}>No project</div>
        </>
      )}
    />
  );
}

function Palette({ hyper }: { hyper: boolean }) {
  const muted = hyper ? "#8ea6c2" : "#8a8a8a";
  const text = hyper ? "#eef7ff" : "#ececec";
  const kbd = (k: string) => (
    <span style={{ font: `500 11px/1 ${FONT}`, padding: "4px 6px", borderRadius: 5, background: hyper ? "#bfe9ff0f" : "#262626", boxShadow: hyper ? "inset 0 0 0 1px #bfe9ff1c" : "inset 0 0 0 1px #333", color: hyper ? "#bfe9ff" : "#bdbdbd" }}>{k}</span>
  );
  const items = [
    { p: null as string | null, name: "No project", sub: "", key: "⌥⌘N" },
    ...Object.values(PROJECTS).map((p, i) => ({ p: p.id, name: p.name, sub: `${p.host} · ${p.path}`, key: `⌘${i + 1}` })),
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        overflow: "hidden",
        background: hyper ? "linear-gradient(160deg,#8fd6ff17,#0000 42%),#040b17f5" : "#121212",
        backdropFilter: hyper ? "blur(24px) saturate(1.3)" : undefined,
        boxShadow: hyper
          ? "inset 0 0 0 1px #bfe9ff1f, inset 0 1px 0 #ffffff12, 0 30px 80px -24px #000000f2"
          : "inset 0 0 0 1px #262626, 0 30px 80px -24px #000",
        font: `400 14px/20px ${FONT}`,
        color: text,
      }}
    >
      <div style={{ ...abs(18, 15), display: "flex", alignItems: "center", gap: 12, color: muted }}>
        <Icon name="left" size={15} color={muted} />
        <span>Search…</span>
      </div>
      <div style={{ ...abs(0, 50), width: "100%", height: 1, background: hyper ? "#bfe9ff12" : "#222" }} />
      <div style={{ ...abs(18, 62), font: `500 12px/16px ${FONT}`, color: muted, letterSpacing: hyper ? ".02em" : 0 }}>Projects</div>
      {items.map((it, i) => {
        const y = 84 + i * 48;
        const hl = i === 1;
        return (
          <div key={it.name} style={{ ...abs(8, y), width: 540 - 16, height: 44, borderRadius: 9, background: hl ? (hyper ? "linear-gradient(90deg,#8fd6ff2b,#4f9dff10 70%,#4f9dff00)" : "#222") : undefined, boxShadow: hl && hyper ? "inset 0 1px 0 #ffffff08" : undefined }}>
            <div style={abs(12, it.sub ? 6 : 13)}>{it.p ? <Mono p={it.p} size={15} /> : <Icon name="dashed" size={16} color={muted} />}</div>
            <div style={{ ...abs(38, it.sub ? 3 : 12), whiteSpace: "nowrap" }}>{it.name}</div>
            {it.sub && <div style={{ ...abs(38, 22), font: `400 12px/16px ${FONT}`, color: muted, whiteSpace: "nowrap" }}>{it.sub}</div>}
            <div style={{ ...abs(0, 13), right: 14, left: "auto", font: `400 12px/16px ${FONT}`, color: muted }}>{it.key}</div>
          </div>
        );
      })}
      <div style={{ ...abs(0, 84 + items.length * 48 + 6), width: "100%", height: 44, borderTop: `1px solid ${hyper ? "#bfe9ff14" : "#222"}`, background: hyper ? "#bfe9ff05" : "#0e0e0e", display: "flex", alignItems: "center", gap: 8, padding: "0 14px", boxSizing: "border-box", font: `400 13px/1 ${FONT}`, color: muted }}>
        {kbd("↑")}
        {kbd("↓")}
        <span style={{ marginRight: 8 }}>Navigate</span>
        {kbd("Enter")}
        <span style={{ marginRight: 8 }}>Select</span>
        {kbd("Esc")}
        <span>Close</span>
      </div>
    </div>
  );
}
export const PALETTE_H = 84 + 6 * 48 + 6 + 44;

function Toggle({ on, hyper }: { on: boolean; hyper: boolean }) {
  const track = hyper ? (on ? "linear-gradient(90deg,#4f9dff,#8fd6ff)" : "#bfe9ff1a") : on ? "#e5e5e5" : "#3a3a3a";
  const thumb = hyper ? (on ? "#f4fbff" : "#9cb3cc") : on ? "#171717" : "#a3a3a3";
  const shadow = hyper ? (on ? "inset 0 1px 0 #ffffff40,0 0 12px -2px #6fc3ff99" : "inset 0 0 0 1px #bfe9ff1f") : "none";
  return (
    <div style={{ width: 32, height: 18, borderRadius: 9, background: track, boxShadow: shadow, position: "relative" }}>
      <div style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: 7, background: thumb, boxShadow: hyper && on ? "0 1px 3px #01040a99" : undefined }} />
    </div>
  );
}

export const SET_W = 1040;
export const SET_H = 760;

function Settings({ hyper }: { hyper: boolean }) {
  const muted = hyper ? "#8ea6c2" : "#8a8a8a";
  const text = hyper ? "#e8f4ff" : "#ececec";
  const nav = ["General", "Appearance", "Chat", "Diffs & pull requests", "Keybindings", "Voice"];
  const nav2 = ["Providers", "Threads", "Browser", "Devices"];
  const card = (rows: { title: string; body: string; on: boolean }[], y: number) => (
    <div style={{ ...abs(300, y), width: 660, borderRadius: 12, background: hyper ? "#06101ecc" : "#121212", boxShadow: `inset 0 0 0 1px ${hyper ? "#bfe9ff17" : "#232323"}${hyper ? ", inset 0 1px 0 #ffffff08" : ""}` }}>
      {rows.map((r, i) => (
        <div key={r.title} style={{ position: "relative", height: 64, borderTop: i ? `1px solid ${hyper ? "#bfe9ff12" : "#1f1f1f"}` : undefined }}>
          <div style={{ ...abs(16, 13), font: `500 14px/20px ${FONT}`, color: text }}>{r.title}</div>
          <div style={{ ...abs(16, 34), font: `400 12px/16px ${FONT}`, color: muted }}>{r.body}</div>
          <div style={{ ...abs(0, 23), right: 16, left: "auto" }}><Toggle on={r.on} hyper={hyper} /></div>
        </div>
      ))}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        overflow: "hidden",
        background: hyper ? "linear-gradient(160deg,#8fd6ff14,#0000 40%),#030a16eb" : "#0f0f0f",
        boxShadow: hyper ? "inset 0 0 0 1px #bfe9ff1f, inset 0 1px 0 #ffffff12, 0 30px 80px -24px #000000f2" : "inset 0 0 0 1px #262626, 0 30px 80px -24px #000",
        color: text,
        font: `400 14px/20px ${FONT}`,
      }}
    >
      <div style={{ ...abs(0, 0), width: 240, height: "100%", background: hyper ? "#00000047" : "#0b0b0b", borderRight: `1px solid ${hyper ? "#ffffff0f" : "#1f1f1f"}` }} />
      <div style={{ ...abs(16, 16), width: 208, height: 32, borderRadius: 8, boxShadow: `inset 0 0 0 1px ${hyper ? "#bfe9ff1f" : "#262626"}`, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", boxSizing: "border-box", color: muted }}>
        <Icon name="search" size={14} color={muted} />
        Search
      </div>
      {nav.map((n, i) => (
        <div key={n} style={{ ...abs(12, 60 + i * 34), width: 216, height: 30, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box", color: i === 0 ? text : mixColor(muted, text, 0.5), background: i === 0 ? (hyper ? "linear-gradient(90deg,#8fd6ff47,#4f9dff1a 60%,#4f9dff08)" : "#1f1f1f") : undefined, boxShadow: i === 0 && hyper ? "inset 0 -14px 22px -16px #3f9cff8c,inset 0 1px 0 #ffffff0a" : undefined }}>{n}</div>
      ))}
      <div style={{ ...abs(24, 274), font: `500 12px/16px ${FONT}`, color: muted }}>Agents</div>
      {nav2.map((n, i) => (
        <div key={n} style={{ ...abs(12, 294 + i * 34), height: 30, display: "flex", alignItems: "center", padding: "0 12px", color: mixColor(muted, text, 0.5) }}>{n}</div>
      ))}
      <div style={{ ...abs(264, 18), display: "flex", gap: 10, color: muted }}>
        Settings <span>/</span> <span style={{ color: text }}>General</span>
      </div>
      <div style={{ ...abs(0, 54), left: 240, right: 0, height: 1, background: hyper ? "#bfe9ff12" : "#1f1f1f" }} />
      <div style={{ ...abs(300, 84), font: `600 16px/22px ${FONT}` }}>Sidebar</div>
      {card(SETTINGS, 118)}
      <div style={{ ...abs(300, 344), font: `600 16px/22px ${FONT}` }}>Confirmations</div>
      {card(
        [
          { title: "Unpin confirmation", body: "Ask before unpinning a thread from the pinned section.", on: false },
          { title: "Archive confirmation", body: "Require a second click before a thread is archived.", on: true },
        ],
        378,
      )}
    </div>
  );
}

/** The whole T3 Code window at 1440x900. */
export function Window({ m }: { m: Morph }) {
  const g = m.glass;
  const muted = mixColor("#8a8a8a", "#93abc6", g);
  const text = mixColor("#ececec", "#e8f4ff", g);
  const thread = 1 - m.newchat;
  const compY = lerp(WIN_H - 152, 438, m.newchat);
  const compX = COL_X - 10;
  const compW = COL_W + 20;
  return (
    <div style={{ position: "relative", width: WIN_W, height: WIN_H, overflow: "hidden", borderRadius: 14, background: "#0b0b0b", fontFamily: FONT }}>
      {g > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: g }}>
          <div style={{ position: "absolute", inset: 0, background: "#01040a" }} />
          <Aurora seconds={m.seconds} cell={4} style={{ left: (WIN_W - 1920) / 2, top: WIN_H - 1080 }} />
        </div>
      )}
      {/* frosted band behind messages */}
      <div style={{ ...abs(SB, 0), width: MAIN_W, height: WIN_H, opacity: g * thread, background: "linear-gradient(90deg,#01040a80,#01040ad1 24%,#01040ad1 76%,#01040a80)" }} />
      {/* new chat: soft dark pool behind the heading so it reads over the aurora */}
      <div style={{ ...abs(SB + MAIN_W / 2 - 380, 250), width: 760, height: 260, opacity: g * m.newchat, background: "radial-gradient(closest-side,#01040ab0,#01040a59 55%,#0000)" }} />
      <Sidebar m={m} />
      {/* main header */}
      <div style={{ ...abs(SB, 0), width: MAIN_W, height: 52, background: mixColor("#0b0b0b", "#02060e00", g), borderBottom: `1px solid ${mixColor("#1a1a1a", "#bfe9ff00", g)}` }} />
      <div style={{ ...abs(SB + 20, 16), display: "flex", alignItems: "center", gap: 8, font: `400 14px/20px ${FONT}`, color: muted }}>
        {thread > 0.5 ? (
          <>
            <Mono p={CHAT.project} />
            <span>{PROJECTS[CHAT.project].name}</span>
            <span>/</span>
            <span style={{ color: text, fontWeight: 500 }}>{CHAT.title}</span>
          </>
        ) : (
          <>
            <Icon name="dashed" size={15} color={muted} />
            <span>No project</span>
            <span>/</span>
            <span style={{ color: text, fontWeight: 500 }}>New thread</span>
          </>
        )}
      </div>
      <div style={{ ...abs(0, 16), right: 18, left: "auto", display: "flex", gap: 14 }}>
        <Icon name="layoutA" size={17} color={mixColor("#d4d4d4", "#8fd6ff", g)} />
        <Icon name="layoutB" size={17} color={muted} />
        <Icon name="layoutC" size={17} color={muted} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: thread }}>{thread > 0.01 && <Thread m={m} />}</div>
      <div style={{ position: "absolute", inset: 0, opacity: m.newchat }}>{m.newchat > 0.01 && <NewChat m={m} />}</div>
      <Swap
        t={m.composer * (1 - m.newchat * (1 - m.newchatSkin))}
        w={compW}
        h={104}
        cell={6}
        style={{ left: compX, top: compY }}
        render={(hy) => <Composer m={m} hyper={hy} button={m.newchat > 0.5 ? "send" : "stop"} />}
      />
      <div style={{ ...abs(compX + 8, compY + 114), display: "flex", alignItems: "center", gap: 6, font: `400 12.5px/16px ${FONT}`, color: muted }}>
        <Icon name="laptop" size={13} color={muted} />
        {CHAT.host}
      </div>
      <div style={{ ...abs(0, compY + 114), left: "auto", right: WIN_W - (compX + compW - 8), display: "flex", alignItems: "center", gap: 6, font: `400 12.5px/16px ${FONT}`, color: muted }}>
        <Icon name="ban" size={13} color={muted} />
        Full access
      </div>
      {/* overlays */}
      {m.palette > 0.001 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: mixColor("#00000080", "#01040a99", m.paletteSkin), opacity: m.palette }} />
          <Swap
            t={m.paletteSkin}
            w={540}
            h={PALETTE_H}
            cell={6}
            dir={[0.3, 0.95]}
            style={{ left: SB + (MAIN_W - 540) / 2, top: 96 + 10 * (1 - m.palette), opacity: m.palette }}
            render={(hy) => <Palette hyper={hy} />}
          />
        </>
      )}
      {m.settings > 0.001 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: mixColor("#00000099", "#01040ab3", m.settingsSkin), opacity: m.settings }} />
          <Swap
            t={m.settingsSkin}
            w={SET_W}
            h={SET_H}
            cell={8}
            dir={[0.95, 0.3]}
            style={{ left: (WIN_W - SET_W) / 2, top: (WIN_H - SET_H) / 2 + 12 * (1 - m.settings), opacity: m.settings }}
            render={(hy) => <Settings hyper={hy} />}
          />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: `inset 0 0 0 1px ${mixColor("#ffffff1a", "#bfe9ff24", g)}`, pointerEvents: "none" }} />
    </div>
  );
}

export const LAYOUT = { SB, COL_X, COL_W, MAIN_W };
