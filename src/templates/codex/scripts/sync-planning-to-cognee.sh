#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SYNC_SCRIPT="$REPO_ROOT/.claude/scripts/cognee-sync-planning.sh"

if [[ ! -x "$SYNC_SCRIPT" ]]; then
  echo "Planning sync script not found or not executable: $SYNC_SCRIPT" >&2
  exit 1
fi

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Usage: $(basename "$0") [phase-dir] [--summaries-only]"
  exit 0
fi

exec "$SYNC_SCRIPT" "$@"
