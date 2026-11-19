import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, RowCard, rowCardW, camPath, ramp, pop, glide, mix, mixColor, V3 } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "To score rows this way, BM25 keeps statistics for each column…" →
 * "…then kept the score from its best column." Slides in from HowLong,
 * whooshes out to the faces ("This works well in most cases…").
 *
 *   1  the toy table's text column (12 rows); a stats lid drops onto it and
 *      fills in: rows containing elephant (4 of 12) and big (10 of 12), and an
 *      average-length marker (no number) that also draws down the rows
 *   2  "more than one text column": the column splits into title | body, each
 *      with its OWN stats lid (elephant: 1 of 6 titles, 3 of 6 bodies)
 *   3  MultiMatchQuery: the query splits, one copy dives into each column;
 *      every row gets a title score and a body score (real per-column BM25,
 *      ftsData.ts mmTitle / mmBody); the lower one drops away, the best one is
 *      kept and slides out to the result lane
 *
 * Code facts (lance 84d1681e0): MultiMatchQuery "fans out into one MatchQuery
 * per column and fuses the per-field scores by taking the maximum
 * (Elasticsearch best_fields)" (query.rs); each column's index keeps its own
 * token→doc counts and average doc length (scorer.rs). Counts are the toy
 * table's (tools/bm25_toy.py: df big 10, elephant 4 of 12; dfTitle 1, dfBody 3).
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.stats;
const TEXT = FTS.text as readonly string[];
const TITLE = FTS.title as readonly string[];
const BODY = FTS.body as readonly string[];
const MM_T = FTS.mmTitle as readonly number[];
const MM_B = FTS.mmBody as readonly number[];
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

// ── phase 1: one 12-row column ───────────────────────────────────────────
const S1 = 23;
const W1 = Math.max(...TEXT.map((t) => rowCardW(t, S1)));
const y1 = (i: number) => -230 + i * 48;
const LID1_Y = -230 - 21 - 22 - 102;
const AVG_CH = TEXT.reduce((a, t) => a + t.length, 0) / TEXT.length;
const AVG_X = -W1 / 2 + S1 * 0.8 + AVG_CH * S1 * 0.5;
const HAS = (w: string) => TEXT.filter((t) => t.split(" ").some((x) => bare(x) === w)).length; // 4, 10

// ── phase 2/3: title | body ──────────────────────────────────────────────
const S2 = 28;
const TW = 400;
const BW = Math.max(...BODY.map((t) => rowCardW(t, S2))) + 10;
const TX = -540;
const BX = TX + TW / 2 + 50 + BW / 2;
const y2 = (i: number) => -140 + i * 84;
const RH2 = 58;
const COL_TOP = -140 - RH2 / 2 - 62;
const COL_BOT = y2(5) + RH2 / 2 + 34;
const LID2_Y = COL_TOP - 16 - 75;
const Q_Y = LID2_Y - 75 - 120;
const K = 210; // px per BM25 point
const LANE_X = BX + BW / 2 + 40; // where the kept score lands
const MAXB = Math.max(...MM_T, ...MM_B);

/** a stats lid: lines of [word chip, count] plus an "avg length" marker line */
const Lid: React.FC<{ w: number; lines: { word: string; tone: "hit" | "big"; n: string; o: number }[]; avgO: number; glow?: number }> = ({ w, lines, avgO, glow = 0 }) => (
  <Slab w={w} h={60 + lines.length * 62 + 20} d={34} tone="idle" radius={16} glow={glow}>
    <div style={{ position: "absolute", inset: 0, padding: "20px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
      {lines.map((l) => (
        <div key={l.word} style={{ display: "flex", alignItems: "center", gap: 18, opacity: l.o, transform: `translateX(${(1 - l.o) * -30}px)` }}>
          <Chip text={l.word} size={26} tone={l.tone} d={8} />
          <Label size={30} color={LANCE.offwhite}>
            {l.n}
          </Label>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: avgO, transform: `translateX(${(1 - avgO) * -30}px)` }}>
        <Label size={26} color={LANCE.dark200}>
          avg length
        </Label>
        <div style={{ width: 90 * avgO, height: 0, borderTop: `4px dashed ${LANCE.dark200}` }} />
      </div>
    </div>
  </Slab>
);

/** a column's backing slab with its name across the top */
const Column: React.FC<{ w: number; h: number; name?: string; nameO?: number; glow?: number }> = ({ w, h, name, nameO = 1, glow = 0 }) => (
  <Slab w={w} h={h} d={50} tone="dim" radius={18} glow={glow}>
    {name && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 16, display: "flex", justifyContent: "center", opacity: nameO }}>
        <Label size={32} color={LANCE.dark100}>
          {name}
        </Label>
      </div>
    )}
  </Slab>
);

