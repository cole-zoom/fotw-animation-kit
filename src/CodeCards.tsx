import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { chroma } from "./retro";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, camPath, ramp, glide, mix, mixV, V3, FONO_EM } from "./boldKit";
import { CUES } from "./cues";

/**
 * "Here's what it looks like in Python. It's also available in Java and Rust."
 * Slide in from Boost, slide out into Reqs. Short (≈4 s), so: one big card.
 *
 *   1  a Python code card fills the frame and types itself in
 *   2  "also available": it swings left and back; on "Java" and "Rust" two more
 *      cards fan in behind it, same call in each language
 *
 * Every line is verbatim API, checked against lance 84d1681e0 (same lines as
 * PythonCode3D.tsx):
 *   python/python/lance/query.py   CombinedFieldsQuery(query, columns, *, boosts=None,
 *                                  operator=FullTextOperator.OR); ds.to_table(full_text_query=…)
 *                                  as in tests/test_scalar_index.py
 *   java/…/ipc/FullTextQuery.java  combinedFields(String, List<String>, List<Float>, Operator),
 *                                  as in LanceScannerFullTextSearchTest
 *   rust/lance-index/…/query.rs    CombinedFieldsQuery::try_new(String, Vec<String>)?
 *                                  .try_with_boosts(Vec<f32>)? .with_operator(Operator::And)
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.code;

const PY = [
  "from lance.query import CombinedFieldsQuery, FullTextOperator",
  "",
  "ds.to_table(",
  "    full_text_query=CombinedFieldsQuery(",
  '        "john smith",',
  '        ["title", "body"],',
  "        boosts=[2.0, 1.0],",
  "        operator=FullTextOperator.AND,",
  "    )",
  ")",
];
const JAVA = [
  "FullTextQuery.combinedFields(",
  '    "john smith",',
  '    Arrays.asList("title", "body"),',
  "    Arrays.asList(2.0f, 1.0f),",
  "    FullTextQuery.Operator.AND);",
];
const RUST = [
  "CombinedFieldsQuery::try_new(",
  '    "john smith".to_string(),',
  '    vec!["title".to_string(), "body".to_string()],',
  ")?",
  ".try_with_boosts(vec![2.0, 1.0])?",
  ".with_operator(Operator::And)",
];

const KW = new Set(["from", "import"]);
/** split a line into coloured runs: strings lavender, the query type orange, keywords dim */
const runs = (line: string): { t: string; c: string }[] => {
  const out: { t: string; c: string }[] = [];
  const re = /("[^"]*")|(\bCombinedFieldsQuery\b|\bcombinedFields\b)|(\b[A-Za-z_]+\b)|([^"A-Za-z_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) out.push({ t: m[1], c: LANCE.lavender });
    else if (m[2]) out.push({ t: m[2], c: LANCE.orange400 });
    else if (m[3]) out.push({ t: m[3], c: KW.has(m[3]) ? LANCE.dark300 : LANCE.offwhite });
    else out.push({ t: m[4], c: LANCE.dark200 });
  }
  return out;
};

const Card: React.FC<{ lang: string; lines: string[]; size: number; chars: number; glow?: number }> = ({ lang, lines, size, chars, glow = 0 }) => {
  const w = Math.max(...lines.map((l) => l.length)) * size * FONO_EM + size * 2.2;
  const lh = size * 1.45;
  const h = lines.length * lh + size * 2.6;
  let left = chars;
  return (
    <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
      <Slab w={w} h={h} d={34} tone="card" radius={22} glow={glow}>
        <div style={{ position: "absolute", left: size * 1.3, top: size * 1.4, fontFamily: AEONIK_FONO, fontSize: size, lineHeight: `${lh}px`, whiteSpace: "pre", textShadow: chroma(0.8) }}>
          {lines.map((l, i) => {
            const n = Math.max(0, Math.min(l.length, left));
            left -= l.length + 1;
            let k = n;
            return (
              <div key={i} style={{ height: lh }}>
                {runs(l).map((r, j) => {
                  const s = r.t.slice(0, Math.max(0, k));
                  k -= r.t.length;
                  return (
                    <span key={j} style={{ color: r.c }}>
                      {s}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Slab>
      <div style={{ position: "absolute", left: 26, top: -36, transform: "translateZ(10px)", transformStyle: "preserve-3d" }}>
        <Chip text={lang} size={30} tone="hit" d={10} />
      </div>
    </div>
  );
};
const total = (ls: string[]) => ls.reduce((a, l) => a + l.length + 1, 0);

export const CodeCards: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const typed = ramp(f, 10, C.python + 24, (n) => n) * total(PY);
  const back = glide(f, C.also - 8, 110);
  const java = glide(f, C.java - 14, 120);
  const rust = glide(f, C.rust - 12, 120);

  const pyAt: V3 = mixV([0, -40, 0], [-470, -60, -120], back);
  const javaAt = mixV([1400, -260, -300], [300, -330, -380], java);
  const rustAt = mixV([1600, 160, -600], [560, 120, -700], rust);
  const cam = camPath(f, [
    [0, { x: 0, y: -40, z: -60, rx: -6, ry: 8 }],
    [C.python, { x: 0, y: -40, z: 0, rx: -6, ry: 2 }],
    [C.also + 20, { x: 40, y: -50, z: 380, rx: -8, ry: -6 }],
    [C.rust + 30, { x: 80, y: -60, z: 460, rx: -8, ry: -8 }],
  ]);
  return (
    <Stage name="Code Cards" cam={cam} enter={enter} exit={exit} floorY={420}>
      {rust > 0.01 && (
        <At p={rustAt} r={[0, mix(-40, -14, rust), 0]} name="Code · Rust">
          <Card lang="rust" lines={RUST} size={30} chars={1e9} />
        </At>
      )}
      {java > 0.01 && (
        <At p={javaAt} r={[0, mix(-40, -12, java), 0]} name="Code · Java">
          <Card lang="java" lines={JAVA} size={30} chars={1e9} />
        </At>
      )}
      <At p={pyAt} r={[0, mix(0, 14, back), 0]} name="Code · Python">
        <Card lang="python" lines={PY} size={34} chars={typed} glow={0.25} />
      </At>
    </Stage>
  );
};

export default CodeCards;
