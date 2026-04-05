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
});
