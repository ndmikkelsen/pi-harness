import os from 'node:os';
import path from 'node:path';

export const LOCAL_LAUNCHER_NAMES = ['pi-harness'] as const;
export const GLOBAL_BAKE_EXTENSION_NAME = 'pi-harness-bake';
export const GEMMA4_COMPUTE_OLLAMA_PROVIDER_ID = 'compute-ollama';
export const DEFAULT_GEMMA4_COMPUTE_OLLAMA_MODEL_ID = 'gemma4';
export const DEFAULT_GEMMA4_COMPUTE_OLLAMA_BASE_URL = 'http://chat.compute.lan:11434/v1';

export interface PiModelConfig extends Record<string, unknown> {
  id: string;
}

export interface PiProviderConfig extends Record<string, unknown> {
  models?: PiModelConfig[];
}

export interface PiModelsConfig extends Record<string, unknown> {
  providers?: Record<string, PiProviderConfig>;
}

export interface Gemma4ComputeOllamaOptions {
  baseUrl?: string;
  modelId?: string;
}

const GEMMA4_COMPUTE_OLLAMA_PROVIDER_CONFIG = {
  api: 'openai-completions',
  apiKey: 'ollama',
  compat: {
    supportsDeveloperRole: false,
    supportsReasoningEffort: false,
  },
} as const;

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

export function defaultPiModelsPath(piAgentDir = defaultPiAgentDir()): string {
  return path.join(piAgentDir, 'models.json');
}

function upsertProviderModel(models: PiModelConfig[], model: PiModelConfig): PiModelConfig[] {
  const index = models.findIndex((existingModel) => existingModel.id === model.id);

  if (index === -1) {
    return [...models, model];
  }

  return models.map((existingModel, existingIndex) => {
    if (existingIndex !== index) {
      return existingModel;
    }

    return {
      ...existingModel,
      ...model,
    };
  });
}

function buildGemma4ComputeOllamaModelConfig(options: Gemma4ComputeOllamaOptions = {}): PiModelConfig {
  const configuredModelId = options.modelId?.trim();
  const modelId = configuredModelId && configuredModelId.length > 0
    ? configuredModelId
    : DEFAULT_GEMMA4_COMPUTE_OLLAMA_MODEL_ID;

  return {
    id: modelId,
    name: 'Gemma 4 (compute Ollama)',
    input: ['text'],
    reasoning: false,
  };
}

export function upsertGemma4ComputeOllamaModelsConfig(
  existing: PiModelsConfig = {},
  options: Gemma4ComputeOllamaOptions = {},
): PiModelsConfig {
  const providers = existing.providers ?? {};
  const existingProvider = providers[GEMMA4_COMPUTE_OLLAMA_PROVIDER_ID] ?? {};
  const existingModels = Array.isArray(existingProvider.models) ? existingProvider.models : [];
  const configuredBaseUrl = options.baseUrl?.trim();
  const baseUrl = configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : DEFAULT_GEMMA4_COMPUTE_OLLAMA_BASE_URL;

  return {
    ...existing,
    providers: {
      ...providers,
      [GEMMA4_COMPUTE_OLLAMA_PROVIDER_ID]: {
        ...existingProvider,
        ...GEMMA4_COMPUTE_OLLAMA_PROVIDER_CONFIG,
        baseUrl,
        models: upsertProviderModel(existingModels, buildGemma4ComputeOllamaModelConfig(options)),
      },
    },
  };
}

export function renderPiModelsJson(config: PiModelsConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
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
  printf '%s: %s\\n' "$(basename "$0")" "$*" >&2
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

  return `import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type CommandContext = {
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
const LEGACY_CLEANUP_MANIFEST = 'legacy-ai-frameworks-v1';
const EXPLICIT_CONTROL_FLAGS = new Set([
  '--mode',
  '--force',
  '--cleanup-manifest',
  '--cleanup-confirm-all',
  '--merge-root-files',
  '--non-interactive',
  '--dry-run',
]);
const VALUE_FLAGS = new Set([
  '--mode',
  '--cleanup-manifest',
  '--dolt-port',
  '--cognee-db-port',
  '--compute-host',
  '--compute-user',
  '--ssh-key-path',
]);

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

function expandHome(value: string): string {
  return value.startsWith('~/') ? path.join(os.homedir(), value.slice(2)) : value;
}

function looksLikePath(value: string): boolean {
  return value === '.' || value === '..' || value.startsWith('~/') || value.startsWith('/') || value.includes(path.sep);
}

function resolveTargetDir(targetInput: string, cwd: string): string {
  if (looksLikePath(targetInput)) {
    return path.resolve(cwd, expandHome(targetInput));
  }

  return path.resolve(cwd, targetInput);
}

function directoryHasFiles(targetDir: string): boolean {
  return existsSync(targetDir) && readdirSync(targetDir).length > 0;
}

function ensureInitJson(args: string[]): string[] {
  return args.includes('--init-json') ? args : [...args, '--init-json'];
}

function hasExplicitControlFlags(args: string[]): boolean {
  return args.some((arg) => EXPLICIT_CONTROL_FLAGS.has(arg));
}

function positionalArgs(args: string[]): string[] {
  const positionals: string[] = [];
  let skipNext = false;

  for (const arg of args) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (VALUE_FLAGS.has(arg)) {
      skipNext = true;
      continue;
    }

    if (arg.startsWith('-')) {
      continue;
    }

    positionals.push(arg);
  }

  return positionals;
}

function buildAutomaticBakeArgs(args: string[], cwd: string): string[] {
  if (args.includes('--help') || args.includes('-h')) {
    return args;
  }

  if (hasExplicitControlFlags(args)) {
    return ensureInitJson(args);
  }

  const positionals = positionalArgs(args);
  if (positionals.length > 1) {
    return ensureInitJson(args);
  }

  const targetInput = positionals[0] ?? '.';
  const targetDir = resolveTargetDir(targetInput, cwd);

  if (directoryHasFiles(targetDir)) {
    return ensureInitJson([
      '--mode',
      'existing',
      '--force',
      '--cleanup-manifest',
      LEGACY_CLEANUP_MANIFEST,
      '--cleanup-confirm-all',
      '--merge-root-files',
      ...args,
    ]);
  }

  return ensureInitJson(args);
}

export default function registerPiHarnessBake(pi: ExtensionAPI): void {
  pi.registerCommand('bake', {
    description:
      'Auto-detect new vs existing repositories and run pi-harness with Pi-native bake defaults.',
    handler: async (args: string, ctx: CommandContext) => {
      const parsedArgs = parseCommandArgs(args);
      const commandArgs = buildAutomaticBakeArgs(parsedArgs, ctx.cwd);

      await pi.exec(PI_HARNESS_LAUNCHER, commandArgs);

      if (ctx.hasUI) {
        ctx.ui.notify('pi-harness /bake finished.');
      }
    },
  });
}
`;
}
