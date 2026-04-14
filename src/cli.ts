#!/usr/bin/env node

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { Command, InvalidArgumentError } from 'commander';

import { DEFAULT_POLICY, type ProjectMode } from './core/policy.js';
import { formatDoctorReport, runDoctor } from './commands/doctor.js';
import { formatInitReport, runInit } from './commands/init.js';

const LEGACY_CLEANUP_MANIFEST = 'legacy-ai-frameworks-v1';

function parseMode(value: string): ProjectMode {
  if (value === 'auto' || value === 'new' || value === 'existing') {
    return value;
  }

  throw new InvalidArgumentError('Mode must be one of: auto, new, existing.');
}

function directoryHasFiles(targetDir: string): boolean {
  return existsSync(targetDir) && readdirSync(targetDir).length > 0;
}

async function autoFixDoctorTarget(cwd: string, targetArg: string): Promise<boolean> {
  const targetDir = path.resolve(cwd, targetArg);
  const targetHasFiles = directoryHasFiles(targetDir);

  const result = await runInit({
    cwd,
    targetArg,
    mode: targetHasFiles ? 'existing' : 'auto',
    dryRun: false,
    force: targetHasFiles,
    mergeRootFiles: false,
    cleanupManifestId: targetHasFiles ? LEGACY_CLEANUP_MANIFEST : undefined,
    cleanupConfirmAll: targetHasFiles,
    nonInteractive: targetHasFiles,
    skipGit: false,
    detectPorts: false,
  });

  return result.cleanup.status !== 'blocked';
}

const program = new Command();

program
  .name('pi-harness')
  .description('Pi-native workflow scaffolder for local setup of new and existing projects.')
  .argument('[project]', 'project name or target path')
  .argument('[target]', 'target directory')
  .option('--mode <mode>', 'scaffold mode: auto, new, existing', parseMode, 'auto')
  .option('--init-json', 'emit machine-readable JSON output for scaffold runs', false)
  .option('--dry-run', 'show planned changes without writing files', false)
  .option('--force', 'overwrite managed files', false)
  .option('--merge-root-files', 'in existing-project mode, merge scaffold entries into .gitignore, .env.example, and .envrc', false)
  .option('--cleanup-manifest <id>', 'in existing-project mode, apply a curated cleanup manifest before scaffolding')
  .option('--cleanup-confirm-all', 'auto-confirm prompt-before-delete entries from the selected cleanup manifest', false)
  .option('--non-interactive', 'disable prompts and report prompt-required cleanup actions instead', false)
  .option('--skip-git', 'skip git initialization', false)
  .option('--detect-ports', 'probe the compute host for available service ports', false)
  .option('--dolt-port <port>', 'explicit Dolt port', (value) => Number.parseInt(value, 10))
  .option('--cognee-db-port <port>', 'explicit Cognee database port', (value) => Number.parseInt(value, 10))
  .option('--compute-host <host>', 'compute host for generated configs', DEFAULT_POLICY.computeHost)
  .option('--compute-user <user>', 'SSH user for generated configs', DEFAULT_POLICY.computeUser)
  .option('--ssh-key-path <path>', 'SSH private key path for generated configs', DEFAULT_POLICY.sshKeyPath)
  .action(async (projectArg: string | undefined, targetArg: string | undefined, options) => {
    const result = await runInit({
      cwd: process.cwd(),
      projectArg,
      targetArg,
      mode: options.mode,
      dryRun: options.dryRun,
      force: options.force,
      mergeRootFiles: options.mergeRootFiles,
      cleanupManifestId: options.cleanupManifest,
      cleanupConfirmAll: options.cleanupConfirmAll,
      nonInteractive: options.nonInteractive,
      skipGit: options.skipGit,
      detectPorts: options.detectPorts,
      doltPort: options.doltPort,
      cogneeDbPort: options.cogneeDbPort,
      computeHost: options.computeHost,
      computeUser: options.computeUser,
      sshKeyPath: options.sshKeyPath,
    });

    if (options.initJson) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (result.cleanup.status === 'blocked') {
        process.exitCode = 1;
      }
      return;
    }

    process.stdout.write(formatInitReport(result));
    if (result.cleanup.status === 'blocked') {
      process.exitCode = 1;
    }
  });

program
  .command('doctor')
  .description('Audit whether a repository matches the pi-native scaffold baseline.')
  .argument('[target]', 'target directory', '.')
  .option('--json', 'emit machine-readable JSON output', false)
  .option('--fix', 'refresh the target with /bake-equivalent defaults before re-running doctor when audit failures are found', false)
  .action(async (targetArg: string, options) => {
    let result = await runDoctor({
      cwd: process.cwd(),
      targetArg,
      json: options.json,
    });

    let fixAttempted = false;
    let fixApplied = false;
    if (options.fix && result.status === 'fail') {
      fixAttempted = true;
      const fixed = await autoFixDoctorTarget(process.cwd(), targetArg);
      if (fixed) {
        result = await runDoctor({
          cwd: process.cwd(),
          targetArg,
          json: options.json,
        });
        fixApplied = true;
      }
    }

    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (result.status === 'fail') {
        process.exitCode = 1;
      }
      return;
    }

    if (fixApplied) {
      process.stdout.write('Applied an automatic scaffold refresh with /bake-equivalent defaults before re-running doctor.\n\n');
    } else if (fixAttempted) {
      process.stdout.write('Attempted an automatic scaffold refresh with /bake-equivalent defaults, but blocking issues remain.\n\n');
    }
    process.stdout.write(formatDoctorReport(result));
    if (result.status === 'fail') {
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
