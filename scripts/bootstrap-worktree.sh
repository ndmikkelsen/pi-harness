#!/usr/bin/env bash
set -euo pipefail

quiet=false
if [[ "${1:-}" == "--quiet" ]]; then
  quiet=true
  shift
fi

if [[ $# -gt 0 ]]; then
  printf 'Usage: %s [--quiet]\n' "$(basename "$0")" >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
git_dir="$(git rev-parse --git-dir 2>/dev/null || true)"
git_common_dir="$(git rev-parse --git-common-dir 2>/dev/null || true)"
main_root="$repo_root"
linked_worktree=false
beads_available=false
sticky_status='not seeded'
direnv_status='not configured'
shared_links=()
sticky_link_action='none'
sticky_canonical_synced=false

log_action() {
  if [[ "$quiet" == true ]]; then
    printf 'worktree-setup: %s\n' "$1"
  fi
}

join_by_comma() {
  local first=true
  local item

  for item in "$@"; do
    if [[ "$first" == true ]]; then
      printf '%s' "$item"
      first=false
    else
      printf ', %s' "$item"
    fi
  done
}

link_if_missing() {
  local relative_path="$1"
  local source_path="$2"
  local destination_path="$3"

  [[ -e "$source_path" || -L "$source_path" ]] || return 0
  [[ -e "$destination_path" || -L "$destination_path" ]] && return 0

  mkdir -p "$(dirname "$destination_path")"
  ln -s "$source_path" "$destination_path"
  shared_links+=("$relative_path")
  log_action "linked $relative_path from main worktree"
}

seed_sticky_note_from_example() {
  local target_root="$1"
  local target_path="$target_root/STICKYNOTE.md"
  local example_path="$target_root/STICKYNOTE.example.md"

  if [[ -e "$target_path" || -L "$target_path" ]]; then
    return 1
  fi

  if [[ ! -f "$example_path" ]]; then
    return 1
  fi

  cp "$example_path" "$target_path"
  return 0
}

ensure_worktree_sticky_note_links_to_main() {
  local canonical_path="$1"
  local destination_path="$2"

  sticky_link_action='none'
  sticky_canonical_synced=false

  [[ -e "$canonical_path" || -L "$canonical_path" ]] || return 1

  if [[ -L "$destination_path" ]]; then
    if [[ "$(readlink "$destination_path")" == "$canonical_path" ]]; then
      sticky_link_action='already linked'
      return 0
    fi

    rm -f "$destination_path"
  elif [[ -e "$destination_path" ]]; then
    if ! cmp -s "$destination_path" "$canonical_path"; then
      cp "$destination_path" "$canonical_path"
      sticky_canonical_synced=true
      log_action 'updated main worktree STICKYNOTE.md from a linked worktree copy'
    fi

    rm -f "$destination_path"
  fi

  mkdir -p "$(dirname "$destination_path")"
  ln -s "$canonical_path" "$destination_path"
  sticky_link_action='linked'
  log_action 'linked STICKYNOTE.md from main worktree canonical note'
  return 0
}

if [[ -n "$git_dir" && -n "$git_common_dir" && "$git_dir" != "$git_common_dir" ]]; then
  linked_worktree=true
  main_root="$(dirname "$git_common_dir")"

  link_if_missing '.env' "$main_root/.env" "$repo_root/.env"
  link_if_missing '.env.local' "$main_root/.env.local" "$repo_root/.env.local"
  link_if_missing '.kamal/secrets' "$main_root/.kamal/secrets" "$repo_root/.kamal/secrets"
  link_if_missing '.kamal/secrets-common' "$main_root/.kamal/secrets-common" "$repo_root/.kamal/secrets-common"

  shopt -s nullglob
  for source_path in "$main_root"/.env.*.local; do
    relative_path="${source_path#"$main_root"/}"
    link_if_missing "$relative_path" "$source_path" "$repo_root/$relative_path"
  done

  for source_path in "$main_root"/.kamal/secrets.*; do
    relative_path="${source_path#"$main_root"/}"
    if [[ "$relative_path" == '.kamal/secrets.example' ]]; then
      continue
    fi
    link_if_missing "$relative_path" "$source_path" "$repo_root/$relative_path"
  done
  shopt -u nullglob
fi

if [[ -d "$repo_root/.beads" ]] && command -v bd >/dev/null 2>&1; then
  beads_available=true
fi

if [[ "$linked_worktree" == true ]]; then
  if seed_sticky_note_from_example "$main_root"; then
    sticky_status='seeded main worktree canonical note from STICKYNOTE.example.md'
    log_action 'seeded main worktree STICKYNOTE.md from STICKYNOTE.example.md'
  elif [[ ! -e "$main_root/STICKYNOTE.md" && ! -L "$main_root/STICKYNOTE.md" && -f "$repo_root/STICKYNOTE.md" && ! -L "$repo_root/STICKYNOTE.md" ]]; then
    cp "$repo_root/STICKYNOTE.md" "$main_root/STICKYNOTE.md"
    sticky_status='promoted an existing linked-worktree note into the main worktree canonical note'
    log_action 'promoted a linked worktree STICKYNOTE.md into the main worktree canonical note'
  fi

  if ensure_worktree_sticky_note_links_to_main "$main_root/STICKYNOTE.md" "$repo_root/STICKYNOTE.md"; then
    if [[ "$sticky_canonical_synced" == true ]]; then
      sticky_status='updated the main worktree canonical note from this worktree and linked it here'
    elif [[ "$sticky_status" == 'seeded main worktree canonical note from STICKYNOTE.example.md' ]]; then
      sticky_status='seeded main worktree canonical note from STICKYNOTE.example.md and linked it here'
    elif [[ "$sticky_status" == 'promoted an existing linked-worktree note into the main worktree canonical note' ]]; then
      sticky_status='promoted an existing linked-worktree note into the main worktree canonical note and linked it here'
    elif [[ "$sticky_link_action" == 'already linked' ]]; then
      sticky_status='already linked to the main worktree canonical STICKYNOTE.md'
    else
      sticky_status='linked to the main worktree canonical STICKYNOTE.md'
    fi
  else
    sticky_status='template missing'
  fi
elif seed_sticky_note_from_example "$repo_root"; then
  sticky_status='seeded from STICKYNOTE.example.md'
  log_action 'seeded STICKYNOTE.md from STICKYNOTE.example.md'
elif [[ -e "$repo_root/STICKYNOTE.md" || -L "$repo_root/STICKYNOTE.md" ]]; then
  sticky_status='already present'
else
  sticky_status='template missing'
fi

if [[ -f "$repo_root/.envrc" ]] && command -v direnv >/dev/null 2>&1; then
  direnv allow "$repo_root/.envrc" >/dev/null 2>&1 || true
  direnv_status='allowed .envrc for this path'
  log_action "direnv allow'd .envrc"
elif [[ -f "$repo_root/.envrc" ]]; then
  direnv_status='.envrc present; run direnv allow when direnv is installed'
else
  direnv_status='.envrc not present'
fi

if [[ "$beads_available" == true ]]; then
  beads_status="tracking enabled"
else
  beads_status="not initialized"
fi

shared_status='none linked'
if (( ${#shared_links[@]} > 0 )); then
  shared_status="$(join_by_comma "${shared_links[@]}")"
fi

if [[ "$quiet" == true ]]; then
  exit 0
fi

cat <<EOF
Bootstrapped worktree-local Pi workflow state.

- STICKYNOTE.md: $sticky_status
- Shared local env files: $shared_status
- Direnv: $direnv_status
- Beads: $beads_status

Next:
1. Run \`bd init\` once if Beads has not been initialized in this repository yet
2. If you are resuming in-flight work, review \`STICKYNOTE.md\`, the active Beads issue, and any repo-local handoff or plan context first
3. If Beads is available, run \`bd ready --json\`, claim the active issue, and continue from the repo's documented workflow
4. Review \`AGENTS.md\`, the repo's current handoff notes, and the relevant `.pi/*` runtime files before implementation
EOF
