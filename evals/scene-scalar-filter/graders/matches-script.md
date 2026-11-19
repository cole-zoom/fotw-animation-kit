---
type: llm
focus: {source: file, path: src/EvalScene.tsx}
weight: 2
---
This is a Remotion scene written for this voiceover:

"When you filter on a column with a scalar index, LanceDB doesn't scan every row. The index points straight to the matching rows, so only those get read."

PASS only if ALL hold:
1. The header comment quotes that voiceover and lists numbered beats.
2. Each idea in the voiceover has its own beat in the code, keyed to a cue for the word that says it, in the order spoken.
3. The mechanism is shown with concrete objects that move or light up (e.g. rows, files, an index), not explained with text.
4. On-screen strings contain no invented specifics: no API/function names, no counts, sizes, percentages or timings presented as facts.
5. No title, kicker, legend or explanatory sentence is rendered on screen.

Answer PASS or FAIL and name the rule(s) that fail.
