#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SYNC_ARTIFACTS="$REPO_ROOT/scripts/sync-artifacts-to-cognee.sh"

DRY_RUN=false
COMMIT_MESSAGE=""
PR_BODY_FILE=""

cleanup() {
  if [[ -n "$PR_BODY_FILE" && -f "$PR_BODY_FILE" ]]; then
    rm -f "$PR_BODY_FILE"
  fi
}

trap cleanup EXIT

run_cmd() {
  if [[ "$DRY_RUN" == true ]]; then
    printf '[dry-run] %s\n' "$*"
    return 0
  fi
  "$@"
}

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

has_package_script() {
  local script_name="$1"
  node -e 'const script = process.argv[1]; const pkg = require("./package.json"); process.exit(pkg.scripts && pkg.scripts[script] ? 0 : 1);' "$script_name" >/dev/null 2>&1
}

sticky_note_hint() {
  if [[ -f STICKYNOTE.example.md ]]; then
    printf 'Seed it from STICKYNOTE.example.md and update the completed-work summary before serving.'
  else
    printf 'Create a local STICKYNOTE.md with a completed-work summary before serving.'
  fi
}

extract_completed_work() {
  awk '
    /^## Completed This Session$/ { capture = 1; next }
    /^## / { if (capture) exit }
    capture { print }
  ' STICKYNOTE.md
}

validate_sticky_note() {
  if [[ ! -f STICKYNOTE.md ]]; then
    fail "Serving requires a usable local STICKYNOTE.md. $(sticky_note_hint)"
  fi

  if git ls-files --error-unmatch STICKYNOTE.md >/dev/null 2>&1; then
    fail 'STICKYNOTE.md must stay local-only and untracked before serving'
  fi

  if [[ -f STICKYNOTE.example.md ]] && git diff --no-index --quiet -- STICKYNOTE.example.md STICKYNOTE.md >/dev/null 2>&1; then
    fail 'STICKYNOTE.md still matches STICKYNOTE.example.md; update it with completed work before serving'
  fi

  local completed_work
  completed_work="$(extract_completed_work)"
  if [[ -z "$(printf '%s' "$completed_work" | tr -d '[:space:]')" ]]; then
    fail 'STICKYNOTE.md must include a completed-work summary under "## Completed This Session" before serving'
  fi
}

latest_commit_subject() {
  git log -1 --pretty=%s HEAD 2>/dev/null || true
}

build_branch_summary() {
  local branch_name="$1"
  local latest_commit="$2"

  printf -- '- Branch: %s\n' "$branch_name"
  printf -- '- Latest commit: %s\n' "$latest_commit"
}

write_pr_body() {
  local branch_name="$1"
  local latest_commit="$2"
  local completed_work
  local branch_summary

  completed_work="$(extract_completed_work)"
  branch_summary="$(build_branch_summary "$branch_name" "$latest_commit")"
  PR_BODY_FILE="$(mktemp "${TMPDIR:-/tmp}/serve-pr-body.XXXXXX")"

  cat > "$PR_BODY_FILE" <<EOF
## Completed Work
$completed_work

## Branch Summary
$branch_summary
EOF
}

working_tree_changes_without_stickynote() {
  git status --porcelain | grep -v '^?? STICKYNOTE\.md$' || true
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --commit-message|-m)
      [[ $# -lt 2 ]] && fail "Missing value for $1"
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $(basename "$0") [--dry-run] [--commit-message <message>]"
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

cd "$REPO_ROOT"

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
if [[ "$branch" == "HEAD" || "$branch" == "unknown" ]]; then
  fail 'Refusing to serve from a detached HEAD'
fi

if [[ "$branch" == "main" || "$branch" == "dev" ]]; then
  fail "Refusing to serve directly from $branch"
fi

if command -v pnpm >/dev/null 2>&1 && [[ -f package.json ]]; then
  if has_package_script typecheck; then
    run_cmd pnpm typecheck
  fi
  if has_package_script test; then
    run_cmd pnpm test
  fi
  if has_package_script test:bdd; then
    run_cmd pnpm test:bdd
  fi
  if has_package_script test:smoke:dist; then
    run_cmd pnpm test:smoke:dist
  fi
elif command -v pytest >/dev/null 2>&1; then
  run_cmd pytest
fi

if command -v gitleaks >/dev/null 2>&1 && [[ -f .gitleaks.toml ]]; then
  run_cmd gitleaks detect --source . --config .gitleaks.toml
fi

validate_sticky_note

if [[ -x "$SYNC_ARTIFACTS" ]]; then
  run_cmd "$SYNC_ARTIFACTS"
fi

working_tree_changes="$(working_tree_changes_without_stickynote)"
if [[ -n "$working_tree_changes" ]]; then
  if [[ -z "$COMMIT_MESSAGE" ]]; then
    fail 'Working tree has uncommitted changes. Commit them before serving or pass --commit-message.'
  fi

  run_cmd git add -A
  run_cmd git commit -m "$COMMIT_MESSAGE"
fi

if command -v bd >/dev/null 2>&1 && [[ -d .beads ]]; then
  printf 'Beads detected. Ensure issue status reflects the latest verification result before serving.\n'
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  fail 'Serving requires an origin remote'
fi

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  run_cmd git push
else
  run_cmd git push -u origin "$branch"
fi

if ! command -v gh >/dev/null 2>&1; then
  fail 'Serving requires GitHub CLI (gh) to open or confirm the PR to dev'
fi

latest_commit="$(latest_commit_subject)"
if [[ -z "$latest_commit" ]]; then
  latest_commit="Serve $branch"
fi
pr_title="$latest_commit"
write_pr_body "$branch" "$latest_commit"
branch_summary="$(build_branch_summary "$branch" "$latest_commit")"

existing_pr_json="$(gh pr list --head "$branch" --json number,url,baseRefName,state)"
existing_pr_base="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.baseRefName) process.stdout.write(prs[0].baseRefName);' "$existing_pr_json")"
existing_pr_number="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.number) process.stdout.write(String(prs[0].number));' "$existing_pr_json")"
existing_pr_url="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.url) process.stdout.write(prs[0].url);' "$existing_pr_json")"

if [[ -n "$existing_pr_base" && "$existing_pr_base" != 'dev' ]]; then
  fail "Open PR for $branch already targets $existing_pr_base; serving only supports PRs to dev"
fi

pr_url="$existing_pr_url"
if [[ -z "$pr_url" ]]; then
  pr_url="$(gh pr create --base dev --head "$branch" --title "$pr_title" --body-file "$PR_BODY_FILE")"
elif [[ -n "$existing_pr_number" ]]; then
  gh pr edit "$existing_pr_number" --body-file "$PR_BODY_FILE" >/dev/null
fi

printf 'Serve complete. PR to dev: %s\n' "$pr_url"
printf 'Post-serve branch summary:\n%s\n' "$branch_summary"
