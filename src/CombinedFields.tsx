import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, Bar, Badge, RowCard, camPath, ramp, pop, glide, mix, V3 } from "./boldKit";
import { FTS } from "./ftsData";
import { CUES } from "./cues";

/**
 * "It scores the columns you pick as if they were one combined column." →
 * "A rare title word no longer gets its own outsized weight."
 * Whoosh in from the faces ("Sören's feature adds…"), slide out into Boost.
 *
 *   1  title | body, each with its own stats lid; the two columns slide
 *      together and fuse into ONE column, the two lids merge into one
 *      (elephant: in 3 of 6 rows); every row gets one score (real BM25F); a
 *      BM25F plate lands on the merged lid
 *   2  the camera dollies over to first_name | last_name: the columns fuse,
 *      the John | Smith row now holds both words (AND) and drops into the
 *      results tray, which was empty in MultiCases
 *   3  back to title + body: the title's outsized weight block deflates to the
 *      shared one, and "Savanna giants" (the row about elephants) is #1,
 *      "Zoo update: elephant" #2 (real BM25F 0.94 vs 0.68)
 *
 * Code facts (lance 84d1681e0, combined.rs): tf' = Σ w·tf, dl' = Σ w·dl,
 * docFreq' = max over columns, docCount' = max, avgdl' = Σ w·sumTotalTermFreq /
 * docCount'. The merged "elephant: in 3 of 6 rows" is max(1, 3). Python
 * test_fts_combined_fields_query: with AND, combined_fields matches the row whose
 * first and last names hold one term each. Bar lengths: tools/bm25_toy.py.
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.comb;
const TITLE = FTS.title as readonly string[];
const BODY = FTS.body as readonly string[];
const COMB = FTS.combined as readonly number[];
const FIRST = FTS.first as readonly string[];
const LAST = FTS.last as readonly string[];
const N = TITLE.length;
const SZ = 33;
const RH = 74;
const rowY = (i: number) => -170 + i * 88;
const L = -800; // left edge of the title column
const TW = 430;
const BW = 860;
const GAP = 60;
const BAR0 = L + TW + BW + 34;
const BAR_MAX = 250;
const MAXC = Math.max(...COMB);
const SAV = 1; // "Savanna giants" — about elephants, in its body
const ZOO = 0; // "Zoo update: elephant" — once, in its title
// names set, off to the right of the room
const OX = 1900;
const NW = 280;
const nameY = (i: number) => -120 + i * 92;
const TRAY: V3 = [OX + 720, -40, 0];

export const CombinedFields: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();

  // ── beats ──────────────────────────────────────────────────────────────
  const rowsIn = (i: number) => glide(f, 4 + i * 5, 140);
  const query = pop(f, C.scores - 10);
  const picked = ramp(f, C.pick - 4, C.pick + 10);
  const fuse = glide(f, C.oneCombined - 24, 70); // the seam between title and body closes
  const lidMerge = glide(f, C.statistics + 4, 70);
  const lidText = ramp(f, C.across - 10, C.across + 8); // merged lid reads the combined stat
  const one = (i: number) => ramp(f, C.oneScore + i * 7, C.oneScore + 30 + i * 7);
  const plate = pop(f, C.bm25f - 4, 150, 12);
  // names
  const nIn = (i: number) => glide(f, C.going + 10 + i * 5, 140);
  const nFuse = glide(f, C.john - 20, 80);
  const nLit = ramp(f, C.matches - 6, C.matches + 6);
  const drop = glide(f, C.both + 10, 80);
  // back to title + body
  const deflate = glide(f, C.outsized - 30, 60);
  const ranks = pop(f, C.outsized + 6);
  const focus = ramp(f, C.rare - 10, C.rare + 20);

  const cam = camPath(f, [
    [0, { x: -160, y: -60, z: -120, rx: -10, ry: 16 }],
    [C.oneCombined, { x: -80, y: -50, z: 90, rx: -12, ry: 6 }],
    [C.oneScore + 20, { x: 40, y: -40, z: 170, rx: -12, ry: -5 }],
    [C.bm25f + 40, { x: -40, y: -90, z: 170, rx: -14, ry: -3 }],
    [C.going + 30, { x: OX + 260, y: -50, z: 60, rx: -10, ry: -10 }],
    [C.both + 70, { x: OX + 340, y: -40, z: 120, rx: -10, ry: -4 }],
    [C.rare + 10, { x: -60, y: -80, z: 170, rx: -12, ry: 4 }],
    [C.weight + 40, { x: -20, y: -90, z: 90, rx: -12, ry: 2 }],
  ]);

  // title | body positions: the body column slides left onto the title one
  const bodyX = L + TW + GAP * (1 - fuse) + BW / 2;
  const titleX = L + TW / 2; // title holds still
  const lidY = rowY(0) - 132;
  const fusedCx = L + (TW + BW) / 2;
  const dim = (i: number) => (focus > 0 && i !== SAV && i !== ZOO ? 1 - 0.6 * focus : 1);

  return (
    <Stage name="Combined Fields" cam={cam} enter={enter} exit={exit} floorY={330}>
      {/* query */}
      <At p={[fusedCx, lidY - 150, 20]} s={Math.max(0.01, query)} o={1 - ramp(f, C.oneScore - 20, C.oneScore)} name="Query · elephant">
        <Chip text="elephant" size={44} tone="hit" glow={0.5} />
      </At>

      {/* the stats lids: one per column, then one merged */}
      <At p={[mix(titleX, fusedCx, lidMerge), lidY, 0]} name="Stats lid · title">
        <Lid w={mix(TW, TW + BW, lidMerge)} head={lidText > 0.5 ? "title + body" : "title"} stat={lidText > 0.5 ? "elephant · in 3 of 6 rows" : "elephant · in 1 of 6 rows"} glow={picked * 0.4} />
      </At>
      {lidMerge < 0.98 && (
        <At p={[mix(bodyX, fusedCx, lidMerge), lidY, -4]} o={1 - lidMerge} name="Stats lid · body">
          <Lid w={BW} head="body" stat="elephant · in 3 of 6 rows" glow={picked * 0.4} />
        </At>
      )}
      {/* the old outsized title weight, deflating to the shared one */}
      {focus > 0 && (
        <At p={[mix(L + TW / 2, fusedCx, deflate), lidY - 52 - mix(150, 70, deflate) / 2, 10]} s={Math.max(0.01, pop(f, C.rare - 6))} name="Weight · elephant">
          <Slab w={mix(150, 70, deflate)} h={mix(150, 70, deflate)} d={mix(150, 70, deflate)} tone="hit" radius={10} glow={0.7} />
        </At>
      )}
      {/* BM25F plate lands on the merged lid */}
      {plate > 0.01 && (
        <At p={[fusedCx + (TW + BW) / 2 - 150, lidY - 62 - 70 * (1 - Math.min(1, plate)), 30]} s={0.6 + 0.4 * plate} name="BM25F plate">
          <Chip text="BM25F" size={58} tone="hit" glow={0.9} d={40} />
        </At>
      )}

      {/* rows */}
      {TITLE.map((t, i) => {
        const s = rowsIn(i);
        const o = s * dim(i);
        return (
          <React.Fragment key={i}>
            {fuse > 0.05 && (
              <At p={[fusedCx, rowY(i), -8]} o={o * Math.min(1, fuse * 1.5)} name={`Fused row ${i}`}>
                <Slab w={TW + BW + 16} h={RH + 16} d={10} tone="big" radius={14} glow={0.25} outline={false} />
              </At>
            )}
            <At p={[titleX, rowY(i), 0]} o={o} name={`Title · ${t}`}>
              <RowCard text={t} w={TW} h={RH} size={SZ} glow={i === SAV || i === ZOO ? 0.5 * focus : 0} />
            </At>
            <At p={[bodyX, rowY(i), 0]} o={o} name={`Body · ${BODY[i]}`}>
              <RowCard text={BODY[i]} w={BW} h={RH} size={SZ} glow={i === SAV || i === ZOO ? 0.5 * focus : 0} />
            </At>
            {one(i) > 0.01 && COMB[i] > 0 && (
              <At p={[BAR0 + GAP * (1 - fuse), rowY(i), 0]} anchor="left" o={o} name={`BM25F score · ${t}`}>
                <Bar len={one(i) * (COMB[i] / MAXC) * BAR_MAX} h={40} glow={i === SAV ? 0.9 : 0.4} />
              </At>
            )}
            {(i === SAV || i === ZOO) && ranks > 0.01 && (
              <At p={[BAR0 + (COMB[i] / MAXC) * BAR_MAX + 70, rowY(i), 20]} s={ranks} name={`Rank #${i === SAV ? 1 : 2}`}>
                <Chip text={i === SAV ? "#1" : "#2"} size={36} tone={i === SAV ? "hit" : "idle"} glow={i === SAV ? 0.8 : 0} />
              </At>
            )}
          </React.Fragment>
        );
      })}

      {/* ── back to our examples: first_name | last_name ─────────────────── */}
      <At p={[OX - NW / 2 - 4 - 20 * (1 - nFuse), nameY(0) - 84, 0]} o={nIn(0)} name="Head · first_name">
        <Label size={26} color={LANCE.dark200}>first_name</Label>
      </At>
      <At p={[OX + NW / 2 + 4 + 20 * (1 - nFuse), nameY(0) - 84, 0]} o={nIn(0)} name="Head · last_name">
        <Label size={26} color={LANCE.dark200}>last_name</Label>
      </At>
      <At p={[OX, nameY(0) - 150, 20]} s={Math.max(0.01, nIn(0))} name="Query · john smith AND">
        <div style={{ display: "flex", gap: 12, transformStyle: "preserve-3d" }}>
          <Chip text="john" size={38} tone="hit" />
          <Chip text="smith" size={38} tone="big" />
          <Chip text="AND" size={30} tone="idle" />
        </div>
      </At>
      {FIRST.map((fn, i) => {
        const s = nIn(i);
        const isJS = i === 0;
        const lift = isJS ? drop : 0;
        const y = mix(nameY(i), TRAY[1], lift);
        const x0 = isJS ? mix(OX, TRAY[0], lift) : OX;
        const sep = 20 * (1 - nFuse);
        return (
          <React.Fragment key={`n${i}`}>
            {nFuse > 0.05 && (
              <At p={[x0, y, -8 + 40 * lift]} o={s * Math.min(1, nFuse * 1.5) * (isJS ? 1 : 0.9)} name={`Fused name ${i}`}>
                <Slab w={2 * NW + 26} h={RH + 16} d={10} tone={isJS && nLit > 0.5 ? "hit" : "big"} radius={14} glow={isJS ? 0.8 * nLit : 0.2} outline={false} />
              </At>
            )}
            <At p={[x0 - NW / 2 - 5 - sep, y, 40 * lift]} o={s} name={`first_name · ${fn}`}>
              <RowCard text={fn} w={NW} h={RH} size={34} lit={isJS ? 1 : 0.35} align="center" />
            </At>
            <At p={[x0 + NW / 2 + 5 + sep, y, 40 * lift]} o={s} name={`last_name · ${LAST[i]}`}>
              <RowCard text={LAST[i]} w={NW} h={RH} size={34} lit={isJS ? 1 : 0.35} align="center" />
            </At>
          </React.Fragment>
        );
      })}
      {/* the results tray (empty in MultiCases), now catches John | Smith */}
      <At p={[TRAY[0], TRAY[1], -20]} o={nIn(0)} name="Results tray">
        <div style={{ width: 2 * NW + 70, height: RH + 50, borderRadius: 18, border: `3px dashed ${LANCE.dark400}`, boxSizing: "border-box" }} />
      </At>
      <At p={[TRAY[0], TRAY[1] - 82, 0]} o={nIn(0)} name="Results label">
        <Label size={26} color={LANCE.dark200}>results</Label>
      </At>
      {drop > 0.6 && (
        <At p={[TRAY[0] + NW + 70, TRAY[1], 40]} s={pop(f, C.both + 40)} name="Match ✓">
          <Badge ok size={70} />
        </At>
      )}
    </Stage>
  );
};

/** a column's stats lid: what the column is, and how many of its rows hold the word */
const Lid: React.FC<{ w: number; head: string; stat: string; glow?: number }> = ({ w, head, stat, glow = 0 }) => (
  <Slab w={w} h={104} d={30} tone="idle" radius={14} glow={glow}>
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, paddingLeft: 24 }}>
      <Label size={24} color={LANCE.dark200}>{head}</Label>
      <Label size={28} color={LANCE.offwhite}>
        {stat.split(" · ")[0]} <span style={{ color: LANCE.dark300 }}>·</span> <span style={{ color: LANCE.orange300 }}>{stat.split(" · ")[1]}</span>
      </Label>
    </div>
  </Slab>
);

export default CombinedFields;
