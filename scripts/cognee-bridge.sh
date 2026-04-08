#!/usr/bin/env bash
set -euo pipefail

COGNEE_URL="${COGNEE_URL:-https://pi-harness-cognee.apps.compute.lan}"
COGNEE_API="${COGNEE_URL}/api/v1"
T_HEALTH=5
T_SEARCH=30
T_UPLOAD=60
T_COGNIFY=120

healthy() {
  curl -sk --max-time "$T_HEALTH" -f "${COGNEE_URL}/health" > /dev/null 2>&1
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
      dataset_list=("pi-harness-knowledge" "pi-harness-patterns")
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
      curl -sk --max-time "$T_UPLOAD" -X POST "$COGNEE_API/add" -F "data=@$file" -F "datasetName=$dataset" > /dev/null 2>&1 || true
      count=$((count + 1))
    done < <(find "$dir" \( -name "*.md" -o -name "*.feature" \) -print0 2>/dev/null)
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
    curl -sk --max-time "$T_UPLOAD" -X POST "$COGNEE_API/add" -F "data=@$file" -F "datasetName=$dataset" > /dev/null 2>&1 || true
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
