---
tags: [build]
runs: 1
max_turns: 80
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
You're making an explainer scene for a LanceDB video in this repo. Use the repo's lancedb-motion skill and follow its workflow.

Voiceover for the scene (no recording yet, so use placeholder cues):

"Every write adds a few small files to the table. Over time, reads have to open all of them. Compaction rewrites those small files into a few large ones, so the same read opens far fewer files."

Requirements:
- Write the scene in `src/EvalScene.tsx` and register it in `src/Root.tsx` as a composition with id `EvalScene` (1920×1080, 60 fps, about 10 seconds).
- There's no lance source checkout here, so put nothing on screen that would need the code to verify (no API names, no file counts or sizes you can't stand behind), and say so in the scene header.
- When done, run `bash evals/check-scene.sh src/EvalScene.tsx` and fix anything it reports. Re-run until it prints `RESULT all: ok`. (Rendering isn't available in this environment, so check your layout math by reading the code carefully: things in frame, nothing overlapping, text on faces.)

Finish with one short paragraph describing the scene.
