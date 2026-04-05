#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DRY_RUN=false
COMMIT_MESSAGE=""

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
  fail "Refusing to land from a detached HEAD"
fi

if [[ "$branch" == "main" || "$branch" == "dev" ]]; then
  fail "Refusing to land directly from $branch"
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

if [[ -f STICKYNOTE.example.md && ! -f STICKYNOTE.md ]]; then
  printf 'STICKYNOTE.md is missing; seed it from STICKYNOTE.example.md if you want a local handoff note.\n'
fi

if [[ -n "$(git status --porcelain)" ]]; then
  if [[ -z "$COMMIT_MESSAGE" ]]; then
    fail "Working tree has uncommitted changes. Commit them before landing or pass --commit-message."
  fi

  run_cmd git add -A
  run_cmd git commit -m "$COMMIT_MESSAGE"
fi

if command -v bd >/dev/null 2>&1 && [[ -d .beads ]]; then
  printf 'Beads detected. Ensure issue status reflects the latest verification result before landing.\n'
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  fail "Landing requires an origin remote"
fi

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  run_cmd git push
else
  run_cmd git push -u origin "$branch"
fi

if ! command -v gh >/dev/null 2>&1; then
  fail "Landing requires GitHub CLI (gh) to open or confirm the PR to dev"
fi

existing_pr_json="$(gh pr list --head "$branch" --json number,url,baseRefName,state)"
existing_pr_base="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.baseRefName) process.stdout.write(prs[0].baseRefName);' "$existing_pr_json")"
existing_pr_number="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.number) process.stdout.write(String(prs[0].number));' "$existing_pr_json")"
existing_pr_url="$(node -e 'const prs = JSON.parse(process.argv[1]); if (prs[0]?.url) process.stdout.write(prs[0].url);' "$existing_pr_json")"

if [[ -n "$existing_pr_base" && "$existing_pr_base" != "dev" ]]; then
  fail "Open PR for $branch already targets $existing_pr_base; landing only supports PRs to dev"
fi

pr_url="$existing_pr_url"
if [[ -z "$pr_url" ]]; then
  pr_url="$(gh pr create --base dev --head "$branch" --fill)"
elif [[ -n "$existing_pr_number" ]]; then
  gh pr view "$existing_pr_number" >/dev/null
fi

run_cmd git status --short --branch
printf 'Landing complete. PR to dev: %s\n' "$pr_url"
