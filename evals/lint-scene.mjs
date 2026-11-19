#!/usr/bin/env node
// Static checks of a scene file against the house rules in
// .claude/skills/lancedb-motion (no deps; Node 18+).
//
//   node evals/lint-scene.mjs src/MyScene.tsx [--json]
//
// Exit code 0 = every "error" rule passed. "warn" rules are reported only.

import { readFileSync } from "node:fs";

const file = process.argv[2];
const asJson = process.argv.includes("--json");
if (!file) {
  console.error("usage: node evals/lint-scene.mjs <scene.tsx> [--json]");
  process.exit(2);
}
const src = readFileSync(file, "utf8");

// strip comments (keep line structure) so rules look at code only
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
const header = (src.match(/\/\*\*?[\s\S]*?\*\//) || [""])[0];

const results = [];
const rule = (id, level, pass, detail) => results.push({ id, level, pass: !!pass, detail });

// 1. scene header: quotes the VO, numbers its beats, records facts/numbers
rule("header-vo-quote", "error", /"[^"\n]{12,}/.test(header), "header quotes the VO line(s) it covers");
rule("header-beats", "error", /^\s*\*\s+(\d+|[A-Z]{1,5}(\s?\d+)?)\s{2,}\S/m.test(header), "header lists its beats ( *   1  … / CASE 1 …)");
rule("header-facts", "error", /(code facts|facts|numbers)\s*[:(]|checked against|\b[0-9a-f]{8,40}\b/i.test(header),
  'header records where facts come from ("Code facts (repo @ commit)", "Numbers:", or a commit)');

// 2. colors only via LANCE / TONE
const hex = [...code.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
rule("no-hex-colors", "error", hex.length === 0, hex.length ? `hex literals: ${[...new Set(hex)].join(", ")}` : "no hex literals");
const fn = [...code.matchAll(/\b(rgba?|hsla?)\(\s*\d/g)].map((m) => m[0]);
rule("no-rgb-hsl", "warn", fn.length === 0, fn.length ? `${fn.length} rgb()/hsl() literal(s); prefer LANCE tokens / Slab glow` : "none");
const named = [...code.matchAll(/(?:color|background|fill|stroke)\s*[:=]\s*["'](white|black|red|blue|green|gray|grey|orange|purple)["']/gi)].map((m) => m[1]);
rule("no-named-colors", "error", named.length === 0, named.length ? `named colors: ${named.join(", ")}` : "none");

// 3. fonts only via AEONIK constants
const fontStr = [...code.matchAll(/fontFamily\s*:\s*["'`]/g)].length;
rule("fonts-via-constants", "error", fontStr === 0, fontStr ? `${fontStr} fontFamily string literal(s); use AEONIK / AEONIK_FONO` : "ok");

// 4. built on the kit
rule("uses-stage", "error", /<Stage\b/.test(code) && /from\s+["']\.\/boldKit["']/.test(code), "renders a <Stage> from ./boldKit");
rule("no-threejs", "warn", !/@remotion\/three|from\s+["']three["']/.test(code), "no three.js (legacy; PR page only)");

// 5. no titles / kickers / legends
const banned = [...code.matchAll(/\b(Kicker|Stat|Figure|Playhead)\b/g)].map((m) => m[1]);
rule("no-kickers", "error", banned.length === 0, banned.length ? `uses ${[...new Set(banned)].join(", ")} (titles/kickers are banned)` : "ok");

// 6. timing keyed to cues, not magic numbers
const hasCues = /\b(CUES|cues)\b/.test(code) || /const\s+C\s*=/.test(code);
rule("has-cues", "error", hasCues, "beats come from a cue object (CUES / C)");
const springCalls = [...code.matchAll(/\b(pop|glide)\(\s*f\s*,\s*([^,)]+)/g)];
const literal = springCalls.filter((m) => /^\s*\d+\s*$/.test(m[2])).length;
rule("beats-on-cues", "warn", springCalls.length === 0 || literal / springCalls.length <= 0.25,
  `${literal}/${springCalls.length} pop/glide calls start at a literal frame instead of a cue`);

// 7. text on faces: a <Label> placed in the world (inside <At>) should sit on a face
//    (Slab/Chip/RowCard/…). Static nesting can't see across helper components, so
//    this is a warning; the rubric grader checks it on the rendered stills.
const FACES = new Set(["Slab", "Chip", "RowCard", "Bar", "Badge", "Panel", "Laptop", "TitleBar"]);
const stack = [];
let floating = 0;
const tagRe = /<(\/?)([A-Z][A-Za-z0-9]*)\b/g;
let m;
while ((m = tagRe.exec(code))) {
  const [, close, name] = m;
  if (close) {
    const i = stack.lastIndexOf(name);
    if (i >= 0) stack.length = i;
    continue;
  }
  // find end of this opening tag, respecting {…} nesting, to see if it self-closes
  let depth = 0, j = tagRe.lastIndex, self = false;
  for (; j < code.length; j++) {
    const c = code[j];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (depth === 0 && c === ">") { self = code[j - 1] === "/"; break; }
  }
  // only judge Labels placed in the world (inside an <At>); helper components are judged where they're used
  if (name === "Label" && stack.includes("At") && !stack.some((t) => FACES.has(t))) floating++;
  if (!self) stack.push(name);
  tagRe.lastIndex = j + 1;
}
rule("text-on-faces", "warn", floating === 0, floating ? `${floating} <Label> not inside a Slab/Chip face` : "every Label is on a face");

// 8. names on placements (readable layers)
const ats = [...code.matchAll(/<At\b[^>]*?>/gs)];
const unnamed = ats.filter((a) => !/\bname=/.test(a[0])).length;
rule("named-placements", "warn", unnamed === 0, `${unnamed}/${ats.length} <At> without a name`);

const failed = results.filter((r) => r.level === "error" && !r.pass);
if (asJson) {
  console.log(JSON.stringify({ file, pass: failed.length === 0, results }, null, 1));
} else {
  for (const r of results) console.log(`${r.pass ? "PASS" : r.level === "error" ? "FAIL" : "WARN"}  ${r.id.padEnd(20)} ${r.detail}`);
  console.log(failed.length ? `\n${failed.length} rule(s) failed` : "\nall required rules passed");
}
process.exit(failed.length ? 1 : 0);
