import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, Badge, RowCard, rowCardW, camPath, ramp, pop, glide, mix, mixColor, V3 } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "The first case is when the query terms are split across columns." →
 * "…a row that's actually about that word in its body."
 * Whoosh in from the faces, whoosh out to "Sören's feature adds…".
 *
 * CASE 1  first_name | last_name, query "John Smith", AND. The query's words
 *         split apart; MultiMatch checks each column on its own: first_name
 *         has John but not Smith (✕), last_name has Smith but not John (✕).
 *         The John | Smith row lifts toward the results tray and drops away
 *         before it gets there; the tray stays empty.
 * CASE 2  (the camera pans across the room) title | body, query "elephant":
 *         rare in titles (1 of 6), common in bodies (3 of 6), so each column's
 *         stats lid gets a weight block sized by its real idf (1.54 vs 0.69).
 *         "Zoo update: elephant" (once, in its title) and "Savanna giants"
 *         (about elephants, in its body) lift out of the table with their
 *         best-column scores (real 1.54 vs 0.89); Zoo update swaps above.
 *
 * Code facts (lance 84d1681e0): python test_fts_combined_fields_query — with
 * AND, best_fields "only matches row 1, where a single field holds both terms";
 * MultiMatchQuery scores each column against its own statistics (query.rs);
 * idf = ln((N − n + 0.5)/(n + 0.5) + 1) (scorer.rs).
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.cases;
const FIRST = FTS.first as readonly string[];
const LAST = FTS.last as readonly string[];
const TITLE = FTS.title as readonly string[];
const BODY = FTS.body as readonly string[];
const MM_T = FTS.mmTitle as readonly number[];
const MM_B = FTS.mmBody as readonly number[];
const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const idf = (n: number, N: number) => Math.log((N - n + 0.5) / (n + 0.5) + 1);

// ── case 1 layout ────────────────────────────────────────────────────────
const NS = 40;
const NW = 330;
const FX = -390;
const LX = FX + NW + 50;
const TRAY_X = 600;
const ny = (i: number) => -170 + i * 92;
const NH = 68;
const N_TOP = ny(0) - NH / 2 - 70;
const N_BOT = ny(4) + NH / 2 + 30;
const NLID_Y = N_TOP - 20 - 60;
const NQ_Y = NLID_Y - 60 - 110;

// ── case 2 layout (same as StatsMulti's title | body), offset across the room ─
const X2 = 2800;
const S2 = 28;
const TW = 400;
const BW = Math.max(...BODY.map((t) => rowCardW(t, S2))) + 10;
const TX = -540;
const BX = TX + TW / 2 + 50 + BW / 2;
const y2 = (i: number) => -140 + i * 84;
const RH2 = 58;
const COL_TOP = -140 - RH2 / 2 - 62;
const COL_BOT = y2(5) + RH2 / 2 + 34;
const LID2_Y = COL_TOP - 16 - 60;
const ZOO = 0; // "Zoo update: elephant" — once, in its title
const SAV = 1; // "Savanna giants" — about elephants, in its body
const K = 210;
const W_T = idf(FTS.dfTitle, 6); // 1.54
const W_B = idf(FTS.dfBody, 6); // 0.69
const CUBE = 150; // px per idf point

const Column: React.FC<{ w: number; h: number; name: string; glow?: number; tone?: "dim" | "card" }> = ({ w, h, name, glow = 0, tone = "dim" }) => (
  <Slab w={w} h={h} d={50} tone={tone} radius={18} glow={glow}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center" }}>
      <Label size={32} color={LANCE.dark100}>
        {name}
      </Label>
    </div>
  </Slab>
);

/** a little check line on a lid: query word + ✓/✕ */
const Check: React.FC<{ word: string; ok: boolean; o: number }> = ({ word, ok, o }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: o, transform: `scale(${0.6 + 0.4 * o})` }}>
    <Chip text={word} size={28} tone={ok ? (bare(word) === "john" ? "hit" : "big") : "dim"} d={8} />
    <Label size={34} color={ok ? LANCE.orange300 : LANCE.dark400} fringe={0}>
      {ok ? "✓" : "✕"}
    </Label>
  </div>
);

