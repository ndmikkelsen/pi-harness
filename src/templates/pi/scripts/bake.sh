#!/usr/bin/env bash
set -euo pipefail

PI_HARNESS_BIN="${PI_HARNESS_BIN:-pi-harness}"
LEGACY_CLEANUP_MANIFEST="legacy-ai-frameworks-v1"

if ! command -v "$PI_HARNESS_BIN" >/dev/null 2>&1; then
  if [ -x "$HOME/.local/bin/pi-harness" ]; then
    PI_HARNESS_BIN="$HOME/.local/bin/pi-harness"
  else
    echo "scripts/bake.sh: pi-harness not found. Install it with: pnpm install && pnpm build && pnpm install:local" >&2
    exit 1
  fi
fi

looks_like_path() {
  local value="${1:-}"
  [[ "$value" == "." || "$value" == ".." || "$value" == ~/* || "$value" == /* || "$value" == *"/"* ]]
}

expand_home() {
  local value="${1:-}"
  if [[ "$value" == ~/* ]]; then
    printf '%s\n' "$HOME/${value#~/}"
  else
    printf '%s\n' "$value"
  fi
}

resolve_target_dir() {
  local input="${1:-.}"
  local expanded
  expanded="$(expand_home "$input")"

  if looks_like_path "$input"; then
    python3 - "$PWD" "$expanded" <<'PY'
import os
import sys
print(os.path.realpath(os.path.join(sys.argv[1], sys.argv[2])))
PY
  else
    python3 - "$PWD" "$input" <<'PY'
import os
import sys
print(os.path.realpath(os.path.join(sys.argv[1], sys.argv[2])))
PY
  fi
}

directory_has_files() {
  local target_dir="$1"
  [ -d "$target_dir" ] && [ -n "$(ls -A "$target_dir" 2>/dev/null)" ]
}

has_arg() {
  local needle="$1"
  shift || true
  for arg in "$@"; do
    if [ "$arg" = "$needle" ]; then
      return 0
    fi
  done
  return 1
}

has_explicit_control_flags() {
  for arg in "$@"; do
    case "$arg" in
      --mode|--force|--cleanup-manifest|--cleanup-confirm-all|--merge-root-files|--non-interactive|--dry-run)
        return 0
        ;;
    esac
  done
  return 1
}

positionals=()
expect_value=0
for arg in "$@"; do
  if [ "$expect_value" -eq 1 ]; then
    expect_value=0
    continue
  fi

  case "$arg" in
    --mode|--cleanup-manifest|--dolt-port|--cognee-db-port|--compute-host|--compute-user|--ssh-key-path)
      expect_value=1
      continue
      ;;
  esac

  if [[ "$arg" == --* || "$arg" == -* ]]; then
    continue
  fi

  positionals+=("$arg")
done

command_args=("$@")
if ! has_arg --init-json "$@"; then
  command_args+=(--init-json)
fi

if has_arg --help "$@" || has_arg -h "$@" || has_explicit_control_flags "$@" || [ "${#positionals[@]}" -gt 1 ]; then
  exec "$PI_HARNESS_BIN" "${command_args[@]}"
fi

target_input="."
if [ "${#positionals[@]}" -eq 1 ]; then
  target_input="${positionals[0]}"
fi

target_dir="$(resolve_target_dir "$target_input")"
if directory_has_files "$target_dir"; then
  command_args=(
    --mode existing
    --force
    --cleanup-manifest "$LEGACY_CLEANUP_MANIFEST"
    --cleanup-confirm-all
    "$@"
  )
  if ! has_arg --init-json "$@"; then
    command_args+=(--init-json)
  fi
fi

exec "$PI_HARNESS_BIN" "${command_args[@]}"
