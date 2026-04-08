#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BRIDGE="$REPO_ROOT/scripts/cognee-bridge.sh"
DATASET="${COGNEE_ARTIFACT_DATASET:-{{APP_SLUG}}-artifacts}"
ARTIFACTS=(context.md plan.md progress.md review.md wave.md)

if [[ ! -x "$BRIDGE" ]]; then
  echo "[cognee-sync] Cognee bridge unavailable - skipping artifact sync"
  exit 0
fi

if ! "$BRIDGE" health | grep -q '^ok$'; then
  echo "[cognee-sync] Cognee unavailable - skipping artifact sync"
  exit 0
fi

count=0
for relative_path in "${ARTIFACTS[@]}"; do
  file_path="$REPO_ROOT/$relative_path"
  if [[ -f "$file_path" ]]; then
    "$BRIDGE" upload "$file_path" --dataset "$DATASET" >/dev/null
    count=$((count + 1))
  fi
done

if [[ "$count" -eq 0 ]]; then
  echo "[cognee-sync] No Pi artifacts found; skipping artifact sync"
  exit 0
fi

"$BRIDGE" cognify --dataset "$DATASET" >/dev/null

echo "[cognee-sync] Synced $count Pi artifacts to $DATASET"
