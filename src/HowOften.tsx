import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK } from "./lanceFonts";
import { chroma } from "./retro";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, camPath, ramp, pop, mix, mixV, mixColor, V3 } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "First, how often your query terms show up in the row. A row that says
 * elephant five times scores higher than a row that says it once."
 * Slides in from RankMachine, slides out into HowRare.
 *
 *   1  two rows fly in: the 5× elephant row and the 1× row; their elephants light
 *   2  the 5× row's elephants pop off one at a time and stack into a tower. Each
 *      block is the real score that mention adds (FTS.tfInc: 1.04, 0.40, 0.21,
 *      0.13, 0.09), so the tower is taller, but nowhere near 5× (BM25 saturates)
 *   3  the 1× row's one elephant makes its own tower: the first block alone
 *
 * Code facts (lance 84d1681e0, scorer.rs): K1 = 1.2, B = 0.75, weight
 * (K1+1)·tf/(tf + K1·(1 − B + B·dl/avgdl)). The toy table is ours; block heights
 * are those formulas run on it (tools/bm25_toy.py). No numbers on screen.
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.often;
const TEXT = FTS.text as readonly string[];
const INC = FTS.tfInc as readonly number[];
const SIZE = 42;
const CH = SIZE * 0.5; // approx Aeonik advance
const PAD = SIZE * 0.8;
const ROW_H = 100;
const LEFT = -1000;
const ROWS = [
  { text: TEXT[2], y: -230 }, // "elephant herd: elephant, elephant, elephant, elephant" — 5×
  { text: TEXT[5], y: 0 }, //   "one elephant crossed the road" — 1×
];
const rowWidth = (t: string) => Math.round(t.length * CH + PAD * 2 + 20);
const isEle = (w: string) => w.toLowerCase().startsWith("elephant");
/** word centres (x) inside a row, from the left edge of the frame */
const wordXs = (t: string) => {
  const out: number[] = [];
  let c = 0;
  for (const w of t.split(" ")) {
    out.push(LEFT + PAD + (c + w.replace(/[,:]/g, "").length / 2) * CH);
    c += w.length + 1;
  }
  return out;
};
const BASE = 330; // floor
const K = 270; // block height per unit of score
const GAP = 8;
const TOWER_X = [470, 780];
const BLOCK_W = 240;

export const HowOften: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const lit = ramp(f, C.terms - 6, C.terms + 10);
  // when each elephant leaves its row: 5× row one by one on "five", the 1× row's after "higher"
  const leave = [ROWS[0].text, ROWS[1].text].map((t, r) => {
    let k = 0;
    return t.split(" ").map((w) => (isEle(w) ? (r === 0 ? C.five - 6 + 15 * k++ : C.higher + 4) : -1));
  });

  const cam = camPath(f, [
    [0, { x: -560, y: -150, z: -220, rx: -6, ry: -10 }],
    [C.often, { x: -440, y: -120, z: -90, rx: -7, ry: -6 }],
    [C.five - 24, { x: -40, y: -50, z: 220, rx: -9, ry: -5 }],
    [C.higher, { x: 0, y: -40, z: 240, rx: -10, ry: -8 }],
    [453, { x: 20, y: -30, z: 250, rx: -10, ry: -9 }],
  ]);

  const blocks: React.ReactNode[] = [];
  ROWS.forEach((row, r) => {
    const xs = wordXs(row.text);
    let k = 0;
    let stackTop = BASE;
    row.text.split(" ").forEach((w, i) => {
      if (!isEle(w)) return;
      const h = INC[k] * K;
      const start = leave[r][i];
      const t = ramp(f, start, start + 26);
      if (t > 0) {
        const from: V3 = [xs[i], row.y, 30];
        const to: V3 = [TOWER_X[r], stackTop - h / 2, 0];
        const p = mixV(from, to, t);
        const arc = Math.sin(t * Math.PI);
        const land = pop(f, start + 26, 320, 11);
        const squash = t >= 1 ? 1 + 0.12 * (1 - land) : 1;
        blocks.push(
          <At key={`${r}-${k}`} p={[p[0], p[1] - 220 * arc, p[2] + 260 * arc]} r={[0, -20 * arc, 8 * arc]} s={mix(0.35, 1, t)} name={`Elephant block ${r === 0 ? "5×" : "1×"} #${k + 1}`}>
            <div style={{ transform: `scale(${1 / Math.sqrt(squash)}, ${squash})`, transformStyle: "preserve-3d" }}>
              <Slab w={BLOCK_W} h={h} d={150} tone="hit" radius={8} glow={0.55} outline={false}>
                {h >= 48 && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Label size={Math.min(38, h * 0.55)} color={LANCE.dark800} fringe={0}>
                      elephant
                    </Label>
                  </div>
                )}
              </Slab>
            </div>
          </At>,
        );
      }
      stackTop -= h + GAP;
      k++;
    });
  });

  return (
    <Stage name="How Often" cam={cam} enter={enter} exit={exit} floorY={BASE}>
      {/* tower footprints */}
      {TOWER_X.map((x, r) => (
        <At key={x} p={[x, BASE - 1, -75]} r={[90, 0, 0]} o={ramp(f, 30 + r * 8, 50 + r * 8)} name={`Tower pad ${r}`}>
          <div style={{ width: BLOCK_W + 60, height: 210, borderRadius: 14, border: `3px dashed ${LANCE.dark500}` }} />
        </At>
      ))}
      {ROWS.map((row, r) => {
        const t = pop(f, 6 + r * 12, 120, 15);
        const w = rowWidth(row.text);
        return (
          <At key={r} p={[LEFT + w / 2, row.y, mix(-700, 0, t)]} o={Math.min(1, t * 1.5)} name={`Row · ${row.text}`}>
            <Slab w={w} h={ROW_H} d={24} tone="card">
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: PAD }}>
                <div style={{ fontFamily: AEONIK, fontSize: SIZE, fontWeight: 500, color: LANCE.offwhite, whiteSpace: "nowrap", textShadow: chroma(0.8), lineHeight: 1 }}>
                  {row.text.split(" ").map((x, i) => {
                    const gone = leave[r][i] >= 0 && f >= leave[r][i];
                    const c = isEle(x) ? (gone ? LANCE.dark500 : mixColor(LANCE.offwhite, LANCE.orange400, lit)) : undefined;
                    return (
                      <span key={i} style={{ color: c }}>
                        {x}
                        {" "}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Slab>
          </At>
        );
      })}
      {blocks}
    </Stage>
  );
};

export default HowOften;
