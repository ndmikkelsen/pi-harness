#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BRIDGE="$REPO_ROOT/scripts/cognee-bridge.sh"
ARTIFACT_SYNC="$REPO_ROOT/scripts/sync-artifacts-to-cognee.sh"
APP_SLUG="${APP_SLUG:-pi-harness}"
KNOWLEDGE_DATASET="${COGNEE_KNOWLEDGE_DATASET:-$APP_SLUG-knowledge}"
PATTERNS_DATASET="${COGNEE_PATTERNS_DATASET:-$APP_SLUG-patterns}"
BEHAVIOR_DATASET="${COGNEE_BEHAVIOR_DATASET:-$APP_SLUG-behavior}"
IMPLEMENTATION_DATASET="${COGNEE_IMPLEMENTATION_DATASET:-$APP_SLUG-implementation}"
REGRESSIONS_DATASET="${COGNEE_REGRESSIONS_DATASET:-$APP_SLUG-regressions}"

if [[ ! -x "$BRIDGE" ]]; then
  echo "[cognee-seed] Cognee bridge unavailable: $BRIDGE" >&2
  exit 1
fi

if ! "$BRIDGE" health | grep -q '^ok$'; then
  echo "[cognee-seed] Cognee unavailable - skipping seed"
  exit 0
fi

sync_dir_if_present() {
  local relative_path="$1"
  local dataset="$2"
  local absolute_path="$REPO_ROOT/$relative_path"

  if [[ -d "$absolute_path" ]]; then
    "$BRIDGE" sync-dir "$absolute_path" --dataset "$dataset"
  fi
}

upload_if_present() {
  local relative_path="$1"
  local dataset="$2"
  local absolute_path="$REPO_ROOT/$relative_path"

  if [[ -f "$absolute_path" ]]; then
    "$BRIDGE" upload "$absolute_path" --dataset "$dataset"
  fi
}

sync_dir_if_present docs "$KNOWLEDGE_DATASET"
upload_if_present README.md "$KNOWLEDGE_DATASET"
upload_if_present AGENTS.md "$KNOWLEDGE_DATASET"

sync_dir_if_present .pi "$PATTERNS_DATASET"
sync_dir_if_present scripts "$PATTERNS_DATASET"

sync_dir_if_present apps/cli/features "$BEHAVIOR_DATASET"

sync_dir_if_present src "$IMPLEMENTATION_DATASET"
upload_if_present package.json "$IMPLEMENTATION_DATASET"

sync_dir_if_present tests "$REGRESSIONS_DATASET"

for dataset in "$KNOWLEDGE_DATASET" "$PATTERNS_DATASET" "$BEHAVIOR_DATASET" "$IMPLEMENTATION_DATASET" "$REGRESSIONS_DATASET"; do
  "$BRIDGE" cognify --dataset "$dataset" > /dev/null
done

if [[ -x "$ARTIFACT_SYNC" ]]; then
  "$ARTIFACT_SYNC"
fi

echo "[cognee-seed] Seeded datasets: $KNOWLEDGE_DATASET, $PATTERNS_DATASET, $BEHAVIOR_DATASET, $IMPLEMENTATION_DATASET, $REGRESSIONS_DATASET"
