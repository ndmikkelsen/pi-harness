import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('CLI doctor', () => {
  it('accepts auto assistant on the doctor subcommand for Codex-compatible scaffolds', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-cli-doctor-'));

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
      'pnpm',
      ['exec', 'tsx', 'src/cli.ts', 'doctor', '--assistant', 'auto', '--json', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as { assistant: string; status: string };

    expect(payload.assistant).toBe('codex');
    expect(payload.status).toBe('pass');
  });
});
