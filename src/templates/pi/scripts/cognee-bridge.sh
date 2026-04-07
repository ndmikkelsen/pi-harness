#!/usr/bin/env bash
set -euo pipefail

COGNEE_URL="${COGNEE_URL:-https://{{APP_SLUG}}-cognee.apps.compute.lan}"
COGNEE_API="${COGNEE_URL}/api/v1"
COGNEE_BRIEF_DATASETS="${COGNEE_BRIEF_DATASETS:-{{APP_SLUG}}-knowledge,{{APP_SLUG}}-patterns,{{APP_SLUG}}-behavior,{{APP_SLUG}}-implementation,{{APP_SLUG}}-regressions}"
T_HEALTH=5
T_SEARCH=30
T_UPLOAD=60
T_COGNIFY=120

healthy() {
  curl -sk --max-time "$T_HEALTH" -f "${COGNEE_URL}/health" > /dev/null 2>&1
}

should_skip_path() {
  local file="$1"

  case "$file" in
    */.git/*|*/node_modules/*|*/dist/*|*/coverage/*|*/.next/*|*/.turbo/*|*/.venv/*|*/venv/*|*/tmp/*)
      return 0
      ;;
    */.kamal/secrets|*/.env|*/.env.local|*/.env.development|*/.env.production|*/.env.test)
      return 0
      ;;
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.ico|*.pdf|*.zip|*.gz|*.tar|*.tgz|*.xz|*.7z|*.jar|*.bin|*.exe|*.dll|*.so|*.dylib|*.sqlite|*.db)
      return 0
      ;;
    *.pem|*.key|*.crt|*.p12|*.pfx)
      return 0
      ;;
  esac

  return 1
}

is_text_file() {
  local file="$1"

  if [[ ! -s "$file" ]]; then
    return 0
  fi

  grep -Iq . "$file" 2>/dev/null
}

upload_to_dataset() {
  local file="$1"
  local dataset="$2"

  curl -sk --max-time "$T_UPLOAD" -X POST "$COGNEE_API/add" \
    -F "data=@$file" \
    -F "datasetName=$dataset" > /dev/null 2>&1 || true
}

emit_sync_candidates() {
  local dir="$1"
  local absolute_dir repo_root relative_dir

  absolute_dir="$(cd "$dir" && pwd)"
  repo_root="$(git -C "$absolute_dir" rev-parse --show-toplevel 2>/dev/null || true)"

  if [[ -n "$repo_root" ]]; then
    case "$absolute_dir" in
      "$repo_root") relative_dir='.' ;;
      "$repo_root"/*) relative_dir="${absolute_dir#$repo_root/}" ;;
      *) repo_root='' ;;
    esac
  fi

  if [[ -n "$repo_root" ]]; then
    while IFS= read -r -d '' relative_path; do
      printf '%s\0' "$repo_root/$relative_path"
    done < <(git -C "$repo_root" ls-files -z --cached --others --exclude-standard -- "$relative_dir")
    return
  fi

  find "$dir" -type f -print0 2>/dev/null
}

command="${1:-help}"
shift || true

case "$command" in
  health)
    if healthy; then echo ok; else echo unavailable; fi
    ;;
  query)
    query="${1:-}"
    shift || true
    dataset=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --dataset) shift; dataset="${1:-}" ;;
      esac
      shift || true
    done
    if ! healthy; then echo '{"error":"cognee unavailable"}'; exit 0; fi
    payload="{\"query\":\"${query}\"}"
    if [[ -n "$dataset" ]]; then
      payload="{\"query\":\"${query}\",\"datasets\":[\"${dataset}\"]}"
    fi
    curl -sk --max-time "$T_SEARCH" -X POST "$COGNEE_API/search" -H "Content-Type: application/json" -d "$payload" || echo '{"error":"search failed"}'
    ;;
  brief)
    query="${1:-}"
    shift || true
    datasets=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --datasets) shift; datasets="${1:-}" ;;
      esac
      shift || true
    done
    if ! healthy; then echo "Cognee unavailable - skipping knowledge brief"; exit 0; fi
    if [[ -n "$datasets" ]]; then
      IFS=',' read -r -a dataset_list <<< "$datasets"
    else
      IFS=',' read -r -a dataset_list <<< "$COGNEE_BRIEF_DATASETS"
    fi
    echo "## Knowledge Brief: $query"
    for dataset in "${dataset_list[@]}"; do
      result=$(curl -sk --max-time "$T_SEARCH" -X POST "$COGNEE_API/search" -H "Content-Type: application/json" -d "{\"query\":\"${query}\",\"datasets\":[\"${dataset}\"]}" || true)
      if [[ -n "$result" ]]; then
        echo
        echo "### [$dataset]"
        echo "$result"
      fi
    done
    ;;
  sync-dir)
    dir="${1:-}"
    shift || true
    dataset=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --dataset) shift; dataset="${1:-}" ;;
      esac
      shift || true
    done
    [[ -z "$dataset" ]] && { echo "Error: --dataset required" >&2; exit 1; }
    [[ ! -d "$dir" ]] && { echo "Warning: directory not found: $dir"; exit 0; }
    if ! healthy; then echo "Cognee unavailable - skipping sync"; exit 0; fi
    count=0
    while IFS= read -r -d '' file; do
      if should_skip_path "$file"; then
        continue
      fi
      if ! is_text_file "$file"; then
        continue
      fi
      upload_to_dataset "$file" "$dataset"
      count=$((count + 1))
    done < <(emit_sync_candidates "$dir")
    echo "Synced $count files to $dataset"
    ;;
  upload)
    file="${1:-}"
    shift || true
    dataset=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --dataset) shift; dataset="${1:-}" ;;
      esac
      shift || true
    done
    [[ -z "$dataset" ]] && { echo "Error: --dataset required" >&2; exit 1; }
    if ! healthy; then echo "Cognee unavailable - skipping upload"; exit 0; fi
    upload_to_dataset "$file" "$dataset"
    echo "Uploaded $(basename "$file") to $dataset"
    ;;
  cognify)
    dataset=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --dataset) shift; dataset="${1:-}" ;;
      esac
      shift || true
    done
    if ! healthy; then echo "Cognee unavailable - skipping cognify"; exit 0; fi
    payload='{}'
    if [[ -n "$dataset" ]]; then
      payload="{\"datasets\":[\"${dataset}\"]}"
    fi
    curl -sk --max-time "$T_COGNIFY" -X POST "$COGNEE_API/cognify" -H "Content-Type: application/json" -d "$payload" > /dev/null 2>&1 || true
    echo "Cognify triggered"
    ;;
  *)
    echo "Usage: cognee-bridge.sh <health|query|brief|sync-dir|upload|cognify>"
    ;;
esac
