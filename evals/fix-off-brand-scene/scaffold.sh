#!/bin/bash
# shared setup (copies the repo in), then this case's fixtures/ (if any) on top
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
"$HERE/../_shared/scaffold.sh"
[ -d "$HERE/fixtures" ] && cp -R "$HERE/fixtures/." . || true
