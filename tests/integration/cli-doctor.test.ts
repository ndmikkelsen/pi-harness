import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
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
  it('rejects auto assistant on the doctor subcommand', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));

    await runInit({
      cwd: workspace,
      projectArg: 'doctor-cli-codex',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const targetDir = path.join(workspace, 'doctor-cli-codex');

    await expect(
      execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', '--assistant', 'auto', '--json', targetDir], {
        cwd: repoRoot,
        encoding: 'utf8'
      }),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining('Assistant must be one of: codex.')
    });
  });

  it('supports the documented existing-repo adoption path followed by doctor', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));
    const targetDir = path.join(workspace, 'existing-cli-adoption');

    await mkdir(targetDir, { recursive: true });


    await writeFile(path.join(targetDir, 'README.md'), '# Existing repo\n', 'utf8');

    const initResult = await execFile(
      process.execPath,
      [
        tsxCli,
        path.join(repoRoot, 'src', 'cli.ts'),
        '--mode',
        'existing',
        '--assistant',
        'codex',
        '--init-json',
        '.',
      ],
      {
        cwd: targetDir,
        encoding: 'utf8'
      },
    );

    const initPayload = JSON.parse(initResult.stdout) as { createdPaths: string[]; skippedPaths: string[] };
    expect(initPayload.createdPaths).toContain('.codex/README.md');
    expect(initPayload.skippedPaths).toContain('README.md');

    const doctorResult = await execFile(
      process.execPath,
      [tsxCli, path.join(repoRoot, 'src', 'cli.ts'), 'doctor', '--assistant', 'codex', '--json', '.'],
      {
        cwd: targetDir,
        encoding: 'utf8'
      },
    );

    const doctorPayload = JSON.parse(doctorResult.stdout) as {
      status: string;
      groups: Array<{ name: string; status: string }>;
    };

    expect(doctorPayload.status).toBe('pass');
    expect(doctorPayload.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'workflow-alignment', status: 'pass' })]),
    );
  });


  it('prints local-use guidance in the human-readable doctor report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));

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
    expect(result.stdout).toContain('`pi-harness` is a local-use tool for scaffolding projects on your machine; the documented setup path is a checkout plus `pnpm build` and `pnpm install:local`, not a registry-published package.');
  });

  it('prints actionable remediation guidance for preserved root-file warnings', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));

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
