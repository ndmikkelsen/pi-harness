#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DRY_RUN=false
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

latest_commit_subject() {
  git log -1 --pretty=%s HEAD 2>/dev/null || true
}

comparison_base() {
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    printf 'origin/main'
    return 0
  fi

  if git rev-parse --verify main >/dev/null 2>&1; then
    printf 'main'
    return 0
  fi

  return 1
}

build_commit_summary() {
  local summary=""
  local base_ref=""
  local latest_commit="$1"
  local latest_short_sha=""

  latest_short_sha="$(git rev-parse --short HEAD 2>/dev/null || printf 'HEAD')"

  if base_ref="$(comparison_base)"; then
    summary="$(git log --max-count 20 --format='- %s (%h)' "${base_ref}..HEAD" 2>/dev/null || true)"
  fi

  if [[ -z "$(printf '%s' "$summary" | tr -d '[:space:]')" ]]; then
    summary="- ${latest_commit} (${latest_short_sha})"
  fi

  printf '%s' "$summary"
}

build_promotion_summary() {
  local branch_name="$1"
  local latest_commit="$2"

  printf -- '- Source branch: %s\n' "$branch_name"
  printf -- '- Target branch: main\n'
  printf -- '- Latest commit: %s\n' "$latest_commit"
}

write_pr_body() {
  local branch_name="$1"
  local latest_commit="$2"
  local commit_summary
  local promotion_summary

  commit_summary="$(build_commit_summary "$latest_commit")"
  promotion_summary="$(build_promotion_summary "$branch_name" "$latest_commit")"
  PR_BODY_FILE="$(mktemp "${TMPDIR:-/tmp}/promote-pr-body.XXXXXX")"

  cat > "$PR_BODY_FILE" <<EOF
## Promotion Summary
$promotion_summary

## Commit Summary
$commit_summary
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
    --help|-h)
      echo "Usage: $(basename "$0") [--dry-run]"
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
  fail 'Refusing to promote from a detached HEAD'
fi

if [[ "$branch" != "dev" ]]; then
  fail 'Promotion only supports the dev branch'
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

working_tree_changes="$(working_tree_changes_without_stickynote)"
if [[ -n "$working_tree_changes" ]]; then
  fail 'Promotion requires a clean working tree on dev. Commit or stash changes before promoting.'
fi

if command -v bd >/dev/null 2>&1 && [[ -d .beads ]]; then
  printf 'Beads detected. Ensure release issue state reflects the latest verification result before promoting.\n'
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  fail 'Promotion requires an origin remote'
fi

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  run_cmd git push
else
  run_cmd git push -u origin "$branch"
fi

if ! command -v gh >/dev/null 2>&1; then
  fail 'Promotion requires GitHub CLI (gh) to open or confirm the PR to main'
fi

latest_commit="$(latest_commit_subject)"
if [[ -z "$latest_commit" ]]; then
  latest_commit="Promote $branch to main"
fi
pr_title="Promote $branch to main: $latest_commit"
write_pr_body "$branch" "$latest_commit"
promotion_summary="$(build_promotion_summary "$branch" "$latest_commit")"

existing_pr_json="$(gh pr list --head "$branch" --json number,url,baseRefName,state)"
existing_pr_base="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.baseRefName) process.stdout.write(prs[0].baseRefName);' "$existing_pr_json")"
existing_pr_number="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.number) process.stdout.write(String(prs[0].number));' "$existing_pr_json")"
existing_pr_url="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.url) process.stdout.write(prs[0].url);' "$existing_pr_json")"

if [[ -n "$existing_pr_base" && "$existing_pr_base" != 'main' ]]; then
  fail "Open PR for $branch already targets $existing_pr_base; promotion only supports PRs to main"
fi

pr_url="$existing_pr_url"
if [[ -z "$pr_url" ]]; then
  pr_url="$(gh pr create --base main --head "$branch" --title "$pr_title" --body-file "$PR_BODY_FILE")"
elif [[ -n "$existing_pr_number" ]]; then
  gh pr edit "$existing_pr_number" --body-file "$PR_BODY_FILE" >/dev/null
fi

printf 'Promotion complete. PR to main: %s\n' "$pr_url"
printf 'Post-promotion summary:\n%s\n' "$promotion_summary"
