#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRIDGE="$REPO_ROOT/.codex/scripts/cognee-bridge.sh"

if [[ ! -x "$BRIDGE" ]]; then
  echo "Bridge script not found or not executable: $BRIDGE" >&2
  exit 1
fi

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" || $# -eq 0 ]]; then
  echo "Usage: $(basename \"$0\") \"<query>\" [--datasets d1,d2]"
  exit 0
fi

exec "$BRIDGE" brief "$@"
