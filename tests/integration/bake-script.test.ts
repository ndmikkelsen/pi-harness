import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function createFakeHarness(binDir: string, logPath: string): Promise<void> {
  const harnessPath = path.join(binDir, 'pi-harness');
  await mkdir(binDir, { recursive: true });
  await writeFile(
    harnessPath,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$@" > ${JSON.stringify(logPath)}
`,
    'utf8',
  );
  await chmod(harnessPath, 0o755);
}

describe('scripts/bake.sh', () => {
  it('treats an empty current directory as a greenfield bake', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-bake-script-'));
    const binDir = path.join(workspace, 'bin');
    const logPath = path.join(workspace, 'args.log');
    const targetDir = path.join(workspace, 'empty-target');

    await mkdir(targetDir, { recursive: true });
    await createFakeHarness(binDir, logPath);

    await execFile(path.join(repoRoot, 'scripts', 'bake.sh'), [], {
      cwd: targetDir,
      env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ''}` },
    });

    expect((await readFile(logPath, 'utf8')).trim().split('\n')).toEqual(['--init-json']);
  });

  it('refreshes an existing current directory with force and curated cleanup', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-bake-script-'));
    const binDir = path.join(workspace, 'bin');
    const logPath = path.join(workspace, 'args.log');
    const targetDir = path.join(workspace, 'existing-target');

    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, 'README.md'), '# existing\n', 'utf8');
    await createFakeHarness(binDir, logPath);

    await execFile(path.join(repoRoot, 'scripts', 'bake.sh'), [], {
      cwd: targetDir,
      env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ''}` },
    });

    expect((await readFile(logPath, 'utf8')).trim().split('\n')).toEqual([
      '--mode',
      'existing',
      '--force',
      '--cleanup-manifest',
      'legacy-ai-frameworks-v1',
      '--cleanup-confirm-all',
      '--init-json',
    ]);
  });

  it('applies the same existing-repo defaults for an explicit target path', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-bake-script-'));
    const binDir = path.join(workspace, 'bin');
    const logPath = path.join(workspace, 'args.log');
    const runnerDir = path.join(workspace, 'runner');
    const targetDir = path.join(workspace, 'existing-target');

    await mkdir(runnerDir, { recursive: true });
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, 'README.md'), '# existing\n', 'utf8');
    await createFakeHarness(binDir, logPath);

    await execFile(path.join(repoRoot, 'scripts', 'bake.sh'), [targetDir], {
      cwd: runnerDir,
      env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ''}` },
    });

    expect((await readFile(logPath, 'utf8')).trim().split('\n')).toEqual([
      '--mode',
      'existing',
      '--force',
      '--cleanup-manifest',
      'legacy-ai-frameworks-v1',
      '--cleanup-confirm-all',
      targetDir,
      '--init-json',
    ]);
  });
});
