import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, camPath, ramp, pop, glide, mix, chipW } from "./boldKit";
import { CUES } from "./cues";

/**
 * "There are a few requirements. All the columns need to use the same tokenizer
 * settings, meaning the text is split into tokens the same way. At least one of
 * them needs a full text index."
 * Slide in from CodeCards, whoosh out to the faces ("Thanks to Sören…").
 *
 *   1  a title and a body text wait on the left
 *   2  ONE tokenizer gate slams down in the middle (lower case · stem · stop words)
 *   3  each text breaks into words that pass through the same gate: they come
 *      out lower-cased and stemmed, the stop words drop out — the same kind of
 *      tokens on both rows
 *   4  "at least one … full text index": an FTS index box lands over the title
 *      tokens; the body has none
 *
 * Code facts (lance 84d1681e0): combined.rs validate_combined_tokenizers — every
 * target column must share the same tokenizer/index configuration; query.py — "At
 * least one target column needs an FTS index". Default InvertedIndexParams
 * (tokenizer.rs): base tokenizer "simple" (splits on whitespace and punctuation),
 * lower_case, stem (tantivy Stemmer, English) then the English StopWordFilter.
 * Stems checked with Snowball English: tips → tip, opened → open; "The", "a" are
 * stop words. (Texts chosen so every stem is a real word: "update" → "updat".)
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.req;
type W = { raw: string; tok: string | null };
const ROWS: { col: string; y: number; words: W[] }[] = [
  { col: "title", y: -170, words: [{ raw: "Desert", tok: "desert" }, { raw: "travel", tok: "travel" }, { raw: "tips", tok: "tip" }] },
  {
    col: "body",
    y: 90,
    words: [
      { raw: "The", tok: null },
      { raw: "zoo", tok: "zoo" },
      { raw: "opened", tok: "open" },
      { raw: "a", tok: null },
      { raw: "new", tok: "new" },
      { raw: "cafe.", tok: "cafe" },
    ],
  },
];
const SZ = 38;
const G = 10;
const IN_X = -980; // left edge of the texts
const OUT_X = 250; // left edge of the tokens
const GATE_X = 0;
const GATE_W = 300;
/** a word is hidden while it is inside the gate (CSS depth sorting won't do it for us) */
const inside = (x: number, w: number) => interpolate(Math.abs(x - GATE_X) - w / 2, [GATE_W / 2 - 30, GATE_W / 2 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const lay = (ws: string[], x0: number) => {
  let x = x0;
  return ws.map((w) => {
    const c = x + chipW(w, SZ) / 2;
    x += chipW(w, SZ) + G;
    return c;
  });
};

export const Reqs: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const textIn = (r: number) => pop(f, C.all - 20 + r * 10, 140, 14);
  const gate = pop(f, C.tokenizer - 18, 190, 13); // drops in from above
  const plate = 1 - ramp(f, C.meaning - 6, C.meaning + 10); // the text card falls apart into words
  const go = (n: number) => C.meaning + 18 + n * 8; // n-th word into the gate
  const box = glide(f, C.atLeast - 8, 120);
  const lock = ramp(f, C.index - 10, C.index + 6);

  const cam = camPath(f, [
    [0, { x: -420, y: -40, z: -120, rx: -10, ry: 14 }],
    [C.tokenizer - 10, { x: -150, y: -50, z: 200, rx: -12, ry: 3 }],
    [C.split + 40, { x: 0, y: -50, z: 300, rx: -12, ry: 0 }],
    [C.atLeast, { x: 260, y: -90, z: 40, rx: -14, ry: -12 }],
    [C.index + 40, { x: 330, y: -110, z: -40, rx: -16, ry: -16 }],
  ]);

  let n = 0;
  const out: React.ReactNode[] = [];
  ROWS.forEach((row, r) => {
    const inX = lay(row.words.map((w) => w.raw), IN_X);
    const kept = row.words.filter((w) => w.tok).map((w) => w.tok as string);
    const outX = lay(kept, OUT_X);
    const rawW = row.words.reduce((a, w) => a + chipW(w.raw, SZ), 0) + G * (row.words.length - 1);
    out.push(
      <At key={`h${r}`} p={[IN_X + 8, row.y - 82, 0]} anchor="left" o={textIn(r)} name={`Head · ${row.col}`}>
        <Label size={28} color={LANCE.dark200}>{row.col}</Label>
      </At>,
    );
    if (plate > 0.01)
      out.push(
        <At key={`p${r}`} p={[IN_X + rawW / 2, row.y, -24]} o={plate * textIn(r)} name={`Text card · ${row.col}`}>
          <Slab w={rawW + 40} h={SZ * 1.7 + 30} d={16} tone="card" radius={16} />
        </At>,
      );
    let k = 0;
    row.words.forEach((w, i) => {
      const t = ramp(f, go(n), go(n) + 34, (x) => x);
      const p0 = inX[i];
      const p1 = w.tok ? outX[k] : GATE_X - 230;
      // kept words pass behind the gate's face (hidden inside it) and come out the far side;
      // stop words never get through: they hit the gate and drop to the floor
      const x = w.tok ? (t < 0.5 ? mix(p0, GATE_X, t * 2) : mix(GATE_X, p1, (t - 0.5) * 2)) : mix(p0, p1, Math.min(1, t * 2));
      const squeeze = 1;
      const fall = w.tok ? 0 : glide(f, go(n) + 16, 90);
      const through = w.tok ? t >= 0.5 : fall > 0.05;
      const z = w.tok ? -120 * Math.sin(t * Math.PI) : 0;
      out.push(
        <At
          key={`w${r}${i}`}
          p={[x, row.y + 320 * fall, z + 60 * fall]}
          r={[90 * fall, 0, 30 * fall]}
          s={Math.max(0.01, squeeze * textIn(r))}
          o={w.tok ? inside(x, chipW(t >= 0.5 ? w.tok : w.raw, SZ)) : 1 - ramp(f, go(n) + 30, go(n) + 50)}
          name={`Word · ${w.raw}`}
        >
          <Chip
            text={through && w.tok ? w.tok : w.raw}
            size={SZ}
            tone={through ? (w.tok ? "hit" : "dim") : plate > 0.5 ? "card" : "idle"}
            glow={through && w.tok ? 0.45 + 0.3 * lock * (r === 0 ? 1 : 0) : 0}
            d={14}
          />
        </At>,
      );
      if (w.tok) k++;
      n++;
    });
    void kept;
  });

  const tW = lay(["desert", "travel", "tip"], OUT_X);
  const tRight = tW[2] + chipW("tip", SZ) / 2;
  const bx = (OUT_X + tRight) / 2;
  return (
    <Stage name="Requirements" cam={cam} enter={enter} exit={exit} floorY={330}>
      {/* the one tokenizer */}
      <At p={[GATE_X, mix(-1100, -40, Math.min(1, gate)) + 30 * Math.max(0, gate - 1), 0]} name="Tokenizer gate">
        <Slab w={GATE_W} h={560} d={170} tone="idle" radius={22} glow={0.15 + 0.35 * ramp(f, go(0), go(0) + 10) * (1 - ramp(f, go(8) + 40, go(8) + 60))}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 34, gap: 18 }}>
            <Label size={34} color={LANCE.offwhite}>tokenizer</Label>
            <div style={{ height: 2, width: 220, background: LANCE.dark500 }} />
            {["lower case", "stem", "stop words"].map((s) => (
              <div key={s} style={{ padding: "10px 16px", borderRadius: 10, background: LANCE.dark700, border: `2px solid ${LANCE.dark500}` }}>
                <Label size={26} color={LANCE.dark100}>{s}</Label>
              </div>
            ))}
          </div>
          {/* the slot the words pass through */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 220, background: `linear-gradient(90deg, ${LANCE.dark800}, ${LANCE.dark700}, ${LANCE.dark800})`, opacity: 0.0 }} />
        </Slab>
      </At>
      {out}
      {/* full text index over the title tokens */}
      {box > 0.01 && (
        <At p={[bx, ROWS[0].y + mix(-500, 0, box), 30]} o={Math.min(1, box * 1.5)} name="FTS index · title">
          <div style={{ position: "relative", width: tRight - OUT_X + 70, height: SZ * 1.7 + 70 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 20,
                border: `4px solid ${LANCE.lavender}`,
                background: "rgba(231,210,246,0.10)",
                boxShadow: `0 0 ${40 * lock}px ${6 * lock}px rgba(231,210,246,${0.5 * lock})`,
              }}
            />
            <div style={{ position: "absolute", left: 20, top: -30, transform: `scale(${pop(f, C.index - 6)})`, transformOrigin: "left bottom" }}>
              <Chip text="FTS index" size={28} tone="big" d={10} />
            </div>
          </div>
        </At>
      )}
    </Stage>
  );
};

export default Reqs;
