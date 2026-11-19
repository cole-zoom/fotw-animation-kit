---
tags: [build, fix]
runs: 1
max_turns: 80
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
`src/EvalScene.tsx` was rejected in review: "off-brand, looks AI-generated, and where did 10x come from?" Rework it to follow this repo's house style (use the lancedb-motion skill). Keep the same idea. Its voiceover is:

"When you filter on a column with a scalar index, LanceDB doesn't scan every row. The index points straight to the matching rows, so only those get read."

- It isn't registered yet: add it to `src/Root.tsx` as composition `EvalScene` (1920×1080, 60 fps, about 9 seconds).
- There's no lance source checkout here; don't put anything on screen you can't verify.
- When done, run `bash evals/check-scene.sh src/EvalScene.tsx` and fix anything it reports. Re-run until it prints `RESULT all: ok`. (Rendering isn't available in this environment, so check your layout math by reading the code carefully: things in frame, nothing overlapping, text on faces.)

Finish with a short list of what you changed and why.
