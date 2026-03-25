#!/usr/bin/env bash
set -euo pipefail

[[ "${3:-0}" == "1" ]] || exit 0

git_dir="$(git rev-parse --git-dir 2>/dev/null || true)"
git_common_dir="$(git rev-parse --git-common-dir 2>/dev/null || true)"
[[ -n "$git_dir" && -n "$git_common_dir" && "$git_dir" != "$git_common_dir" ]] || exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || exit 0

if command -v direnv >/dev/null 2>&1 && [[ -f "$repo_root/.envrc" ]]; then
  direnv allow "$repo_root/.envrc" >/dev/null 2>&1 || true
fi
