import type { CSSProperties, ReactNode } from "react";

const P: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  filter: <path d="M3 6h18M7 12h10M10 18h4" />,
  folderPlus: (
    <>
      <path d="M12 10v6M9 13h6" />
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </>
  ),
  pen: (
    <>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.4 2.6a1 1 0 0 1 3 3l-9 9a2 2 0 0 1-.85.5l-2.9.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.85z" />
    </>
  ),
  right: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  branch: (
    <>
      <path d="M6 3v12" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </>
  ),
  pr: (
    <>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7M6 9v12" />
    </>
  ),
  laptop: (
    <>
      <path d="M18 5a2 2 0 0 1 2 2v8.5a2 2 0 0 0 .2.9l1.07 2.13a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.07-2.13a2 2 0 0 0 .21-.9V7a2 2 0 0 1 2-2z" />
      <path d="M20 16H4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M12 17v5" />
      <path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2v.8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.8a2 2 0 0 0-1.1-1.8l-1.8-.9A2 2 0 0 1 15 10.8V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </>
  ),
  gear: (
    <>
      <path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chart: <path d="M18 20V10M12 20V4M6 20v-6" />,
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </>
  ),
  clip: <path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l8.6-8.6A4 4 0 1 1 18 8.8l-8.6 8.6a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
  mic: (
    <>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
    </>
  ),
  up: <path d="m5 12 7-7 7 7M12 19V5" />,
  panel: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </>
  ),
  left: <path d="m12 19-7-7 7-7M19 12H5" />,
  arrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
  term: <path d="m4 17 6-6-6-6M12 19h8" />,
  ban: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m5.3 5.3 13.4 13.4" />
    </>
  ),
  dashed: <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 3" />,
  layoutA: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </>
  ),
  layoutB: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 15h18" />
    </>
  ),
  layoutC: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </>
  ),
  draft: <path d="M12 20h9M16.4 3.6a1 1 0 0 1 3 3L7.4 18.6a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z" />,
};

export function Icon({
  name,
  size = 16,
  color = "currentColor",
  stroke = 1.75,
  style,
}: {
  name: keyof typeof P | string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flex: "none", ...style }}
    >
      {P[name]}
    </svg>
  );
}

/** Claude's spark mark, drawn as spokes. */
export function Spark({ size = 14, color = "#d97757" }: { size?: number; color?: string }) {
  const spokes = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    const r1 = i % 2 ? 9.5 : 11;
    return <path key={i} d={`M12 12L${12 + Math.cos(a) * r1} ${12 + Math.sin(a) * r1}`} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={2.6} strokeLinecap="round" style={{ display: "block", flex: "none" }}>
      {spokes}
    </svg>
  );
}

/** T3's dashed working spinner, rotated by the caller's frame. */
export function Spinner({ size = 14, color, angle }: { size?: number; color: string; angle: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" style={{ display: "block", flex: "none", transform: `rotate(${angle}deg)` }}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3.2 3.9" />
    </svg>
  );
}
