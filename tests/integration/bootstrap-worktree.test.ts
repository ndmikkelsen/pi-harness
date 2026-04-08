import { execFile as execFileCallback } from 'node:child_process';
import { chmod, lstat, mkdir, mkdtemp, readFile, readlink, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function initGitRepo(repoDir: string) {
  await execFile('git', ['init', '--initial-branch=dev'], { cwd: repoDir });
  await execFile('git', ['config', 'user.name', 'Pi Harness Tests'], { cwd: repoDir });
  await execFile('git', ['config', 'user.email', 'tests@example.com'], { cwd: repoDir });
  await execFile('git', ['config', 'core.hooksPath', '.beads/hooks'], { cwd: repoDir });
}

async function writeBdStub(binDir: string, hookExitCode = 0) {
  await writeFile(
    path.join(binDir, 'bd'),
    `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1 $2" == "hooks run" ]]; then
  exit ${hookExitCode}
fi
exit 0
`,
    'utf8'
  );
  await chmod(path.join(binDir, 'bd'), 0o755);
}

async function seedWorktreeFixture(repoDir: string, commitMessage: string) {
  const bootstrapScript = await readFile(path.join(repoRoot, 'scripts', 'bootstrap-worktree.sh'), 'utf8');
  const postCheckoutHook = await readFile(path.join(repoRoot, '.beads', 'hooks', 'post-checkout'), 'utf8');

  expect(bootstrapScript).not.toContain('/gsd-');
  expect(bootstrapScript).not.toContain('.planning/STATE.md');

  await mkdir(path.join(repoDir, 'scripts'), { recursive: true });
  await mkdir(path.join(repoDir, '.beads', 'hooks'), { recursive: true });
  await mkdir(path.join(repoDir, '.kamal'), { recursive: true });

  await writeFile(path.join(repoDir, 'scripts', 'bootstrap-worktree.sh'), bootstrapScript, 'utf8');
  await writeFile(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), postCheckoutHook, 'utf8');
  await writeFile(path.join(repoDir, '.envrc'), '# direnv fixture\n', 'utf8');
  await writeFile(path.join(repoDir, 'STICKYNOTE.example.md'), '# Sticky fixture\n', 'utf8');
  await writeFile(path.join(repoDir, '.kamal', 'secrets.example'), 'EXAMPLE=1\n', 'utf8');

  await chmod(path.join(repoDir, 'scripts', 'bootstrap-worktree.sh'), 0o755);
  await chmod(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), 0o755);

  await execFile('git', ['add', '.'], { cwd: repoDir });
  await execFile('git', ['commit', '-m', commitMessage], { cwd: repoDir });

  await writeFile(path.join(repoDir, '.env'), 'LLM_API_KEY=dev\n', 'utf8');
  await writeFile(path.join(repoDir, '.kamal', 'secrets'), 'KAMAL_REGISTRY_PASSWORD=dev\n', 'utf8');
}

