#!/bin/bash
# One-shot check of a scene, used by the evals (and handy by hand):
#   bash evals/check-scene.sh <scene.tsx>
# Type-checks the project and lints the scene against the house rules.
# Prints one RESULT line per step. (Render stills by hand to look at it:
#   npx remotion still <CompositionId> out/look.png --frame=<f>
# Rendering can't run inside the eval sandbox, so the evals don't do it.)
scene="$1"
fail=0
STAMP="$(date +%s)"
mkdir -p out; T="out/.check-$$"   # temp files stay in the workspace (the eval sandbox blocks /tmp)
if npx tsc --noEmit >"$T.tsc" 2>&1; then echo "RESULT typecheck: ok [run $STAMP]"; else echo "RESULT typecheck: FAILED [run $STAMP]"; head -20 "$T.tsc"; fail=1; fi
if node evals/lint-scene.mjs "$scene"; then echo "RESULT lint: ok [run $STAMP]"; else echo "RESULT lint: FAILED [run $STAMP]"; fail=1; fi
rm -f "$T.tsc"
[ $fail = 0 ] && echo "RESULT all: ok [run $STAMP]" || echo "RESULT all: FAILED [run $STAMP]"
exit $fail
