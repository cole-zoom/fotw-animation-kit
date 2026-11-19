---
type: llm
focus: {source: file, path: src/EvalScene.tsx}
weight: 2
---
This Remotion scene was rewritten to explain: "When you filter on a column with a scalar index, LanceDB doesn't scan every row. The index points straight to the matching rows, so only those get read."

PASS only if ALL hold:
1. A header comment quotes that voiceover and lists numbered beats.
2. The beats show, in order: a filter on a column; that not every row is scanned; the index pointing to the matching rows; only those rows being read. Each is keyed to a cue, not a bare frame number.
3. Colors come from LANCE tokens or slab tones (no hex, no Tailwind-style blue/green/purple).
4. No title, legend, or performance claim is rendered on screen.

Answer PASS or FAIL and name the rule(s) that fail.