async function addLinkedWorktree(repoDir: string, worktreeDir: string, branchName: string, binDir: string) {
  await execFile('git', ['worktree', 'add', worktreeDir, '-b', branchName], {
    cwd: repoDir,
    env: {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ''}`
    }
  });
}

describe('bootstrap-worktree hook', () => {
  it('links shared env files and a main-worktree-canonical STICKYNOTE.md into new worktrees', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-worktree-'));
    const repoDir = path.join(workspace, 'repo');
    const worktreeDir = path.join(workspace, 'repo.feature');
    const binDir = path.join(workspace, 'bin');

    await mkdir(repoDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await initGitRepo(repoDir);
    await seedWorktreeFixture(repoDir, 'chore: seed worktree fixture');
    await writeBdStub(binDir);

    try {
      await addLinkedWorktree(repoDir, worktreeDir, 'feat/test-worktree-sync', binDir);

      const envStat = await lstat(path.join(worktreeDir, '.env'));
      const kamalSecretsStat = await lstat(path.join(worktreeDir, '.kamal', 'secrets'));
      const stickyNoteStat = await lstat(path.join(worktreeDir, 'STICKYNOTE.md'));
      const envTarget = await readlink(path.join(worktreeDir, '.env'));
      const kamalSecretsTarget = await readlink(path.join(worktreeDir, '.kamal', 'secrets'));
      const stickyNoteTarget = await readlink(path.join(worktreeDir, 'STICKYNOTE.md'));
      const stickyNote = await readFile(path.join(worktreeDir, 'STICKYNOTE.md'), 'utf8');
      const canonicalStickyNote = await readFile(path.join(repoDir, 'STICKYNOTE.md'), 'utf8');
      const canonicalStickyNoteStat = await lstat(path.join(repoDir, 'STICKYNOTE.md'));

      expect(envStat.isSymbolicLink()).toBe(true);
      expect(await realpath(envTarget)).toBe(await realpath(path.join(repoDir, '.env')));
      expect(kamalSecretsStat.isSymbolicLink()).toBe(true);
      expect(await realpath(kamalSecretsTarget)).toBe(await realpath(path.join(repoDir, '.kamal', 'secrets')));
      expect(stickyNoteStat.isSymbolicLink()).toBe(true);
      expect(await realpath(stickyNoteTarget)).toBe(await realpath(path.join(repoDir, 'STICKYNOTE.md')));
      expect(canonicalStickyNoteStat.isSymbolicLink()).toBe(false);
      expect(stickyNote).toContain('# Sticky fixture');
      expect(canonicalStickyNote).toBe(stickyNote);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  it('keeps STICKYNOTE.md canonical across reruns and later linked worktrees', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-worktree-rerun-'));
    const repoDir = path.join(workspace, 'repo');
    const firstWorktreeDir = path.join(workspace, 'repo.feature');
    const secondWorktreeDir = path.join(workspace, 'repo.feature.second');
    const binDir = path.join(workspace, 'bin');
    const updatedStickyNote = [
      '# Sticky fixture',
      '',
      '## Completed This Session',
      '- Updated from the first linked worktree.',
      '',
      '## Key Files Changed',
      '- scripts/bootstrap-worktree.sh - kept STICKYNOTE canonical across worktrees.',
      '',
      '## Pending / Follow-Up',
      '- Ready for a future linked worktree check.'
    ].join('\n');

    await mkdir(repoDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await initGitRepo(repoDir);
    await seedWorktreeFixture(repoDir, 'chore: seed idempotent fixture');
    await writeBdStub(binDir);

    try {
      await addLinkedWorktree(repoDir, firstWorktreeDir, 'feat/test-worktree-rerun', binDir);
      await writeFile(path.join(firstWorktreeDir, 'STICKYNOTE.md'), `${updatedStickyNote}\n`, 'utf8');

      expect(await readFile(path.join(repoDir, 'STICKYNOTE.md'), 'utf8')).toContain(
        'Updated from the first linked worktree.'
      );

      await execFile(path.join(firstWorktreeDir, 'scripts', 'bootstrap-worktree.sh'), ['--quiet'], {
        cwd: firstWorktreeDir,
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ''}`
        }
      });

      const firstStickyNoteStat = await lstat(path.join(firstWorktreeDir, 'STICKYNOTE.md'));
      const firstStickyNoteTarget = await readlink(path.join(firstWorktreeDir, 'STICKYNOTE.md'));

      expect(firstStickyNoteStat.isSymbolicLink()).toBe(true);
      expect(await realpath(firstStickyNoteTarget)).toBe(await realpath(path.join(repoDir, 'STICKYNOTE.md')));

      await addLinkedWorktree(repoDir, secondWorktreeDir, 'feat/test-worktree-second', binDir);

      const secondStickyNoteStat = await lstat(path.join(secondWorktreeDir, 'STICKYNOTE.md'));
      const secondStickyNoteTarget = await readlink(path.join(secondWorktreeDir, 'STICKYNOTE.md'));
      const secondStickyNote = await readFile(path.join(secondWorktreeDir, 'STICKYNOTE.md'), 'utf8');

      expect(secondStickyNoteStat.isSymbolicLink()).toBe(true);
      expect(await realpath(secondStickyNoteTarget)).toBe(await realpath(path.join(repoDir, 'STICKYNOTE.md')));
      expect(secondStickyNote).toContain('Updated from the first linked worktree.');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  it('still bootstraps the worktree before returning a non-zero Beads hook status', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-worktree-degraded-'));
    const repoDir = path.join(workspace, 'repo');
    const worktreeDir = path.join(workspace, 'repo.feature');
    const binDir = path.join(workspace, 'bin');

    await mkdir(repoDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await initGitRepo(repoDir);
    await seedWorktreeFixture(repoDir, 'chore: seed degraded hook fixture');
    await writeBdStub(binDir);

    try {
      await addLinkedWorktree(repoDir, worktreeDir, 'feat/test-worktree-degraded', binDir);

      await rm(path.join(worktreeDir, '.env'), { force: true });
      await rm(path.join(worktreeDir, '.kamal', 'secrets'), { force: true });
      await rm(path.join(worktreeDir, 'STICKYNOTE.md'), { force: true });

      await writeBdStub(binDir, 23);

      await expect(
        execFile(path.join(worktreeDir, '.beads', 'hooks', 'post-checkout'), ['old-head', 'new-head', '1'], {
          cwd: worktreeDir,
          env: {
            ...process.env,
            PATH: `${binDir}:${process.env.PATH ?? ''}`
          }
        })
      ).rejects.toMatchObject({ code: 23 });

      const envStat = await lstat(path.join(worktreeDir, '.env'));
      const kamalSecretsStat = await lstat(path.join(worktreeDir, '.kamal', 'secrets'));
      const stickyNoteStat = await lstat(path.join(worktreeDir, 'STICKYNOTE.md'));
      const envTarget = await readlink(path.join(worktreeDir, '.env'));
      const kamalSecretsTarget = await readlink(path.join(worktreeDir, '.kamal', 'secrets'));
      const stickyNoteTarget = await readlink(path.join(worktreeDir, 'STICKYNOTE.md'));
      const stickyNote = await readFile(path.join(worktreeDir, 'STICKYNOTE.md'), 'utf8');

      expect(envStat.isSymbolicLink()).toBe(true);
      expect(await realpath(envTarget)).toBe(await realpath(path.join(repoDir, '.env')));
      expect(kamalSecretsStat.isSymbolicLink()).toBe(true);
      expect(await realpath(kamalSecretsTarget)).toBe(await realpath(path.join(repoDir, '.kamal', 'secrets')));
      expect(stickyNoteStat.isSymbolicLink()).toBe(true);
      expect(await realpath(stickyNoteTarget)).toBe(await realpath(path.join(repoDir, 'STICKYNOTE.md')));
      expect(stickyNote).toContain('# Sticky fixture');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  }, 15000);
});
