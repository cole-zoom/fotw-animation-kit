import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, Bar, Chip, camPath, ramp, pop, mix } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "Finally, how long the row's text is compared to the average. A match in
 * short text counts for more than the same match in long text. For example,
 * here is a big elephant scores higher than here is a big elephant standing by
 * the river at the edge of a park."
 * Slides in from HowRare, slides out into StatsMulti.
 *
 *   1  a row as a strip of token cells, its match (elephant) lit; a dashed line
 *      drops in at the table's average length (5.75 tokens)
 *   2  short text: its score bar runs out — longer than the row itself
 *   3  the same match in long text: a second strip rolls out far past the
 *      average; its bar is shorter
 *   4  the example: the words write into the cells as they're said, "here is a
 *      big elephant" and then "…standing by the river at the edge of a park"
 *
 * Code facts (lance 84d1681e0, scorer.rs): K1 = 1.2, B = 0.75, weight
 * (K1+1)·tf/(tf + K1·(1 − B + B·dl/avgdl)). The toy table is ours; bar lengths
 * are those formulas run on it (tools/bm25_toy.py): short 1.35 vs long 0.77;
 * avgdl 5.75 is the toy table's (ftsData.ts). No numbers on screen.
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.long;
const TEXT = FTS.text as readonly string[];
const BM = FTS.bm25 as readonly number[];
const SHORT = TEXT[8].split(" "); // here is a big elephant
const LONG = TEXT[9].split(" "); //  here is a big elephant standing by the river at the edge of a park
const AVG = FTS.avgdl as number;
const CELL = 150;
const PITCH = 162;
const LX = -900;
const cellX = (k: number) => LX + CELL / 2 + k * PITCH;
const AVG_X = LX + AVG * PITCH - (PITCH - CELL) / 2;
const SY = -170; // short strip
const LY = 90; // long strip
const BAR_OFF = 88;
const BAR_MAX = 980;
const MATCH = 4; // "elephant"
const FLOOR = 380;

export const HowLong: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();

  // when each cell appears / when its word is written in
  const shortIn = (k: number) => pop(f, Math.max(0, C.finally - 12) + k * 5, 180, 13); // there while the slide lands
  const longIn = (k: number) => pop(f, k <= MATCH ? C.same - 10 + k * 4 : C.longText - 4 + (k - MATCH - 1) * 6, 180, 13);
  const shortWord = (k: number) => C.here - 4 + k * 9;
  const longWord = (k: number) =>
    k <= MATCH ? C.here2 - 4 + k * 13 : interpolate(k, [5, 8, 14], [C.standing - 4, C.river - 4, C.park - 6]);
  const avgIn = ramp(f, C.average - 10, C.average + 14);
  const shortBar = ramp(f, C.short + 20, C.short + 62) * (BM[8] / BM[8]) * BAR_MAX;
  const longBar = ramp(f, C.longText + 50, C.longText + 90) * (BM[9] / BM[8]) * BAR_MAX;
  const higher = ramp(f, C.higher - 4, C.higher + 8) * (1 - ramp(f, C.higher + 40, C.higher + 70));

  const cam = camPath(f, [
    [0, { x: -480, y: -150, z: -380, rx: -6, ry: -12 }],
    [C.average - 20, { x: -430, y: -110, z: -320, rx: -8, ry: -6 }],
    [C.short + 10, { x: -380, y: -100, z: -200, rx: -8, ry: -3 }],
    [C.longText + 34, { x: 300, y: -20, z: 940, rx: -10, ry: 4 }],
    [C.example + 30, { x: -430, y: -150, z: -250, rx: -6, ry: -8 }],
    [C.higher + 20, { x: -380, y: -100, z: -150, rx: -8, ry: -3 }],
    [C.here2 + 10, { x: -280, y: -20, z: 350, rx: -10, ry: -2 }],
    [C.river, { x: 120, y: -30, z: 760, rx: -10, ry: 4 }],
    [C.park, { x: 280, y: -40, z: 950, rx: -10, ry: 5 }],
    [942, { x: 300, y: -40, z: 980, rx: -10, ry: 6 }],
  ]);

  const strip = (words: string[], y: number, inAt: (k: number) => number, wordAt: (k: number) => number, key: string) =>
    words.map((w, k) => {
      const t = inAt(k);
      const write = ramp(f, wordAt(k), wordAt(k) + 8);
      const hit = k === MATCH;
      return (
        <At key={`${key}${k}`} p={[cellX(k), y, mix(-500, 0, t)]} s={Math.max(0.01, 0.4 + 0.6 * t)} o={Math.min(1, t * 2)} name={`${key} cell ${k + 1}`}>
          <Slab w={CELL} h={90} d={26} tone={hit ? "hit" : "idle"} radius={12} glow={hit ? 0.5 : 0}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ opacity: hit ? 1 : write, transform: `translateY(${(1 - (hit ? 1 : write)) * 16}px)` }}>
                <Label size={w.length > 7 ? 26 : 32} color={hit ? LANCE.dark800 : LANCE.offwhite} fringe={hit ? 0 : 1}>
                  {w}
                </Label>
              </div>
            </div>
          </Slab>
        </At>
      );
    });

  return (
    <Stage name="How Long" cam={cam} enter={enter} exit={exit} floorY={FLOOR}>
      {/* the average length: a dashed line through both strips */}
      <At p={[AVG_X, -30, 40]} o={avgIn} name="Average length line">
        <div style={{ transform: `scaleY(${avgIn})`, transformOrigin: "50% 0" }}>
          <div style={{ width: 0, height: 560, borderLeft: `5px dashed ${LANCE.dark200}` }} />
        </div>
      </At>
      <At p={[AVG_X, -350, 50]} s={Math.max(0.01, pop(f, C.average - 2))} name="Average tag">
        <Chip text="average" size={30} tone="paper" d={14} />
      </At>

      {strip(SHORT, SY, shortIn, shortWord, "Short")}
      {strip(LONG, LY, longIn, longWord, "Long")}

      <At p={[LX, SY + BAR_OFF, 0]} anchor="left" name="Score · short">
        <Bar len={shortBar} h={40} glow={0.6 + 0.5 * higher} />
      </At>
      <At p={[LX, LY + BAR_OFF, 0]} anchor="left" name="Score · long">
        <Bar len={longBar} h={40} glow={0.35} />
      </At>
    </Stage>
  );
};

export default HowLong;
