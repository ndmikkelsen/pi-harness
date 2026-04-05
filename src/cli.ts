#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';

import { DEFAULT_POLICY, type ProjectMode } from './core/policy.js';
import type { AssistantSelection, AssistantTarget } from './core/types.js';
import { formatDoctorReport, runDoctor } from './commands/doctor.js';
import { formatInitReport, runInit } from './commands/init.js';

function parseMode(value: string): ProjectMode {
  if (value === 'auto' || value === 'new' || value === 'existing') {
    return value;
  }

  throw new InvalidArgumentError('Mode must be one of: auto, new, existing.');
}

function parseAssistant(value: string): AssistantTarget {
  if (value === 'auto' || value === 'codex') {
    return 'codex';
  }

  throw new InvalidArgumentError('Assistant must be one of: auto, codex. The OpenCode target has been retired from this baseline.');
}

function parseDoctorAssistant(value: string): AssistantSelection {
  if (value === 'auto' || value === 'codex') {
    return value;
  }

  throw new InvalidArgumentError('Assistant must be one of: auto, codex. The OpenCode target has been retired from this baseline.');
}

const program = new Command();

program
  .name('pi-harness')
  .description('AI workflow scaffolder for local setup of new and existing projects.')
  .argument('[project]', 'project name or target path')
  .argument('[target]', 'target directory')
  .option('--assistant <assistant>', 'assistant target: codex', parseAssistant, 'codex')
  .option('--mode <mode>', 'scaffold mode: auto, new, existing', parseMode, 'auto')
  .option('--init-json', 'emit machine-readable JSON output for scaffold runs', false)
  .option('--dry-run', 'show planned changes without writing files', false)
  .option('--force', 'overwrite managed files', false)
  .option('--merge-root-files', 'in existing-project mode, merge scaffold entries into .gitignore and .env.example', false)
  .option('--cleanup-manifest <id>', 'in existing-project mode, apply a curated cleanup manifest before scaffolding')
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
      assistant: options.assistant as AssistantTarget,
      mode: options.mode,
      dryRun: options.dryRun,
      force: options.force,
      mergeRootFiles: options.mergeRootFiles,
      cleanupManifestId: options.cleanupManifest,
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
  .description('Audit whether a repository matches the Codex + Beads + Cognee scaffold baseline.')
  .argument('[target]', 'target directory', '.')
  .option('--assistant <assistant>', 'assistant target: auto or codex', parseDoctorAssistant, 'auto')
  .option('--json', 'emit machine-readable JSON output', false)
  .action(async (targetArg: string, options) => {
    const result = await runDoctor({
      cwd: process.cwd(),
      targetArg,
      assistant: options.assistant,
      json: options.json,
    });

    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (result.status === 'fail') {
        process.exitCode = 1;
      }
      return;
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
