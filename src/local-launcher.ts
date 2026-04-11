import os from 'node:os';
import path from 'node:path';

export const LOCAL_LAUNCHER_NAMES = ['pi-harness'] as const;
export const GLOBAL_BAKE_EXTENSION_NAME = 'pi-harness-bake';

interface GlobalBakeExtensionOptions {
  launcherPath: string;
}

export function defaultBinDir(): string {
  return path.join(os.homedir(), '.local', 'bin');
}

export function defaultPiAgentDir(): string {
  return path.join(os.homedir(), '.pi', 'agent');
}

export function defaultPiExtensionsDir(piAgentDir = defaultPiAgentDir()): string {
  return path.join(piAgentDir, 'extensions');
}

export function defaultGlobalBakeExtensionDir(piAgentDir = defaultPiAgentDir()): string {
  return path.join(defaultPiExtensionsDir(piAgentDir), GLOBAL_BAKE_EXTENSION_NAME);
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
fi

if [[ -x "$TSX" && -f "$SRC" ]]; then
  exec "$TSX" "$SRC" "$@"
fi

die "CLI is not ready. Run: cd \"$REPO\" && pnpm install && pnpm build"
`;
}

export function renderGlobalBakeExtension({ launcherPath }: GlobalBakeExtensionOptions): string {
  const launcherLiteral = JSON.stringify(launcherPath);

  return `type CommandContext = {
  cwd: string;
  hasUI: boolean;
  ui: {
    notify(message: string): void;
  };
};

type ExtensionAPI = {
  exec(command: string, args: string[]): Promise<unknown>;
  registerCommand(
    name: string,
    options: {
      description?: string;
      handler: (args: string, ctx: CommandContext) => Promise<void> | void;
    },
  ): void;
};

const PI_HARNESS_LAUNCHER = ${launcherLiteral};
const DEFAULT_BAKE_ARGS = ['--init-json'];

function parseCommandArgs(input: string): string[] {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const args: string[] = [];
  let current = '';
  let quote: 'single' | 'double' | null = null;
  let escaped = false;

  for (const char of trimmed) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\\\') {
      escaped = true;
      continue;
    }

    if (quote) {
      if ((quote === 'single' && char === "'") || (quote === 'double' && char === '"')) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'") {
      quote = 'single';
      continue;
    }

    if (char === '"') {
      quote = 'double';
      continue;
    }

    if (/\\s/.test(char)) {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (escaped) {
    current += '\\\\';
  }

  if (quote) {
    throw new Error('Unclosed quote in /bake arguments.');
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

export default function registerPiHarnessBake(pi: ExtensionAPI): void {
  pi.registerCommand('bake', {
    description: 'Run pi-harness for the current directory. Defaults to pi-harness --init-json.',
    handler: async (args: string, ctx: CommandContext) => {
      const parsedArgs = parseCommandArgs(args);
      const commandArgs = parsedArgs.length > 0 ? parsedArgs : DEFAULT_BAKE_ARGS;

      await pi.exec(PI_HARNESS_LAUNCHER, commandArgs);

      if (ctx.hasUI) {
        ctx.ui.notify('pi-harness /bake finished.');
      }
    },
  });
}
`;
}
