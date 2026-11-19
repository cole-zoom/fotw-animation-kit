import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, Bar, RowCard, camPath, ramp, pop, glide, mix, mixV, V3 } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "Lance's full-text search uses a ranking algorithm called BM25. When you run
 * a full-text query like big elephant, BM25 gives every row a score for that
 * query. The BM25 scoring is based on three things."
 * Slides in from the PR page, slides out into HowOften.
 *
 *   1  BM25 is a machine in the middle of the room; five rows wait on its left
 *   2  "big elephant" types into a search bar above it and drops in
 *   3  every row goes through and comes out on the right with a score bar
 *      (real BM25 on the toy table, ftsData.ts), then the rows sort by score
 *   4  "three things": three dials light on the machine's face — often, rare, long
 *
 * Code facts (lance 84d1681e0, scorer.rs): BM25 with K1 = 1.2, B = 0.75; bar
 * lengths are those formulas run on the toy table (tools/bm25_toy.py). No numbers
 * on screen.
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.rank;
const TEXT = FTS.text as readonly string[];
const BM = FTS.bm25 as readonly number[];
const ROWS = [8, 0, 5, 1, 3]; // here is a big elephant · big savings… · one elephant… · a big day… · the big game…
const RANKED = [...ROWS].sort((a, b) => BM[b] - BM[a]);
const MAXS = Math.max(...ROWS.map((i) => BM[i]));
const ROW_W = 500;
const GAP_Y = 92;
const BAR_MAX = 300;
const MACHINE: V3 = [0, -40, 0];
const listY = (k: number) => -220 + k * GAP_Y;
const LEFT_X = -800;
const RIGHT_X = 700;
const DIALS = ["often", "rare", "long"];