export const StatsMulti: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();

  // ── phase 1 beats ─────────────────────────────────────────────────────
  const colIn = glide(f, 0, 110);
  const lidDrop = pop(f, C.statistics - 4, 150, 14);
  const eLit = ramp(f, C.many - 6, C.many + 8);
  const bLit = ramp(f, C.many + 34, C.many + 48);
  const eN = Math.round(ramp(f, C.many - 6, C.many + 24) * HAS("elephant"));
  const bN = Math.round(ramp(f, C.many + 34, C.many + 70) * HAS("big"));
  const avgO = ramp(f, C.average - 10, C.average + 12);
  const avgLine = ramp(f, C.average, C.average + 40);
  const out1 = glide(f, C.soSay + 10, 120); // the single column leaves

  // ── phase 2 beats ─────────────────────────────────────────────────────
  const split = glide(f, C.more - 30, 100); // two columns spread out of the middle
  const tName = ramp(f, C.title - 8, C.title + 6);
  const bName = ramp(f, C.body - 8, C.body + 6);
  const lidT = pop(f, C.before13 - 10, 150, 14);
  const lidB = pop(f, C.before13 + 6, 150, 14);
  const lidLines = ramp(f, C.before13 + 24, C.before13 + 44);

  // ── phase 3 beats ─────────────────────────────────────────────────────
  const qIn = pop(f, C.multi - 8, 150, 13);
  const dive = glide(f, C.scores - 6, 120); // the query's two copies fly into each lid
  const qGone = ramp(f, C.scores + 22, C.scores + 34);
  const lidHit = ramp(f, C.scores + 20, C.scores + 30) * (1 - ramp(f, C.scores + 40, C.scores + 70));
  const barT = (i: number) => ramp(f, C.scores + 44 + i * 6, C.scores + 74 + i * 6);
  const drop = (i: number) => glide(f, C.kept + i * 4, 120);
  const keep = (i: number) => glide(f, C.kept + 20 + i * 5, 90);
  const shine = ramp(f, C.best - 4, C.best + 10);

  const cam = camPath(f, [
    [0, { x: -40, y: 20, z: 0, rx: -3, ry: -16 }],
    [C.statistics - 20, { x: 0, y: 40, z: 30, rx: -4, ry: -9 }],
    [C.statistics + 40, { x: 0, y: 10, z: 170, rx: -6, ry: -3 }],
    [C.many + 20, { x: 0, y: 10, z: 175, rx: -6, ry: 7 }],
    [C.average + 40, { x: 40, y: 10, z: 170, rx: -5, ry: -5 }],
    [C.more + 10, { x: 40, y: -60, z: 190, rx: -7, ry: 5 }],
    [C.before13 + 40, { x: 30, y: -170, z: 130, rx: -7, ry: -3 }],
    [C.multi + 30, { x: 30, y: -260, z: 120, rx: -9, ry: 2 }],
    [C.scores + 70, { x: 80, y: -60, z: 160, rx: -7, ry: -4 }],
    [C.best + 60, { x: 150, y: -40, z: 140, rx: -6, ry: -8 }],
  ]);

  const nodes: React.ReactNode[] = [];

  // ── phase 1 ───────────────────────────────────────────────────────────
  if (out1 < 0.999) {
    const o = colIn * (1 - out1);
    const z = -700 * out1;
    const s = 1 - 0.3 * out1;
    nodes.push(
      <At key="col1" p={[0, (y1(0) + y1(11)) / 2 + 10, -30 + z]} s={s} o={o} name="Text column">
        <Column w={W1 + 50} h={y1(11) - y1(0) + 42 + 50} />
      </At>,
    );
    TEXT.forEach((t, i) => {
      const ri = glide(f, 4 + i * 3, 140);
      const hl = (x: string) =>
        bare(x) === "elephant" ? mixColor(LANCE.offwhite, LANCE.orange400, eLit) : bare(x) === "big" ? mixColor(LANCE.offwhite, LANCE.lavender, bLit) : undefined;
      nodes.push(
        <At key={`r1-${i}`} p={[0, y1(i), mix(-400, 0, ri) + z]} s={s} o={o * ri} name={`Row · ${t}`}>
          <RowCard text={t} w={W1} h={42} size={S1} d={14} hl={hl} />
        </At>,
      );
    });
    nodes.push(
      <At key="avg1" p={[AVG_X * s, y1(0) - 21, 20 + z]} anchor="top" o={o * avgO} name="Average length line">
        <div style={{ width: 0, height: (y1(11) - y1(0) + 42) * avgLine * s, borderLeft: `4px dashed ${LANCE.dark100}`, filter: `drop-shadow(0 0 8px ${LANCE.dark100})` }} />
      </At>,
    );
    nodes.push(
      <At key="lid1" p={[0, mix(-1100, LID1_Y, lidDrop), 10 + z]} s={s} o={o * Math.min(1, lidDrop * 3)} name="Stats lid · text">
        <Lid
          w={W1 * 0.62}
          lines={[
            { word: "elephant", tone: "hit", n: `${eN} / 12 rows`, o: ramp(f, C.many - 14, C.many) },
            { word: "big", tone: "big", n: `${bN} / 12 rows`, o: ramp(f, C.many + 26, C.many + 40) },
          ]}
          avgO={avgO}
        />
      </At>,
    );
  }

  // ── phase 2 + 3: title | body ────────────────────────────────────────
  if (split > 0.001) {
    const cols = [
      { key: "title", x: TX, w: TW, texts: TITLE, nameO: tName, lid: lidT, n: "1 / 6 rows", mm: MM_T },
      { key: "body", x: BX, w: BW, texts: BODY, nameO: bName, lid: lidB, n: "3 / 6 rows", mm: MM_B },
    ];
    cols.forEach((c, ci) => {
      const x = mix((TX + BX) / 2, c.x, split);
      nodes.push(
        <At key={`col-${c.key}`} p={[x, (COL_TOP + COL_BOT) / 2, mix(-500, -30, split)]} o={split} name={`Column · ${c.key}`}>
          <Column w={c.w + 40} h={COL_BOT - COL_TOP} name={c.key} nameO={c.nameO} glow={0.5 * lidHit} />
        </At>,
      );
      c.texts.forEach((t, i) => {
        const ri = glide(f, C.more - 20 + i * 4 + ci * 8, 130);
        nodes.push(
          <At key={`r-${c.key}-${i}`} p={[x, y2(i), mix(-500, 0, ri)]} o={ri} name={`${c.key} · ${t}`}>
            <RowCard text={t} w={c.w} h={RH2} size={S2} d={16} lit={ramp(f, C.before13 + 30, C.before13 + 50)} />
          </At>,
        );
        // the score this column gives the row
        const g = barT(i);
        if (g > 0.001) {
          const v = c.mm[i];
          const best = v > 0 && v >= Math.max(MM_T[i], MM_B[i]);
          const len = v > 0 ? v * K * g : 26 * g;
          const left = c.x - c.w / 2 + 12;
          if (best) {
            const k = keep(i);
            nodes.push(
              <At
                key={`bar-${c.key}-${i}`}
                p={[mix(left, LANE_X, k), y2(i) + mix(RH2 / 2 + 14, 0, k), 30 + 120 * Math.sin(k * Math.PI)]}
                anchor="left"
                name={`Score · ${c.key} · ${t}`}
              >
                <Slab w={len} h={mix(16, 46, k)} d={mix(10, 26, k)} tone="hit" radius={8} glow={0.4 + 0.5 * shine * (v / MAXB)} outline={false} />
              </At>,
            );
          } else {
            const dr = drop(i + ci);
            nodes.push(
              <At
                key={`bar-${c.key}-${i}`}
                p={[left, y2(i) + RH2 / 2 + 14 + 520 * dr * dr, 30 - 200 * dr]}
                r={[0, 0, 24 * dr]}
                anchor="left"
                o={1 - ramp(f, C.kept + 20, C.kept + 50)}
                name={`Score · ${c.key} · ${t} (dropped)`}
              >
                <Slab w={len} h={16} d={10} tone={v > 0 ? "hit" : "dim"} radius={6} outline={v <= 0} />
              </At>,
            );
          }
        }
      });
      // own stats lid
      nodes.push(
        <At key={`lid-${c.key}`} p={[x, mix(-1000, LID2_Y, c.lid), 10]} o={Math.min(1, c.lid * 3)} name={`Stats lid · ${c.key}`}>
          <Lid w={Math.min(c.w, 460)} lines={[{ word: "elephant", tone: "hit", n: c.n, o: lidLines }]} avgO={lidLines} glow={lidHit} />
        </At>,
      );
      // a copy of the query dives into this column's lid
      if (dive > 0.001 && qGone < 1) {
        const from: V3 = [(TX + BX) / 2, Q_Y + 70, 60];
        const to: V3 = [c.x, LID2_Y, 40];
        const p: V3 = [mix(from[0], to[0], dive), mix(from[1], to[1], dive) - 120 * Math.sin(dive * Math.PI), mix(from[2], to[2], dive) + 160 * Math.sin(dive * Math.PI)];
        nodes.push(
          <At key={`q-${c.key}`} p={p} s={1 - 0.4 * dive} o={1 - qGone} name={`Query copy → ${c.key}`}>
            <Chip text="elephant" size={34} tone="hit" glow={0.7} d={14} />
          </At>,
        );
      }
    });
    // the MultiMatchQuery slab, its query chip hangs under it until it splits
    if (qIn > 0.001) {
      nodes.push(
        <At key="mmq" p={[(TX + BX) / 2, mix(-1100, Q_Y, qIn), 20]} o={Math.min(1, qIn * 3) * (1 - ramp(f, C.kept - 10, C.kept + 20))} name="MultiMatchQuery">
          <Slab w={560} h={96} d={36} tone="paper" radius={48}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Label size={42} color={LANCE.dark800} fringe={0}>
                MultiMatchQuery
              </Label>
            </div>
          </Slab>
        </At>,
      );
      if (dive < 0.02) {
        nodes.push(
          <At key="q" p={[(TX + BX) / 2, mix(-1000, Q_Y + 90, qIn), 60]} o={Math.min(1, qIn * 3)} name="Query">
            <Chip text="elephant" size={34} tone="hit" glow={0.7} d={14} />
          </At>,
        );
      }
    }
  }

  return (
    <Stage name="Stats per Column + MultiMatch" cam={cam} enter={enter} exit={exit} floorY={460}>
      {nodes}
    </Stage>
  );
};

export default StatsMulti;
