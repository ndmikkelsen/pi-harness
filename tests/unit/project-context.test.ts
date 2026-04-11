import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { resolveProjectInput } from '../../src/core/project-input.js';

const execFile = promisify(execFileCallback);

describe('resolveProjectInput', () => {
  it('derives a new project target directory from the project name', () => {
    const result = resolveProjectInput({
      projectArg: 'sample-app',
      mode: 'auto',
      cwd: '/tmp/workspace'
    });

    expect(result.appName).toBe('sample-app');
    expect(result.targetDir).toBe('/tmp/workspace/sample-app');
    expect(result.mode).toBe('new');
    expect(result.inferenceNotes).toEqual([]);
  });

  it('infers a project name from the current directory in existing mode', async () => {
    const parentDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-context-'));
    const projectDir = path.join(parentDir, 'existing-project');
    await mkdir(projectDir);

    const result = resolveProjectInput({
      projectArg: '.',
      mode: 'existing',
      cwd: projectDir
    });

    expect(result.appName).toBe('existing-project');
    expect(result.targetDir).toBe(projectDir);
    expect(result.mode).toBe('existing');
  });

  it('uses the canonical git repo name when baking from a linked worktree root', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-context-'));
    const mainRepoDir = path.join(workspace, 'canonical-app');
    const worktreeDir = path.join(workspace, 'feature.bake');

    await mkdir(mainRepoDir, { recursive: true });
    await execFile('git', ['init', '--initial-branch=main'], { cwd: mainRepoDir });
    await execFile('git', ['config', 'user.name', 'Pi Harness Tests'], { cwd: mainRepoDir });
    await execFile('git', ['config', 'user.email', 'pi-harness-tests@example.com'], { cwd: mainRepoDir });
    await writeFile(path.join(mainRepoDir, 'README.md'), '# canonical app\n', 'utf8');
    await execFile('git', ['add', 'README.md'], { cwd: mainRepoDir });
    await execFile('git', ['commit', '-m', 'init'], { cwd: mainRepoDir });
    await execFile('git', ['worktree', 'add', '-b', 'feature-bake', worktreeDir], { cwd: mainRepoDir });

    const result = resolveProjectInput({
      mode: 'auto',
      cwd: worktreeDir
    });

    expect(result.appName).toBe('canonical-app');
    expect(result.targetDir).toBe(worktreeDir);
    expect(result.mode).toBe('existing');
    expect(result.inferenceNotes).toEqual([
      'Detected linked git worktree; using canonical repo slug "canonical-app" from the main worktree instead of the current worktree directory name.'
    ]);
  });

  it('repairs inferred project names when the directory basename is not already a valid slug', async () => {
    const parentDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-context-'));
    const projectDir = path.join(parentDir, '123 bad repo');
    await mkdir(projectDir);

    const result = resolveProjectInput({
      mode: 'existing',
      cwd: projectDir
    });

    expect(result.appName).toBe('project-123-bad-repo');
    expect(result.targetDir).toBe(projectDir);
    expect(result.mode).toBe('existing');
  });

  it('keeps explicit user-provided project names strict', () => {
    expect(() =>
      resolveProjectInput({
        projectArg: '123-bad-name',
        mode: 'auto',
        cwd: '/tmp/workspace'
      })
    ).toThrow('Project name must be lowercase alphanumeric with hyphens (for example: my-api).');
  });
});
