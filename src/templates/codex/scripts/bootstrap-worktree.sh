#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
exec "$repo_root/.claude/scripts/bootstrap-worktree.sh"
