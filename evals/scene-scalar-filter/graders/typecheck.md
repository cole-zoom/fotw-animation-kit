---
type: regex
target: trace
pattern: 'RESULT typecheck: ok \[run \d+\]'
match: contains
weight: 1
---
The project type-checks (from evals/check-scene.sh output).
