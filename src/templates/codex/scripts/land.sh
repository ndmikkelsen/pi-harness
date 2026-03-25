#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SYNC_PLANNING="$REPO_ROOT/.codex/scripts/sync-planning-to-cognee.sh"

DRY_RUN=false

run_cmd() {
  if [[ "$DRY_RUN" == true ]]; then
    printf '[dry-run] %s\n' "$*"
    return 0
  fi
  "$@"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      echo "Usage: $(basename "$0") [--dry-run]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

cd "$REPO_ROOT"

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
if [[ "$branch" == "main" || "$branch" == "dev" ]]; then
  echo "Refusing to land directly from $branch" >&2
  exit 1
fi

if command -v pnpm >/dev/null 2>&1 && [[ -f package.json ]]; then
  run_cmd pnpm test
elif command -v pytest >/dev/null 2>&1; then
  run_cmd pytest
fi

if command -v gitleaks >/dev/null 2>&1 && [[ -f .gitleaks.toml ]]; then
  run_cmd gitleaks detect --source . --no-git --config .gitleaks.toml
fi

date_str="$(date +%Y-%m-%d)"
commit_hash="$(git rev-parse --short HEAD 2>/dev/null || echo none)"
commit_subject="$(git log -1 --pretty=%s 2>/dev/null || echo 'no commits yet')"
files_changed="$(git diff --name-only HEAD 2>/dev/null || true)"
if [[ -z "$files_changed" ]]; then
  files_changed="$(git ls-files --others --exclude-standard)"
fi

if [[ "$DRY_RUN" == true ]]; then
  printf '[dry-run] write STICKYNOTE.md\n'
else
  cat > STICKYNOTE.md <<EOF
# Session Handoff

**Date:** $date_str
**Branch:** $branch
**Last Commit:** $commit_hash - $commit_subject

## Completed This Session

- Completed Codex workflow work and validation.

## Key Files Changed

${files_changed:-"- none"}

## Follow-Up Notes

- none recorded by this script

## Review Findings

No automated review findings were recorded by ./.codex/scripts/land.sh.

## Pending/Follow-up

See .planning/STATE.md for the latest follow-up context.

## Context for Next Session

Use .codex/ entrypoints while keeping .rules/ and .planning/ canonical.

## Technical Notes

Landing used the Codex wrapper scripts and shared Claude backend scripts.
EOF
fi

if [[ -x "$SYNC_PLANNING" ]]; then
  run_cmd "$SYNC_PLANNING" --summaries-only
fi

run_cmd git status
