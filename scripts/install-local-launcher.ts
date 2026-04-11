#!/usr/bin/env node

import { chmod, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  GLOBAL_BAKE_EXTENSION_NAME,
  LOCAL_LAUNCHER_NAMES,
  defaultBinDir,
  defaultGlobalBakeExtensionDir,
  defaultPiAgentDir,
  renderGlobalBakeExtension,
  renderLauncherScript,
} from '../src/local-launcher.js';

interface InstallOptions {
  binDir: string;
  piAgentDir: string;
  repo: string;
}

function parseArgs(argv: string[]): InstallOptions {
  let binDir = defaultBinDir();
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
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'Usage: tsx scripts/install-local-launcher.ts [--bin-dir DIR] [--pi-agent-dir DIR] [--repo PATH]\n',
      );
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { binDir, piAgentDir, repo };
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

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  await installLaunchers(options);
  await installGlobalBakeExtension(options);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`install-local-launcher: ${message}\n`);
  process.exit(1);
});
