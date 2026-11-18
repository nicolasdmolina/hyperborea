import { continueRender, delayRender, staticFile } from "@archastro/clapper-core";
import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";

/** The real Hyperborea scene: 48 frames of 480x270 stacked in one strip, 8 s loop. */
const FRAMES = 48;
const FW = 480;
const FH = 270;

let strip: HTMLImageElement | null = null;
let ready: Promise<void> | null = null;
function load() {
  if (!ready) {
    strip = new Image();
    strip.src = staticFile("aurora.webp");
    ready = strip.decode();
  }
  return ready;
}

export function auroraIndex(seconds: number) {
  return Math.floor(seconds * (FRAMES / 8)) % FRAMES;
}

/**
 * Draws the current scene frame onto a 480x270 canvas and scales it up with hard pixels.
 * cell = size of one scene pixel on screen. A 1px black grid sits on top, like the theme.
 */
export function Aurora({
  seconds,
  cell,
  style,
  grid = 1,
}: {
  seconds: number;
  cell: number;
  style?: CSSProperties;
  grid?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(() => !!strip && strip.complete && strip.naturalWidth > 0);
  useLayoutEffect(() => {
    if (ok) return;
    const h = delayRender("aurora strip");
    load().then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [ok]);
  const idx = auroraIndex(seconds);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!ok || !c || !strip) return;
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    g.drawImage(strip, 0, idx * FH, FW, FH, 0, 0, FW, FH);
  }, [ok, idx]);
  const w = FW * cell;
  const h = FH * cell;
  return (
    <div style={{ position: "absolute", width: w, height: h, ...style }}>
      <canvas
        ref={ref}
        width={FW}
        height={FH}
        style={{ width: w, height: h, imageRendering: "pixelated", display: "block" }}
      />
      {grid > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: grid,
            backgroundImage:
              "linear-gradient(90deg,#000 1px,transparent 1px),linear-gradient(0deg,#000 1px,transparent 1px)",
            backgroundSize: `${cell}px ${cell}px`,
          }}
        />
      )}
    </div>
  );
}
