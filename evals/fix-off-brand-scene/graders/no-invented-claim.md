---
type: llm
focus: {source: file, path: src/EvalScene.tsx}
weight: 2
---
The original scene showed an unverifiable on-screen claim, "10x faster!". PASS if no performance claim (any speedup, "x faster", percentage, or timing) is rendered on screen anymore. Mentions inside code comments (e.g. explaining that the claim was removed) are fine. FAIL if any such claim is still rendered.
