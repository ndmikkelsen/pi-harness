import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';

import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

const execFile = promisify(execFileCallback);

describe('Beads wrapper', () => {
  it('acts as a thin wrapper around native bd defaults', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-bd-wrapper-'));

    await runInit({
      cwd: workspace,
      projectArg: 'sample-bd-wrapper',
      assistant: 'claude',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'sample-bd-wrapper');
    const wrapperPath = path.join(projectDir, '.claude', 'scripts', 'bd');
    const fakeBinDir = path.join(workspace, 'fake-bin');
    const fakeBdPath = path.join(fakeBinDir, 'bd');

    await mkdir(fakeBinDir, { recursive: true });
    await writeFile(
      fakeBdPath,
      `#!/usr/bin/env bash
echo "HOST=${'$'}{BEADS_DOLT_SERVER_HOST:-}"
echo "PORT=${'$'}{BEADS_DOLT_SERVER_PORT:-}"
echo "USER=${'$'}{BEADS_DOLT_SERVER_USER:-}"
echo "DB=${'$'}{BEADS_DOLT_SERVER_DATABASE:-}"
echo "LEGACY_PASS=${'$'}{BEADS_DOLT_SERVER_PASSWORD:-}"
echo "PASS=${'$'}{BEADS_DOLT_PASSWORD:-}"
echo "ARGS=$*"
`,
      'utf8'
    );
    await chmod(fakeBdPath, 0o755);

    const result = await execFile(wrapperPath, ['ready'], {
      cwd: projectDir,
      env: {
        ...process.env,
        PATH: `${fakeBinDir}${path.delimiter}${process.env.PATH ?? ''}`,
        BEADS_DOLT_PASSWORD: 'native_secret'
      },
      encoding: 'utf8'
    });

    const output = result.stdout;
    const lines = Object.fromEntries(
      output
        .trim()
        .split('\n')
        .map((line) => {
          const [key, ...rest] = line.split('=');
          return [key, rest.join('=')];
        })
    );

    expect(lines.HOST).toBe('');
    expect(lines.PORT).toBe('');
    expect(lines.USER).toBe('');
    expect(lines.DB).toBe('');
    expect(lines.LEGACY_PASS).toBe('');
    expect(lines.PASS).toBe('native_secret');
    expect(lines.ARGS).toBe('ready');
  });
});
