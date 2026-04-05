import os from 'node:os';
import path from 'node:path';

export const LOCAL_LAUNCHER_NAMES = ['pi-harness'] as const;

export function defaultBinDir(): string {
  return path.join(os.homedir(), '.local', 'bin');
}

export function renderLauncherScript(repoPath: string): string {
  return `#!/usr/bin/env bash

set -euo pipefail

REPO="\${PI_HARNESS_REPO:-${repoPath}}"
DIST="$REPO/dist/src/cli.js"
SRC="$REPO/src/cli.ts"
TSX="$REPO/node_modules/.bin/tsx"

die() {
  printf '%s: %s\\n' "\$(basename "$0")" "$*" >&2
  exit 1
}

[[ -d "$REPO" ]] || die "repo not found at $REPO"

if [[ -f "$DIST" ]]; then
  exec node "$DIST" "$@"
fi

if command -v pnpm >/dev/null 2>&1 && [[ -f "$REPO/package.json" ]]; then
  if pnpm --dir "$REPO" build >/dev/null 2>&1 && [[ -f "$DIST" ]]; then
    exec node "$DIST" "$@"
  fi

if [[ -x "$TSX" && -f "$SRC" ]]; then
  exec "$TSX" "$SRC" "$@"
fi
fi

die "CLI is not ready. Run: cd \"$REPO\" && pnpm install && pnpm build"
`;
}
