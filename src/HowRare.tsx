import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK } from "./lanceFonts";
import { chroma } from "./retro";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, camPath, ramp, pop, glide, mix, mixColor, chipW } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "Next, it scores on how rare each word is. In most texts, big shows up in
 * far more rows than elephant, so a match on elephant counts for more."
 * Slides in from HowOften, slides out into HowLong.
 *
 *   1  the whole toy table (12 rows) as a wall; the two query words hover above it
 *   2  "big" lights lavender in every row that has it (10 of 12)
 *   3  "elephant" lights orange in its rows (4 of 12); big dims back
 *   4  the two words drop to the floor as weights, heights = real idf:
 *      big lands light, elephant lands heavy (≈ 5× the weight)
 *
 * Code facts (lance 84d1681e0, scorer.rs): idf = ln((N − n + 0.5)/(n + 0.5) + 1).
 * N = 12, n(big) = 10, n(elephant) = 4 (ftsData.ts df) → 0.21 vs 1.06. The toy
 * table is ours (tools/bm25_toy.py). No numbers on screen.
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.rare;
const TEXT = FTS.text as readonly string[];
const N = TEXT.length;
const DF = FTS.df as { big: number; elephant: number };
const idf = (n: number) => Math.log((N - n + 0.5) / (n + 0.5) + 1);
const IDF = { big: idf(DF.big), elephant: idf(DF.elephant) };
const SIZE = 30;
const CARD_W = 900;
const CARD_H = 78;
const colX = (i: number) => (i < 6 ? -470 : 470);
const rowY = (i: number) => -360 + (i % 6) * 94;
const has = (t: string, w: string) => t.toLowerCase().split(/[^a-z]+/).includes(w);
const BIG_ROWS = TEXT.map((t, i) => (has(t, "big") ? i : -1)).filter((i) => i >= 0);
const ELE_ROWS = TEXT.map((t, i) => (has(t, "elephant") ? i : -1)).filter((i) => i >= 0);
const FLOOR = 360;
const K = 300; // weight height per unit of idf
const WEIGHT_W = 330;
const WORDS = [
  { w: "big", tone: "big" as const, x: -260, rank: BIG_ROWS },
  { w: "elephant", tone: "hit" as const, x: 260, rank: ELE_ROWS },
];

export const HowRare: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const bigOn = (i: number) => {
    const k = BIG_ROWS.indexOf(i);
    return k < 0 ? 0 : ramp(f, C.big - 8 + k * 5, C.big + 4 + k * 5) * (1 - 0.7 * ramp(f, C.elephant - 4, C.elephant + 10));
  };
  const eleOn = (i: number) => {
    const k = ELE_ROWS.indexOf(i);
    return k < 0 ? 0 : ramp(f, C.elephant - 4 + k * 7, C.elephant + 8 + k * 7);
  };
  const wallBack = glide(f, C.match - 30, 70);
  const dropBig = C.match - 6;
  const dropEle = C.match + 20;
  const landEle = dropEle + 18;

  const base = camPath(f, [
    [0, { x: -470, y: -300, z: -260, rx: -4, ry: -14 }],
    [C.rare, { x: -230, y: -210, z: 40, rx: -6, ry: -8 }],
    [C.big - 10, { x: 0, y: -160, z: 300, rx: -8, ry: -2 }],
    [C.elephant + 30, { x: 40, y: -160, z: 300, rx: -8, ry: 6 }],
    [C.match + 6, { x: 0, y: 60, z: 160, rx: -15, ry: 3 }],
    [547, { x: 30, y: 90, z: 60, rx: -16, ry: 8 }],
  ]);
  const since = f - landEle;
  const shake = since >= 0 ? 16 * Math.exp(-since / 7) * Math.sin(since * 1.9) : 0;
  const cam = { ...base, y: (base.y ?? 0) + shake };

  return (
    <Stage name="How Rare" cam={cam} enter={enter} exit={exit} floorY={FLOOR}>
      {/* the wall: every row of the toy table */}
      {TEXT.map((t, i) => {
        const tin = pop(f, 4 + i * 4, 130, 15);
        const b = bigOn(i);
        const e = eleOn(i);
        const border = e > 0.01 ? mixColor(LANCE.dark500, LANCE.orange400, e) : mixColor(LANCE.dark500, LANCE.lavender, b);
        return (
          <At key={i} p={[colX(i), rowY(i) + 60 * wallBack, mix(-800, 0, tin) - 700 * wallBack]} o={Math.min(1, tin * 1.5) * (1 - 0.6 * wallBack)} name={`Row · ${t}`}>
            <Slab w={CARD_W} h={CARD_H} d={20} tone="card" glow={0.5 * e} style={{ border: `4px solid ${border}`, background: mixColor("#262220", e > 0.01 ? "#5a2c1c" : "#3d3446", Math.max(b, e)) }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: SIZE * 0.8 }}>
                <div style={{ fontFamily: AEONIK, fontSize: SIZE, fontWeight: 500, color: LANCE.dark200, whiteSpace: "nowrap", textShadow: chroma(0.7), lineHeight: 1 }}>
                  {t.split(" ").map((x, k) => {
                    const w = x.toLowerCase().replace(/[^a-z]/g, "");
                    const c = w === "big" ? mixColor(LANCE.dark200, LANCE.lavender, b) : w === "elephant" ? mixColor(LANCE.dark200, LANCE.orange400, e) : undefined;
                    return (
                      <span key={k} style={{ color: c }}>
                        {x}{" "}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Slab>
          </At>
        );
      })}

      {/* the two query words: hover over the wall, then drop as weights */}
      {WORDS.map(({ w, tone, x }, k) => {
        const appear = pop(f, C.rare + k * 8, 160, 13);
        const drop = k === 0 ? dropBig : dropEle;
        const fall = ramp(f, drop, drop + 18, (n) => n * n); // gravity: accelerate into the floor
        const grow = ramp(f, drop - 10, drop + 12);
        const hW = IDF[w as "big" | "elephant"] * K;
        const cw = chipW(w, 44);
        const W = mix(cw, WEIGHT_W, grow);
        const H = mix(76, hW, grow);
        const land = pop(f, drop + 18, 300, k === 0 ? 9 : 14);
        const squash = f >= drop + 18 ? 1 + (k === 0 ? 0.08 : 0.16) * (1 - land) : 1;
        const hoverY = -560 + 10 * Math.sin((f + k * 20) / 14);
        const y = mix(hoverY, FLOOR - H / 2, fall);
        return (
          <At key={w} p={[x, y, mix(120, 160, fall)]} s={Math.max(0.01, appear)} name={`Weight · ${w}`}>
            <div style={{ transform: `scale(${1 / Math.sqrt(squash)}, ${squash})`, transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}>
              <Slab w={W} h={H} d={mix(16, 200, grow)} tone={tone} radius={10} glow={k === 1 ? 0.4 + 0.4 * grow : 0} outline={false}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Label size={44} color={LANCE.dark800} fringe={0}>
                    {w}
                  </Label>
                </div>
              </Slab>
            </div>
          </At>
        );
      })}
    </Stage>
  );
};

export default HowRare;
