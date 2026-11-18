import { Breath, Chime, Drone, Duck, Keystroke, Pad, Pattern, Riser, Whoosh } from "@archastro/clapper-core";

/**
 * Cold, slow and bright on top: a low D drone, an open D-major-add9 pad, a soft bell
 * figure under the walkthrough, small chimes where each part of the window freezes over,
 * one swell when the aurora first fills the window, a quiet beat while the window drops back
 * to stock, and the final swell into the title.
 * All times in seconds on the film's clock.
 */
import { FPS } from "./fps";
const f = (s: number) => Math.round(s * FPS);
const END = 59;
// one bar of the bell figure: 15 half-beat steps at 72 bpm
const BAR = (15 * 0.5 * 60) / 72;
const BELLS = "D5 . A5 . F#5 . E5 . D5 . B4 . A4? . .";
const BELLS_UP = "F#5 . B5 . A5 . E5 . F#5 . D5 . E5? . .";

// Moments the picture changes (keep in step with morphAt in index.tsx)
const MORPHS = [5.5, 10.2, 13.2, 17.5, 23.6, 27.6, 32.9, 37.0, 41.7];
const MOVES = [4.1, 9.5, 12.5, 16.7, 26.7, 35.7, 40.5];

// Title typing (keep in step with TitleCard)
const TITLE_AT = 51.6;
const FROM = "T3 Code";
const NAME = "Hyperborea";

export function Score() {
  const t1 = 0.9;
  const holdEnd = t1 + FROM.length * 0.075 + 0.6;
  const t2 = holdEnd + FROM.length * 0.04 + 0.25;
  const done = t2 + NAME.length * 0.08;
  return (
    <>
      <Drone notes={["D2", "A2"]} volume={0.05} durationInFrames={f(END)} fadeIn={f(2)} fadeOut={f(3)} cutoff={480} />
      <Pad notes={["D3", "A3", "E4", "F#4"]} wave="sine" volume={0.03} durationInFrames={f(END)} fadeIn={f(3)} fadeOut={f(3.5)} />
      <Breath at={f(21)} durationInFrames={f(30)} volume={0.025} cutoff={1800} />

      {/* bell figure under the walkthrough, 72 bpm, stops before the reveal */}
      <Pattern
        at={f(4.6)}
        bpm={72}
        step={0.5}
        steps="D5 . A5 . F#5 . E5 . D5 . B4 . A4? . ."
        repeat={3}
        wave="sine"
        volume={0.07}
        reverb={0.55}
        humanize={0.08}
        name="bells"
      />
      {/* after the aurora: the figure climbs on alternate bars so six bars don't repeat note for note */}
      <Pattern
        at={f(4.6 + BAR * 3)}
        bpm={72}
        step={0.5}
        steps={`${BELLS_UP} ${BELLS} ${BELLS_UP}`}
        repeat={1}
        wave="sine"
        volume={0.07}
        reverb={0.55}
        humanize={0.08}
        name="bells-late"
      />
      {/* a higher answer once the aurora is in the window */}
      <Pattern
        at={f(23.9)}
        bpm={72}
        step={1}
        steps="F#6? . . . E6? . . . A6? . . . E6? . . ."
        repeat={2}
        wave="sine"
        volume={0.035}
        reverb={0.7}
        name="answer"
      />
      {/* last answer phrase ends before the title chime */}
      <Pattern at={f(50.57)} bpm={72} step={1} steps="F#6? . . . E6? . . ." repeat={1} wave="sine" volume={0.035} reverb={0.7} name="answer-end" />

      {MORPHS.map((s, i) => (
        <Chime key={`m${i}`} at={f(s)} notes={i % 2 ? ["E6", "B6"] : ["A5", "E6"]} spacing={f(0.06)} volume={0.045} />
      ))}
      {MOVES.map((s, i) => (
        <Whoosh key={`w${i}`} at={f(s)} durationInFrames={f(1.1)} volume={0.035} from={300} to={1400} name={`mv${i}`} />
      ))}

      {/* the aurora fills the window */}
      <Riser at={f(19.6)} durationInFrames={f(1.8)} volume={0.032} from={200} to={1600} />
      <Chime at={f(21.4)} notes={["D5", "A5", "F#6", "E6"]} spacing={f(0.09)} volume={0.08} name="aurora" />

      {/* reveal: drop to stock is quiet, then swell back */}
      <Duck at={f(45.9)} durationInFrames={f(1.9)} depth={0.45} attack={f(0.5)} release={f(0.6)} />
      <Riser at={f(46.9)} durationInFrames={f(1.3)} volume={0.05} from={250} to={2000} name="back" />
      <Chime at={f(48.15)} notes={["D4", "A4", "F#5", "E6", "A6"]} spacing={f(0.07)} volume={0.085} name="reveal" />
      <Whoosh at={f(51.0)} durationInFrames={f(1.4)} volume={0.04} from={1200} to={250} name="out" />

      {/* typing the title */}
      {Array.from({ length: FROM.length }, (_, i) => (
        <Keystroke key={`a${i}`} at={f(TITLE_AT + t1 + (i + 1) * 0.075)} volume={0.12} seed={i} space={FROM[i] === " "} />
      ))}
      {Array.from({ length: FROM.length }, (_, i) => (
        <Keystroke key={`d${i}`} at={f(TITLE_AT + holdEnd + (i + 1) * 0.04)} volume={0.07} seed={40 + i} />
      ))}
      {Array.from({ length: NAME.length }, (_, i) => (
        <Keystroke key={`b${i}`} at={f(TITLE_AT + t2 + (i + 1) * 0.08)} volume={0.12} seed={80 + i} />
      ))}
      <Chime at={f(TITLE_AT + done + 0.05)} notes={["D5", "A5", "E6", "F#6"]} spacing={f(0.11)} volume={0.07} name="title" />
    </>
  );
}
