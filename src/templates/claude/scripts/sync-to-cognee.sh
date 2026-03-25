#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRIDGE="$SCRIPT_DIR/cognee-bridge.sh"

if ! "$BRIDGE" health | grep -q '^ok$'; then
  echo "Cognee is not reachable"
  exit 1
fi

"$BRIDGE" sync-dir "$REPO_ROOT/.rules" --dataset "{{APP_SLUG}}-patterns"
"$BRIDGE" sync-dir "$REPO_ROOT/docs" --dataset "{{APP_SLUG}}-docs" 2>/dev/null || true
"$SCRIPT_DIR/cognee-sync-planning.sh"
