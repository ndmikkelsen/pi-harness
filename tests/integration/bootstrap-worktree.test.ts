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
  await execFile('git', ['config', 'user.name', 'AI Harness Tests'], { cwd: repoDir });
  await execFile('git', ['config', 'user.email', 'tests@example.com'], { cwd: repoDir });
  await execFile('git', ['config', 'core.hooksPath', '.beads/hooks'], { cwd: repoDir });
}

describe('bootstrap-worktree hook', () => {
  it('links shared env files and secrets into new worktrees', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-worktree-'));
    const repoDir = path.join(workspace, 'repo');
    const worktreeDir = path.join(workspace, 'repo.feature');
    const binDir = path.join(workspace, 'bin');

    await mkdir(repoDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await initGitRepo(repoDir);

    const bootstrapScript = await readFile(path.join(repoRoot, '.codex', 'scripts', 'bootstrap-worktree.sh'), 'utf8');
    const postCheckoutHook = await readFile(path.join(repoRoot, '.beads', 'hooks', 'post-checkout'), 'utf8');

    await mkdir(path.join(repoDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(repoDir, '.beads', 'hooks'), { recursive: true });
    await mkdir(path.join(repoDir, '.kamal'), { recursive: true });

    await writeFile(path.join(repoDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), bootstrapScript, 'utf8');
    await writeFile(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), postCheckoutHook, 'utf8');
    await writeFile(path.join(repoDir, '.envrc'), '# direnv fixture\n', 'utf8');
    await writeFile(path.join(repoDir, 'STICKYNOTE.example.md'), '# Sticky fixture\n', 'utf8');
    await writeFile(path.join(repoDir, '.kamal', 'secrets.example'), 'EXAMPLE=1\n', 'utf8');

    await chmod(path.join(repoDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), 0o755);
    await chmod(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), 0o755);

    await execFile('git', ['add', '.'], { cwd: repoDir });
    await execFile('git', ['commit', '-m', 'chore: seed worktree fixture'], { cwd: repoDir });

    await writeFile(path.join(repoDir, '.env'), 'LLM_API_KEY=dev\n', 'utf8');
    await writeFile(path.join(repoDir, '.kamal', 'secrets'), 'KAMAL_REGISTRY_PASSWORD=dev\n', 'utf8');

    await writeFile(
      path.join(binDir, 'bd'),
      '#!/usr/bin/env bash\nset -euo pipefail\nif [[ "$1 $2" == "hooks run" ]]; then\n  exit 0\nfi\nexit 0\n',
      'utf8'
    );
    await chmod(path.join(binDir, 'bd'), 0o755);

    try {
      await execFile('git', ['worktree', 'add', worktreeDir, '-b', 'feat/test-worktree-sync'], {
        cwd: repoDir,
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ''}`
        }
      });

      const envStat = await lstat(path.join(worktreeDir, '.env'));
      const kamalSecretsStat = await lstat(path.join(worktreeDir, '.kamal', 'secrets'));
      const stickyNote = await readFile(path.join(worktreeDir, 'STICKYNOTE.md'), 'utf8');
      const envTarget = await readlink(path.join(worktreeDir, '.env'));
      const kamalSecretsTarget = await readlink(path.join(worktreeDir, '.kamal', 'secrets'));

      expect(envStat.isSymbolicLink()).toBe(true);
      expect(await realpath(envTarget)).toBe(await realpath(path.join(repoDir, '.env')));
      expect(kamalSecretsStat.isSymbolicLink()).toBe(true);
      expect(await realpath(kamalSecretsTarget)).toBe(await realpath(path.join(repoDir, '.kamal', 'secrets')));
      expect(stickyNote).toContain('# Sticky fixture');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  it('is idempotent when rerun after the initial worktree bootstrap', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-worktree-rerun-'));
    const repoDir = path.join(workspace, 'repo');
    const worktreeDir = path.join(workspace, 'repo.feature');
    const binDir = path.join(workspace, 'bin');

    await mkdir(repoDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await initGitRepo(repoDir);

    const bootstrapScriptPath = path.join(repoRoot, '.codex', 'scripts', 'bootstrap-worktree.sh');
    const bootstrapScript = await readFile(bootstrapScriptPath, 'utf8');
    const postCheckoutHook = await readFile(path.join(repoRoot, '.beads', 'hooks', 'post-checkout'), 'utf8');

    await mkdir(path.join(repoDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(repoDir, '.beads', 'hooks'), { recursive: true });
    await mkdir(path.join(repoDir, '.kamal'), { recursive: true });

    await writeFile(path.join(repoDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), bootstrapScript, 'utf8');
    await writeFile(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), postCheckoutHook, 'utf8');
    await writeFile(path.join(repoDir, '.envrc'), '# direnv fixture\n', 'utf8');
    await writeFile(path.join(repoDir, 'STICKYNOTE.example.md'), '# Sticky fixture\n', 'utf8');
    await writeFile(path.join(repoDir, '.kamal', 'secrets.example'), 'EXAMPLE=1\n', 'utf8');

    await chmod(path.join(repoDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), 0o755);
    await chmod(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), 0o755);

    await execFile('git', ['add', '.'], { cwd: repoDir });
    await execFile('git', ['commit', '-m', 'chore: seed idempotent fixture'], { cwd: repoDir });

    await writeFile(path.join(repoDir, '.env'), 'LLM_API_KEY=dev\n', 'utf8');
    await writeFile(path.join(repoDir, '.kamal', 'secrets'), 'KAMAL_REGISTRY_PASSWORD=dev\n', 'utf8');

    await writeFile(
      path.join(binDir, 'bd'),
      '#!/usr/bin/env bash\nset -euo pipefail\nif [[ "$1 $2" == "hooks run" ]]; then\n  exit 0\nfi\nexit 0\n',
      'utf8'
    );
    await chmod(path.join(binDir, 'bd'), 0o755);

    try {
      await execFile('git', ['worktree', 'add', worktreeDir, '-b', 'feat/test-worktree-rerun'], {
        cwd: repoDir,
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ''}`
        }
      });

      await execFile(path.join(worktreeDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), ['--quiet'], {
        cwd: worktreeDir,
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ''}`
        }
      });

      const envStat = await lstat(path.join(worktreeDir, '.env'));
      const kamalSecretsStat = await lstat(path.join(worktreeDir, '.kamal', 'secrets'));
      const stickyNote = await readFile(path.join(worktreeDir, 'STICKYNOTE.md'), 'utf8');
      const envTarget = await readlink(path.join(worktreeDir, '.env'));
      const kamalSecretsTarget = await readlink(path.join(worktreeDir, '.kamal', 'secrets'));

      expect(envStat.isSymbolicLink()).toBe(true);
      expect(await realpath(envTarget)).toBe(await realpath(path.join(repoDir, '.env')));
      expect(kamalSecretsStat.isSymbolicLink()).toBe(true);
      expect(await realpath(kamalSecretsTarget)).toBe(await realpath(path.join(repoDir, '.kamal', 'secrets')));
      expect(stickyNote).toContain('# Sticky fixture');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  it('still bootstraps the worktree before returning a non-zero Beads hook status', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-worktree-degraded-'));
    const repoDir = path.join(workspace, 'repo');
    const worktreeDir = path.join(workspace, 'repo.feature');
    const binDir = path.join(workspace, 'bin');

    await mkdir(repoDir, { recursive: true });
    await mkdir(binDir, { recursive: true });
    await initGitRepo(repoDir);

    const bootstrapScript = await readFile(path.join(repoRoot, '.codex', 'scripts', 'bootstrap-worktree.sh'), 'utf8');
    const postCheckoutHook = await readFile(path.join(repoRoot, '.beads', 'hooks', 'post-checkout'), 'utf8');

    await mkdir(path.join(repoDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(repoDir, '.beads', 'hooks'), { recursive: true });
    await mkdir(path.join(repoDir, '.kamal'), { recursive: true });

    await writeFile(path.join(repoDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), bootstrapScript, 'utf8');
    await writeFile(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), postCheckoutHook, 'utf8');
    await writeFile(path.join(repoDir, '.envrc'), '# direnv fixture\n', 'utf8');
    await writeFile(path.join(repoDir, 'STICKYNOTE.example.md'), '# Sticky fixture\n', 'utf8');
    await writeFile(path.join(repoDir, '.kamal', 'secrets.example'), 'EXAMPLE=1\n', 'utf8');

    await chmod(path.join(repoDir, '.codex', 'scripts', 'bootstrap-worktree.sh'), 0o755);
    await chmod(path.join(repoDir, '.beads', 'hooks', 'post-checkout'), 0o755);

    await execFile('git', ['add', '.'], { cwd: repoDir });
    await execFile('git', ['commit', '-m', 'chore: seed degraded hook fixture'], { cwd: repoDir });

    await writeFile(path.join(repoDir, '.env'), 'LLM_API_KEY=dev\n', 'utf8');
    await writeFile(path.join(repoDir, '.kamal', 'secrets'), 'KAMAL_REGISTRY_PASSWORD=dev\n', 'utf8');

    await writeFile(
      path.join(binDir, 'bd'),
      '#!/usr/bin/env bash\nset -euo pipefail\nif [[ "$1 $2" == "hooks run" ]]; then\n  exit 0\nfi\nexit 0\n',
      'utf8'
    );
    await chmod(path.join(binDir, 'bd'), 0o755);

    try {
      await execFile('git', ['worktree', 'add', worktreeDir, '-b', 'feat/test-worktree-degraded'], {
        cwd: repoDir,
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ''}`
        }
      });

      await rm(path.join(worktreeDir, '.env'), { force: true });
      await rm(path.join(worktreeDir, '.kamal', 'secrets'), { force: true });
      await rm(path.join(worktreeDir, 'STICKYNOTE.md'), { force: true });

      await writeFile(
        path.join(binDir, 'bd'),
        '#!/usr/bin/env bash\nset -euo pipefail\nif [[ "$1 $2" == "hooks run" ]]; then\n  exit 23\nfi\nexit 0\n',
        'utf8'
      );
      await chmod(path.join(binDir, 'bd'), 0o755);

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
      const stickyNote = await readFile(path.join(worktreeDir, 'STICKYNOTE.md'), 'utf8');
      const envTarget = await readlink(path.join(worktreeDir, '.env'));
      const kamalSecretsTarget = await readlink(path.join(worktreeDir, '.kamal', 'secrets'));

      expect(envStat.isSymbolicLink()).toBe(true);
      expect(await realpath(envTarget)).toBe(await realpath(path.join(repoDir, '.env')));
      expect(kamalSecretsStat.isSymbolicLink()).toBe(true);
      expect(await realpath(kamalSecretsTarget)).toBe(await realpath(path.join(repoDir, '.kamal', 'secrets')));
      expect(stickyNote).toContain('# Sticky fixture');
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
});
