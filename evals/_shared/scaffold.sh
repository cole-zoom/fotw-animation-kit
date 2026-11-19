#!/bin/bash
# Copies this repo into the eval run's empty working directory.
# node_modules (incl. Remotion's headless Chrome) is APFS-cloned (`cp -c`) when
# possible so it's instant and the run can't touch the original.
set -e
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
# .claude/ (the skill) is NOT copied: the eval runner loads it as the plugin under
# test in the "with" arm, so the "without" arm really runs without the guide.
for item in "$REPO"/*; do
  name="$(basename "$item")"
  case "$name" in out|evals) continue ;; esac
  cp -cR "$item" . 2>/dev/null || cp -R "$item" .
done
mkdir -p evals out
cp "$REPO/evals/lint-scene.mjs" "$REPO/evals/check-scene.sh" evals/
exit 0
