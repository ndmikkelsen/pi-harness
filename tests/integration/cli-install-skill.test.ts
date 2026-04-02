import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

describe('CLI install-skill', () => {
  it('installs the OpenCode skill bundle from the CLI', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');

    const result = await execFile(
      process.execPath,
      [
        tsxCli,
        'src/cli.ts',
        'install-skill',
        '--assistant',
        'opencode',
        '--target-root',
        targetRoot,
        '--config-root',
        configRoot,
        '--gsd-root',
        gsdRoot,
        '--json'
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as {
      assistant: string;
      installDir: string;
      writtenPaths: string[];
      workflowFilePath: string;
      writtenWorkflowPaths: string[];
      writtenConfigPaths: string[];
      gsdDefaultsFilePath: string;
      writtenDefaultsPaths: string[];
    };

    expect(payload.assistant).toBe('opencode');
    expect(payload.installDir).toBe(path.join(targetRoot, 'ai-harness'));
    expect(payload.writtenPaths).toContain('skills/harness/SKILL.md');
    expect(payload.writtenConfigPaths).toContain('oh-my-opencode.json');
    expect(payload.workflowFilePath).toBe(path.join(configRoot, 'get-shit-done', 'workflows', 'autonomous.md'));
    expect(payload.writtenWorkflowPaths).toContain('get-shit-done/workflows/autonomous.md');
    expect(payload.gsdDefaultsFilePath).toBe(path.join(gsdRoot, 'defaults.json'));
    expect(payload.writtenDefaultsPaths).toContain('defaults.json');
  });

  it('prints the managed global file guidance in the human-readable report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');

    const result = await execFile(
      process.execPath,
      [
        tsxCli,
        'src/cli.ts',
        'install-skill',
        '--assistant',
        'opencode',
        '--target-root',
        targetRoot,
        '--config-root',
        configRoot,
        '--gsd-root',
        gsdRoot
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    expect(result.stdout).toContain('Installed harness (opencode)');
    expect(result.stdout).toContain('The installed skill expects `ai-harness` to be available locally on your machine, typically via a checkout plus `pnpm install:local`.');
    expect(result.stdout).toContain('The install also refreshes the managed /gsd-autonomous workflow');
    expect(result.stdout).toContain('OpenCode config files written: 1');
    expect(result.stdout).toContain('GSD defaults written: 1');
    expect(result.stdout).toContain('The install also refreshes the managed OpenCode defaults at');
    expect(result.stdout).toContain('The install also refreshes the managed GSD defaults at');
  });

  it('emits the managed defaults in a temp HOME install', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-install-skill-'));

    await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', 'install-skill', '--assistant', 'opencode'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          HOME: workspace
        }
      }
    );

    const { readFile } = await import('node:fs/promises');
    await expect(readFile(path.join(workspace, '.config', 'opencode', 'oh-my-opencode.json'), 'utf8')).resolves.toContain(
      '"model": "openai/gpt-5.4"'
    );
    await expect(readFile(path.join(workspace, '.config', 'opencode', 'get-shit-done', 'workflows', 'autonomous.md'), 'utf8')).resolves.toContain(
      'Drain ready Beads work and incomplete GSD phase work autonomously.'
    );
    await expect(readFile(path.join(workspace, '.gsd', 'defaults.json'), 'utf8')).resolves.toContain(
      '"gsd-project-researcher": "opencode/big-pickle"'
    );
  });
});