export const RankMachine: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();

  // ── beats ──────────────────────────────────────────────────────────────
  const machineIn = pop(f, 6, 120, 14);
  const queryIn = pop(f, C.when - 6);
  const bigIn = pop(f, C.big - 4);
  const eleIn = pop(f, C.elephant - 2);
  const plunge = glide(f, C.elephant + 46, 140); // the query drops into the machine
  const pass = (k: number) => C.gives - 10 + k * 16; // row k starts through the machine
  const sortT = glide(f, C.score + 40, 70);
  const dial = (k: number) => pop(f, C.three + k * 10, 200, 12);
  const hum = 0.5 + 0.5 * Math.sin(f / 5); // machine glow while rows pass
  const busy = ramp(f, pass(0) - 6, pass(0) + 6) * (1 - ramp(f, pass(4) + 40, pass(4) + 60));

  const cam = camPath(f, [
    [0, { x: 0, y: 30, z: -420, rx: -4, ry: -14 }],
    [C.when - 20, { x: 0, y: -40, z: -260, rx: -8, ry: -8 }],
    [C.gives - 12, { x: 0, y: -30, z: 520, rx: -10, ry: 6 }],
    [C.score + 120, { x: 170, y: -20, z: 560, rx: -12, ry: 10 }],
    [C.three - 6, { x: 0, y: 30, z: -200, rx: -8, ry: -6 }],
    [C.things + 60, { x: 0, y: 40, z: -300, rx: -6, ry: -2 }],
  ]);

  return (
    <Stage name="Rank Machine" cam={cam} enter={enter} exit={exit} floorY={300}>
      {/* the machine */}
      <At p={MACHINE} s={0.4 + 0.6 * machineIn} name="BM25 machine">
        <Slab w={620} h={330} d={180} tone="card" radius={22} glow={0.25 + 0.55 * busy * hum}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <Label size={150} color={LANCE.offwhite} weight={500} track="-0.02em" fringe={2}>
              BM25
            </Label>
          </div>
          {/* intake slot on top, output slot on the right */}
          <div style={{ position: "absolute", left: 150, right: 150, top: 18, height: 10, borderRadius: 5, background: LANCE.dark800 }} />
        </Slab>
      </At>
      {/* three dials, they come out of the machine's face */}
      {DIALS.map((d, k) => {
        const t = dial(k);
        return (
          <At key={d} p={[MACHINE[0] - 220 + k * 220, MACHINE[1] + 250, 40 + 120 * t]} s={Math.max(0.01, t)} o={Math.min(1, t * 2)} name={`Dial · ${d}`}>
            <Chip text={d} size={44} tone="hit" glow={0.8} d={30} w={190} h={86} />
          </At>
        );
      })}

      {/* the query */}
      <At p={[0, mix(-330, MACHINE[1] - 120, plunge), mix(0, -60, plunge)]} s={0.3 + 0.7 * queryIn} o={1 - ramp(f, C.elephant + 66, C.elephant + 76)} name="Query bar">
        <Slab w={600} h={110} d={40} tone="idle" radius={55}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 18, paddingLeft: 34 }}>
            <SearchGlyph />
            <div style={{ transform: `scale(${bigIn})`, transformOrigin: "left center" }}>
              <Chip text="big" size={42} tone="big" d={12} />
            </div>
            <div style={{ transform: `scale(${eleIn})`, transformOrigin: "left center" }}>
              <Chip text="elephant" size={42} tone="hit" d={12} />
            </div>
          </div>
        </Slab>
      </At>

      {/* rows: waiting on the left → through the machine → scored on the right → sorted */}
      {ROWS.map((ri, k) => {
        const start = pass(k);
        const tIn = glide(f, start - 22 - (k * 6), 120); // fly in from depth to the waiting stack
        const t1 = ramp(f, start, start + 18); // into the machine
        const t2 = glide(f, start + 18, 110); // out to the right
        const rank = RANKED.indexOf(ri);
        const wait: V3 = [LEFT_X, listY(k), -40];
        const inside: V3 = [MACHINE[0], MACHINE[1], -90];
        const out: V3 = [RIGHT_X, mix(listY(k), listY(rank), sortT), 0];
        const away = glide(f, C.three - 40 + rank * 3, 120); // clear the room for the three dials
        const p0 = t1 < 1 ? mixV(mixV([LEFT_X - 300, listY(k) - 200, -900], wait, tIn), inside, t1) : mixV(inside, out, t2);
        const p: V3 = [p0[0] + 900 * away, p0[1], p0[2] - 500 * away];
        const s = t1 > 0 && t1 < 1 ? 1 - 0.75 * Math.sin(t1 * Math.PI) : t1 >= 1 ? 0.25 + 0.75 * t2 : 1;
        const bar = ramp(f, start + 34, start + 64) * (BM[ri] / MAXS) * BAR_MAX;
        const lit = ramp(f, C.elephant + 6, C.elephant + 20);
        return (
          <React.Fragment key={ri}>
            <At p={p} s={Math.max(0.01, s)} o={tIn * (1 - away)} name={`Row · ${TEXT[ri]}`}>
              <RowCard text={TEXT[ri]} w={ROW_W} size={30} lit={lit} glow={rank === 0 ? 0.6 * sortT : 0} tone={rank === 0 && sortT > 0.5 ? "idle" : "card"} />
            </At>
            {t2 > 0.02 && (
              <At p={[p[0] + ROW_W / 2 + 22, p[1], p[2]]} o={1 - away} anchor="left" name={`Score · ${TEXT[ri]}`}>
                <Bar len={bar} h={46} glow={rank === 0 ? 0.9 : 0.35} />
              </At>
            )}
          </React.Fragment>
        );
      })}
    </Stage>
  );
};

const SearchGlyph: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 46 46" style={{ flex: "none" }}>
    <circle cx={19} cy={19} r={13} stroke={LANCE.dark200} strokeWidth={5} fill="none" />
    <line x1={29} y1={29} x2={41} y2={41} stroke={LANCE.dark200} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

export default RankMachine;