export const MultiCases: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "whoosh", exit = "whoosh" }) => {
  const f = useCurrentFrame();

  // ── case 1 beats ──────────────────────────────────────────────────────
  const qIn = pop(f, 10, 150, 14);
  const qSplit = glide(f, C.split - 6, 110); // John and Smith pull apart
  const colsIn = glide(f, C.sayTable - 10, 110);
  const fName = ramp(f, C.firstName - 6, C.firstName + 8);
  const lName = ramp(f, C.lastName - 6, C.lastName + 8);
  const qBar = pop(f, C.search - 4, 150, 14); // John Smith comes back together as one query, AND
  const andIn = pop(f, C.requires + 4, 180, 12);
  const dive = glide(f, C.noSingle - 40, 120); // a copy over each column
  const chk = (col: number, k: number) => ramp(f, C.noSingle - 6 + col * 34 + k * 12, C.noSingle + 6 + col * 34 + k * 12);
  const fail = (col: number) => pop(f, C.noSingle + 30 + col * 34, 190, 12);
  const lit1 = ramp(f, C.noSingle - 6, C.noSingle + 20);
  const lift = glide(f, C.rowWith - 30, 90); // the John | Smith row heads for the tray
  const fall = ramp(f, C.back - 50, C.back + 20, (t) => t * t); // …and falls away before it gets there
  const trayIn = pop(f, C.requires - 20, 140, 15);
  const out1 = ramp(f, C.next - 40, C.next + 40);

  // ── case 2 beats ──────────────────────────────────────────────────────
  const in2 = glide(f, C.next - 10, 100);
  const tLit = ramp(f, C.rare - 6, C.rare + 10);
  const bLit = ramp(f, C.common - 6, C.common + 10);
  const lidT = pop(f, C.rare + 6, 150, 14);
  const lidB = pop(f, C.common + 6, 150, 14);
  const cubeT = ramp(f, C.rareTitles - 10, C.rareTitles + 14, (t) => t * t);
  const cubeB = ramp(f, C.bigWeight + 14, C.bigWeight + 38, (t) => t * t);
  const recede = glide(f, C.means - 10, 90); // the table steps back, two rows lift out
  const out2 = glide(f, C.means + 4, 100);
  const barSav = ramp(f, C.means + 60, C.means + 96);
  const barZoo = ramp(f, C.once + 6, C.once + 40);
  const swap = glide(f, C.outrank - 4, 80);
  const aboutGlow = ramp(f, C.actually, C.actually + 20) * (0.6 + 0.4 * Math.sin(f / 6));

  const cam = camPath(f, [
    [0, { x: 0, y: -380, z: -260, rx: -6, ry: 0 }],
    [C.sayTable - 10, { x: 0, y: -330, z: -200, rx: -6, ry: 0 }],
    [C.search, { x: 40, y: -160, z: 130, rx: -8, ry: -6 }],
    [C.noSingle + 20, { x: 20, y: -200, z: 90, rx: -9, ry: 6 }],
    [C.back - 20, { x: 140, y: -150, z: 140, rx: -6, ry: -6 }],
    [C.next - 30, { x: 140, y: -150, z: 160, rx: -6, ry: -4 }],
    [C.next + 60, { x: X2 + 30, y: -110, z: 190, rx: -7, ry: 4 }],
    [C.rareTitles - 40, { x: X2 + 30, y: -170, z: 160, rx: -8, ry: -2 }],
    [C.bigWeight + 60, { x: X2 + 20, y: -190, z: 170, rx: -8, ry: 4 }],
    [C.once - 20, { x: X2 + 30, y: -10, z: 40, rx: -5, ry: -4 }],
    [C.body + 40, { x: X2 + 50, y: -10, z: 20, rx: -5, ry: 3 }],
  ]);

  const nodes: React.ReactNode[] = [];

  // ════ case 1 ════════════════════════════════════════════════════════════
  if (out1 < 1) {
    const o1 = 1 - out1;
    const cols = [
      { key: "first_name", x: FX, rows: FIRST, nameO: fName, has: { john: true, smith: false } },
      { key: "last_name", x: LX, rows: LAST, nameO: lName, has: { john: false, smith: true } },
    ];
    // the two query words: together → split apart → back together as the AND query
    const mid = (FX + LX) / 2;
    if (qBar < 0.98) {
      ["John", "Smith"].forEach((w, k) => {
        const x = mix(mid - 90 + k * 200, k === 0 ? FX : LX, qSplit);
        nodes.push(
          <At key={`w-${w}`} p={[x, mix(NQ_Y - 40, NQ_Y + 10, qSplit), 60 + 80 * Math.sin(qSplit * Math.PI)]} s={qIn} o={o1 * (1 - qBar)} name={`Query word · ${w}`}>
            <Chip text={w} size={46} tone={k === 0 ? "hit" : "big"} glow={0.6} d={18} />
          </At>,
        );
      });
    }
    nodes.push(
      <At key="qbar" p={[mid, NQ_Y, 30]} s={Math.max(0.01, qBar)} o={o1 * Math.min(1, qBar * 3) * (1 - 0.0 * dive)} name="Query · John Smith AND">
        <Slab w={560} h={104} d={36} tone="idle" radius={52}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <Chip text="John" size={40} tone="hit" d={10} />
            <Chip text="Smith" size={40} tone="big" d={10} />
            <div style={{ transform: `scale(${andIn})` }}>
              <Chip text="AND" size={34} tone="paper" d={10} />
            </div>
          </div>
        </Slab>
      </At>,
    );
    cols.forEach((c, ci) => {
      nodes.push(
        <At key={`c1-${c.key}`} p={[c.x, (N_TOP + N_BOT) / 2, mix(-600, -30, colsIn)]} o={o1 * colsIn} name={`Column · ${c.key}`}>
          <Column w={NW + 40} h={N_BOT - N_TOP} name={c.key} glow={0} />
        </At>,
      );
      c.rows.forEach((t, i) => {
        const ri = glide(f, C.sayTable + i * 5 + ci * 10, 130);
        const isRow0 = i === 0;
        let p: V3 = [c.x, ny(i), mix(-500, 0, ri)];
        let r: V3 = [0, 0, 0];
        let o = o1 * ri;
        if (isRow0 && lift > 0) {
          // the John | Smith row: out of the table, toward the tray, then it falls
          p = [c.x + 150 * lift, ny(0) - 40 * lift + 900 * fall, 300 * lift - 300 * fall];
          r = [50 * fall, 0, (ci === 0 ? -1 : 1) * 30 * fall];
          o = o1 * (1 - ramp(f, C.back - 10, C.back + 20));
        }
        const hl = (x: string) => (bare(x) === "john" ? mixColor(LANCE.offwhite, LANCE.orange400, lit1) : bare(x) === "smith" ? mixColor(LANCE.offwhite, LANCE.lavender, lit1) : undefined);
        nodes.push(
          <At key={`n-${c.key}-${i}`} p={p} r={r} o={o} name={`${c.key} · ${t}`}>
            <RowCard text={t} w={NW} h={NH} size={NS} d={18} hl={hl} glow={isRow0 ? 0.5 * lift * (1 - fall) : 0} align="center" />
          </At>,
        );
      });
      // this column's own check: John? Smith? → ✕
      const lidP = pop(f, C.noSingle - 30 + ci * 10, 160, 14);
      nodes.push(
        <At key={`lid1-${c.key}`} p={[c.x, mix(NLID_Y - 500, NLID_Y, lidP), 10]} o={o1 * Math.min(1, lidP * 3)} name={`Check · ${c.key}`}>
          <Slab w={NW + 40} h={120} d={30} tone="idle" radius={16}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
              <Check word="John" ok={c.has.john} o={chk(ci, 0)} />
              <Check word="Smith" ok={c.has.smith} o={chk(ci, 1)} />
            </div>
          </Slab>
        </At>,
      );
      const fb = fail(ci);
      nodes.push(
        <At key={`x-${c.key}`} p={[c.x + NW / 2 + 10, NLID_Y - 60, 60 + 60 * (1 - fb)]} s={Math.max(0.01, fb)} o={o1 * Math.min(1, fb * 2)} name={`Column fails · ${c.key}`}>
          <Badge ok={false} size={78} />
        </At>,
      );
      // query copy dives to the column's check lid
      if (dive > 0.001 && dive < 0.999) {
        nodes.push(
          <At key={`qd-${c.key}`} p={[mix(mid, c.x, dive), mix(NQ_Y, NLID_Y, dive) - 100 * Math.sin(dive * Math.PI), 60 + 140 * Math.sin(dive * Math.PI)]} s={0.7} o={o1 * (1 - dive)} name={`Query copy → ${c.key}`}>
            <Slab w={300} h={70} d={20} tone="idle" radius={35}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Chip text="John" size={26} tone="hit" d={6} />
                <Chip text="Smith" size={26} tone="big" d={6} />
              </div>
            </Slab>
          </At>,
        );
      }
    });
    // results tray: empty, and stays empty
    nodes.push(
      <At key="tray" p={[TRAY_X, ny(1) + 30, -20]} s={Math.max(0.01, trayIn)} o={o1 * Math.min(1, trayIn * 2)} name="Results tray (empty)">
        <div style={{ width: 400, height: 210, border: `4px dashed ${LANCE.dark400}`, borderRadius: 22, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 18, boxSizing: "border-box" }}>
          <Label size={28} color={LANCE.dark400}>
            results
          </Label>
        </div>
      </At>,
    );
  }

  // ════ case 2 ════════════════════════════════════════════════════════════
  if (in2 > 0.001) {
    const cols = [
      { key: "title", x: X2 + TX, w: TW, texts: TITLE, lit: tLit, lid: lidT, n: "1 / 6 rows", wgt: W_T, drop: cubeT, mm: MM_T },
      { key: "body", x: X2 + BX, w: BW, texts: BODY, lit: bLit, lid: lidB, n: "3 / 6 rows", wgt: W_B, drop: cubeB, mm: MM_B },
    ];
    const zBack = -480 * recede;
    cols.forEach((c) => {
      nodes.push(
        <At key={`c2-${c.key}`} p={[c.x, (COL_TOP + COL_BOT) / 2, mix(-600, -30, in2) + zBack]} o={in2 * (1 - 0.45 * recede)} name={`Column · ${c.key}`}>
          <Column w={c.w + 40} h={COL_BOT - COL_TOP} name={c.key} />
        </At>,
      );
      c.texts.forEach((t, i) => {
        if (i === ZOO || i === SAV) return; // drawn as the lifted rows below
        const ri = glide(f, C.next + i * 4, 130);
        nodes.push(
          <At key={`r2-${c.key}-${i}`} p={[c.x, y2(i), mix(-500, 0, ri) + zBack]} o={ri * (1 - 0.8 * recede)} name={`${c.key} · ${t}`}>
            <RowCard text={t} w={c.w} h={RH2} size={S2} d={16} lit={c.lit} />
          </At>,
        );
      });
      // stats lid with the word's count, and its weight block on top
      const ly = mix(-1000, LID2_Y, c.lid);
      nodes.push(
        <At key={`lid2-${c.key}`} p={[c.x, ly, 10 + zBack]} o={Math.min(1, c.lid * 3) * (1 - 0.3 * recede)} name={`Stats lid · ${c.key}`}>
          <Slab w={Math.min(c.w, 420)} h={96} d={30} tone="idle" radius={16}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
              <Chip text="elephant" size={28} tone="hit" d={8} />
              <Label size={32}>{c.n}</Label>
            </div>
          </Slab>
        </At>,
      );
      const cs = c.wgt * CUBE;
      if (c.drop > 0.001) {
        const land = LID2_Y - 48 - cs / 2;
        nodes.push(
          <At key={`w-${c.key}`} p={[c.x, mix(land - 900, land, c.drop), 10 + zBack]} r={[0, 18, 0]} name={`Weight · ${c.key}`}>
            <Slab w={cs} h={cs} d={cs} tone="hit" radius={10} glow={0.5}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Label size={Math.min(30, cs / 4.6)} color={LANCE.dark800} fringe={0}>
                  elephant
                </Label>
              </div>
            </Slab>
          </At>,
        );
      }
    });
    // the two rows that matter lift out of the table, with their best-column scores
    [SAV, ZOO].forEach((i) => {
      const lane0 = i === SAV ? -40 : 80; // before the swap: Savanna on top
      const lane1 = i === SAV ? 80 : -40; // after: Zoo update on top
      const y = mix(y2(i), mix(lane0, lane1, swap), out2);
      const z = mix(0, 260, out2) + (i === ZOO ? 140 : -40) * Math.sin(swap * Math.PI);
      const ri = glide(f, C.next + i * 4, 130);
      const best = Math.max(MM_T[i], MM_B[i]);
      const g = i === SAV ? barSav : barZoo;
      const isZoo = i === ZOO;
      nodes.push(
        <At key={`lt-${i}`} p={[X2 + TX, y, mix(-500, 0, ri) + z]} o={ri} name={`Row ${i} · title`}>
          <RowCard text={TITLE[i]} w={TW} h={RH2} size={S2} d={16} lit={tLit} glow={isZoo ? 0.6 * swap : 0} />
        </At>,
      );
      nodes.push(
        <At key={`lb-${i}`} p={[X2 + BX, y, mix(-500, 0, ri) + z]} o={ri} name={`Row ${i} · body`}>
          <RowCard text={BODY[i]} w={BW} h={RH2} size={S2} d={16} lit={bLit} glow={!isZoo ? 0.5 * aboutGlow : 0} />
        </At>,
      );
      if (g > 0.001) {
        nodes.push(
          <At key={`sc-${i}`} p={[X2 + BX + BW / 2 + 30, y, z]} anchor="left" name={`Best-column score · ${TITLE[i]}`}>
            <Slab w={best * K * g} h={50} d={26} tone="hit" radius={8} glow={isZoo ? 0.4 + 0.5 * swap : 0.35} outline={false} />
          </At>,
        );
      }
    });
  }

  return (
    <Stage name="Where MultiMatch Falls Short" cam={cam} enter={enter} exit={exit} floorY={460}>
      {nodes}
    </Stage>
  );
};

export default MultiCases;
