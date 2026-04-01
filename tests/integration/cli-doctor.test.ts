import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

describe('CLI doctor', () => {
  it('accepts auto assistant on the doctor subcommand for Codex-compatible scaffolds', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-cli-opencode',
      assistant: 'opencode',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-cli-opencode');
    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', 'doctor', '--assistant', 'auto', '--json', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as { assistant: string; status: string };

    expect(payload.assistant).toBe('opencode');
    expect(payload.status).toBe('pass');
  });

  it('prints local-use guidance in the human-readable doctor report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-cli-guidance',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-cli-guidance');
    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(result.stdout).toContain('Status: pass');
    expect(result.stdout).toContain('Guidance:');
    expect(result.stdout).toContain('`ai-harness` is a local-use tool for scaffolding projects on your machine; the documented setup path is a checkout plus `pnpm build` and `pnpm install:local`, not a registry-published package.');
  });

  it('prints actionable remediation guidance for preserved root-file warnings', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-cli-remediation',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-cli-remediation');
    await writeFile(path.join(targetDir, '.gitignore'), 'dist/\n', 'utf8');
    await writeFile(path.join(targetDir, '.env.example'), 'EXISTING_ONLY=true\n', 'utf8');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(result.stdout).toContain('Status: warn');
    expect(result.stdout).toContain('Recommendations:');
    expect(result.stdout).toContain('--merge-root-files --init-json');
  });
});
