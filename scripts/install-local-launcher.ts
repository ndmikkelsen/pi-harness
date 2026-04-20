#!/usr/bin/env node

import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  type PiModelsConfig,
  GLOBAL_BAKE_EXTENSION_NAME,
  LOCAL_LAUNCHER_NAMES,
  defaultBinDir,
  defaultGlobalBakeExtensionDir,
  defaultPiAgentDir,
  defaultPiModelsPath,
  renderGlobalBakeExtension,
  renderLauncherScript,
  renderPiModelsJson,
  upsertGemma4ComputeOllamaModelsConfig,
} from '../src/local-launcher.js';

interface InstallOptions {
  binDir: string;
  gemma4BaseUrl?: string;
  gemma4ComputeOllama: boolean;
  gemma4ModelId?: string;
  piAgentDir: string;
  repo: string;
}

function parseArgs(argv: string[]): InstallOptions {
  let binDir = defaultBinDir();
  let gemma4BaseUrl: string | undefined;
  let gemma4ComputeOllama = false;
  let gemma4ModelId: string | undefined;
  let piAgentDir = defaultPiAgentDir();
  let repo = path.resolve(path.join(import.meta.dirname, '..'));

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--bin-dir') {
      index += 1;
      binDir = path.resolve(argv[index] ?? '');
      continue;
    }
    if (arg === '--pi-agent-dir') {
      index += 1;
      piAgentDir = path.resolve(argv[index] ?? '');
      continue;
    }
    if (arg === '--repo') {
      index += 1;
      repo = path.resolve(argv[index] ?? '');
      continue;
    }
    if (arg === '--gemma4-compute-ollama') {
      gemma4ComputeOllama = true;
      continue;
    }
    if (arg === '--gemma4-base-url') {
      index += 1;
      gemma4BaseUrl = argv[index] ?? '';
      gemma4ComputeOllama = true;
      continue;
    }
    if (arg === '--gemma4-model-id') {
      index += 1;
      gemma4ModelId = argv[index] ?? '';
      gemma4ComputeOllama = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'Usage: tsx scripts/install-local-launcher.ts [--bin-dir DIR] [--pi-agent-dir DIR] [--repo PATH] [--gemma4-compute-ollama] [--gemma4-base-url URL] [--gemma4-model-id ID]\n',
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { binDir, gemma4BaseUrl, gemma4ComputeOllama, gemma4ModelId, piAgentDir, repo };
}

function parsePiModelsConfig(raw: string, modelsPath: string): PiModelsConfig {
  const parsed = JSON.parse(raw) as unknown;

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Expected ${modelsPath} to contain a JSON object.`);
  }

  return parsed as PiModelsConfig;
}

async function readPiModelsConfig(modelsPath: string): Promise<PiModelsConfig> {
  try {
    const raw = await readFile(modelsPath, 'utf8');
    return parsePiModelsConfig(raw, modelsPath);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string' &&
      error.code === 'ENOENT'
    ) {
      return {};
    }

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${modelsPath}: ${error.message}`);
    }

    throw error;
  }
}

async function installLaunchers(options: InstallOptions): Promise<void> {
  const content = renderLauncherScript(options.repo);

  await mkdir(options.binDir, { recursive: true });

  for (const name of LOCAL_LAUNCHER_NAMES) {
    const targetPath = path.join(options.binDir, name);
    await writeFile(targetPath, content, 'utf8');
    await chmod(targetPath, 0o755);
    process.stdout.write(`Installed ${name} -> ${targetPath}\n`);
  }
}

async function installGlobalBakeExtension(options: InstallOptions): Promise<void> {
  const extensionDir = defaultGlobalBakeExtensionDir(options.piAgentDir);
  const extensionPath = path.join(extensionDir, 'index.ts');
  const launcherPath = path.join(options.binDir, LOCAL_LAUNCHER_NAMES[0]);

  await mkdir(extensionDir, { recursive: true });
  await writeFile(
    extensionPath,
    renderGlobalBakeExtension({
      launcherPath,
    }),
    'utf8',
  );

  process.stdout.write(`Installed global Pi /bake extension (${GLOBAL_BAKE_EXTENSION_NAME}) -> ${extensionPath}\n`);
}

async function installGemma4ComputeOllamaRuntimeConfig(options: InstallOptions): Promise<void> {
  if (!options.gemma4ComputeOllama) {
    return;
  }

  const modelsPath = defaultPiModelsPath(options.piAgentDir);
  const existingConfig = await readPiModelsConfig(modelsPath);
  const mergedConfig = upsertGemma4ComputeOllamaModelsConfig(existingConfig, {
    baseUrl: options.gemma4BaseUrl,
    modelId: options.gemma4ModelId,
  });

  await mkdir(path.dirname(modelsPath), { recursive: true });
  await writeFile(modelsPath, renderPiModelsJson(mergedConfig), 'utf8');

  process.stdout.write(`Installed global Pi models config -> ${modelsPath}\n`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  await installLaunchers(options);
  await installGlobalBakeExtension(options);
  await installGemma4ComputeOllamaRuntimeConfig(options);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`install-local-launcher: ${message}\n`);
  process.exit(1);
});
