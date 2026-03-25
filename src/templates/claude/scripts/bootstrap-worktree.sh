#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

if command -v direnv >/dev/null 2>&1 && [[ -f "$repo_root/.envrc" ]]; then
  direnv allow "$repo_root/.envrc" >/dev/null 2>&1 || true
fi

if [[ -f "$repo_root/STICKYNOTE.example.md" && ! -f "$repo_root/STICKYNOTE.md" ]]; then
  cp "$repo_root/STICKYNOTE.example.md" "$repo_root/STICKYNOTE.md"
fi

cat <<EOF
Bootstrapped worktree-local AI workflow state.

- direnv: allowed if available
- STICKYNOTE.md: seeded from STICKYNOTE.example.md when missing

Next:
1. Run `bd init` once if Beads has not been initialized in this repository yet
2. Run ./.claude/scripts/bd ready --json
3. Open the stream-specific planning doc before implementation
EOF
