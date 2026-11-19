---
type: llm
focus: {source: file, path: src/EvalScene.tsx}
weight: 2
---
This is a Remotion scene written for this voiceover:

"Every write adds a few small files to the table. Over time, reads have to open all of them. Compaction rewrites those small files into a few large ones, so the same read opens far fewer files."

PASS only if ALL hold:
1. The header comment quotes that voiceover and lists numbered beats.
2. Each idea in the voiceover has its own beat in the code, keyed to a cue for the word that says it, in the order spoken.
3. The mechanism is shown with concrete objects that move or light up (e.g. rows, files, an index), not explained with text.
4. On-screen strings contain no invented specifics: no API/function names, no counts, sizes, percentages or timings presented as facts.
5. No title, kicker, legend or explanatory sentence is rendered on screen.

Answer PASS or FAIL and name the rule(s) that fail.
