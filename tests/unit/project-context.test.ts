import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { resolveProjectInput } from '../../src/core/project-input.js';

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
