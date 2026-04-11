import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

async function scaffoldProject(workspace: string, projectArg: string): Promise<string> {
  await runInit({
    cwd: workspace,
    projectArg,
    mode: 'auto',
    dryRun: false,
    force: false,
    skipGit: true,
    detectPorts: false
  });

  return path.join(workspace, projectArg);
}

describe('CLI doctor', () => {
  it('runs doctor without assistant flags on a fresh pi-native scaffold', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-cli-pi-native');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', '--json', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    const payload = JSON.parse(result.stdout) as {
      status: string;
      groups: Array<{ name: string; status: string }>;
    };

    expect(payload).not.toHaveProperty('assistant');
    expect(payload.status).toBe('pass');
    expect(payload.groups).toEqual([
      { name: 'runtime-baseline', status: 'pass' },
      { name: 'workflow-alignment', status: 'pass' },
      { name: 'root-scaffold-hints', status: 'pass' },
      { name: 'deprecated-artifacts', status: 'pass' },
      { name: 'executables', status: 'pass' }
    ]);
  });

  it('supports the documented existing-repo adoption path followed by doctor', { timeout: 15000 }, async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));
    const targetDir = path.join(workspace, 'existing-cli-adoption');

    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, 'README.md'), '# Existing repo\n', 'utf8');

    const initResult = await execFile(
      process.execPath,
      [tsxCli, path.join(repoRoot, 'src', 'cli.ts'), '--mode', 'existing', '--init-json', '.'],
      {
        cwd: targetDir,
        encoding: 'utf8'
      }
    );

    const initPayload = JSON.parse(initResult.stdout) as { createdPaths: string[]; skippedPaths: string[] };
    expect(initPayload.createdPaths).toEqual(
      expect.arrayContaining([
        'AGENTS.md',
        '.pi/mcp.json',
        '.pi/extensions/repo-workflows.ts',
        '.pi/prompts/bake.md',
        '.pi/prompts/serve.md',
        '.pi/skills/bake/SKILL.md',
        'scripts/bootstrap-worktree.sh',
        'docker/Dockerfile.cognee'
      ])
    );
    expect(initPayload.skippedPaths).toContain('README.md');

    const doctorResult = await execFile(
      process.execPath,
      [tsxCli, path.join(repoRoot, 'src', 'cli.ts'), 'doctor', '--json', '.'],
      {
        cwd: targetDir,
        encoding: 'utf8'
      }
    );

    const doctorPayload = JSON.parse(doctorResult.stdout) as {
      status: string;
      groups: Array<{ name: string; status: string }>;
    };

    expect(doctorPayload).not.toHaveProperty('assistant');
    expect(doctorPayload.status).toBe('pass');
    expect(doctorPayload.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'runtime-baseline', status: 'pass' }),
        expect.objectContaining({ name: 'workflow-alignment', status: 'pass' })
      ])
    );
  });


  it('fails workflow-alignment when the managed bake prompt is missing', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-cli-missing-bake-prompt');

    await rm(path.join(targetDir, '.pi', 'prompts', 'bake.md'));

    const doctorResult = await execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', '--json', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    }).catch((error: { stdout?: string }) => error);

    const doctorPayload = JSON.parse(doctorResult.stdout ?? '{}') as {
      status: string;
      missing: string[];
      invalid: Array<{ path: string; reason: string }>;
      groups: Array<{ name: string; status: string }>;
    };

    expect(doctorPayload.status).toBe('fail');
    expect(doctorPayload.missing).toContain('.pi/prompts/bake.md');
    expect(doctorPayload.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '.pi/prompts/bake.md',
          reason: 'missing required workflow artifact'
        })
      ])
    );
    expect(doctorPayload.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'workflow-alignment', status: 'fail' })])
    );
  });

  it('prints pi-native guidance in the human-readable doctor report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-cli-guidance');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(result.stdout).toContain('Scaffold doctor: pi-native');
    expect(result.stdout).toContain('Status: pass');
    expect(result.stdout).toContain('Checks:');
    expect(result.stdout).toContain('- runtime-baseline: pass');
    expect(result.stdout).toContain('Guidance:');
    expect(result.stdout).toContain('`pi-harness` is a local-use tool for scaffolding projects on your machine; the documented setup path is a checkout plus `pnpm build` and `pnpm install:local`, not a registry-published package.');
  });

  it('prints actionable remediation guidance for preserved root-file warnings', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-doctor-'));
    const targetDir = await scaffoldProject(workspace, 'doctor-cli-remediation');

    await writeFile(path.join(targetDir, '.gitignore'), 'dist/\n', 'utf8');
    await writeFile(path.join(targetDir, '.env.example'), 'EXISTING_ONLY=true\n', 'utf8');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', 'doctor', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(result.stdout).toContain('Scaffold doctor: pi-native');
    expect(result.stdout).toContain('Status: warn');
    expect(result.stdout).toContain('Recommendations:');
    expect(result.stdout).toContain('--merge-root-files --init-json');
  });
});
