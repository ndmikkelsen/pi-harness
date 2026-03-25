#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRIDGE="$SCRIPT_DIR/cognee-bridge.sh"
DATASET="{{APP_SLUG}}-planning"
SUMMARIES_ONLY=false
PHASE_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --summaries-only)
      SUMMARIES_ONLY=true
      ;;
    .planning/*)
      PHASE_DIR="$REPO_ROOT/$1"
      ;;
    *)
      PHASE_DIR="$1"
      ;;
  esac
  shift
done

if ! "$BRIDGE" health | grep -q '^ok$'; then
  echo "[cognee-sync] Cognee unavailable - skipping planning sync"
  exit 0
fi

if [[ -n "$PHASE_DIR" ]]; then
  "$BRIDGE" sync-dir "$PHASE_DIR" --dataset "$DATASET"
  while IFS= read -r -d '' file; do
    "$BRIDGE" upload "$file" --dataset "$DATASET"
  done < <(find "$REPO_ROOT/.planning" -name 'SUMMARY.md' -print0 2>/dev/null)
  "$BRIDGE" cognify --dataset "$DATASET"
  echo "[cognee-sync] Done"
  exit 0
else
  for file in "$REPO_ROOT/.planning/PROJECT.md" "$REPO_ROOT/.planning/STATE.md" "$REPO_ROOT/.planning/ROADMAP.md"; do
    [[ -f "$file" ]] && "$BRIDGE" upload "$file" --dataset "$DATASET"
  done

  while IFS= read -r -d '' file; do
    "$BRIDGE" upload "$file" --dataset "$DATASET"
  done < <(find "$REPO_ROOT/.planning/phases" \( -name 'PLAN.md' -o -name 'SUMMARY.md' -o -name 'RESEARCH.md' \) -print0 2>/dev/null)
fi

"$BRIDGE" cognify --dataset "$DATASET"
