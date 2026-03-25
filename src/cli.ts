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

function parseAssistant(value: string): AssistantSelection {
  if (value === 'auto' || value === 'claude' || value === 'codex' || value === 'opencode') {
    return value;
  }

  throw new InvalidArgumentError('Assistant must be one of: auto, claude, codex, opencode.');
}

function parseDoctorAssistant(value: string): AssistantSelection {
  if (value === 'auto' || value === 'claude' || value === 'codex' || value === 'opencode') {
    return value;
  }

  throw new InvalidArgumentError('Assistant must be one of: auto, claude, codex, opencode.');
}

const program = new Command();

program
  .name('scaff')
  .description('Modular AI workflow scaffolder for new and existing projects.')
  .argument('[project]', 'project name or target path')
  .argument('[target]', 'target directory')
  .option('--assistant <assistant>', 'assistant target: claude, codex, or opencode', parseAssistant, 'codex')
  .option('--prefix <prefix>', 'Beads issue prefix')
  .option('--mode <mode>', 'scaffold mode: auto, new, existing', parseMode, 'auto')
  .option('--dry-run', 'show planned changes without writing files', false)
  .option('--force', 'overwrite managed files', false)
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
      assistant: options.assistant === 'auto' ? 'codex' : (options.assistant as AssistantTarget),
      prefix: options.prefix,
      mode: options.mode,
      dryRun: options.dryRun,
      force: options.force,
      skipGit: options.skipGit,
      detectPorts: options.detectPorts,
      doltPort: options.doltPort,
      cogneeDbPort: options.cogneeDbPort,
      computeHost: options.computeHost,
      computeUser: options.computeUser,
      sshKeyPath: options.sshKeyPath
    });

    process.stdout.write(formatInitReport(result));
  });

program
  .command('doctor')
  .description('Audit whether a repository is scaffolded correctly for Claude or Codex.')
  .argument('[target]', 'target directory', '.')
  .option('--assistant <assistant>', 'assistant target: auto, claude, codex, or opencode', parseDoctorAssistant, 'auto')
  .option('--json', 'emit machine-readable JSON output', false)
  .action(async (targetArg: string, options) => {
    const result = await runDoctor({
      cwd: process.cwd(),
      targetArg,
      assistant: options.assistant,
      json: options.json
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
