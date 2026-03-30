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

    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', 'install-skill', '--assistant', 'opencode', '--target-root', targetRoot, '--json'],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as {
      assistant: string;
      installDir: string;
      writtenPaths: string[];
    };

    expect(payload.assistant).toBe('opencode');
    expect(payload.installDir).toBe(path.join(targetRoot, 'ai-harness'));
    expect(payload.writtenPaths).toContain('skills/harness/SKILL.md');
  });

  it('prints local launcher guidance in the human-readable report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cli-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');

    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', 'install-skill', '--assistant', 'opencode', '--target-root', targetRoot],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    expect(result.stdout).toContain('Installed harness (opencode)');
    expect(result.stdout).toContain('The installed skill expects `ai-harness` to be available locally on your machine, typically via a checkout plus `pnpm install:local`.');
  });
});
