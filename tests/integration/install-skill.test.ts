import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runInstallSkill } from '../../src/commands/install-skill.js';

describe('runInstallSkill', () => {
  it('installs the OpenCode skill bundle into the requested skills root', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');

    const result = await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot
    });

    expect(result.assistant).toBe('opencode');
    expect(result.skillName).toBe('harness');
    expect(result.installDir).toBe(path.join(targetRoot, 'ai-harness'));
    expect(result.workflowDir).toBe(path.join(configRoot, 'get-shit-done', 'workflows'));
    expect(result.writtenPaths).toEqual(
      expect.arrayContaining([
        'skills/harness/SKILL.md',
        'skills/harness/references/ai-harness-command-matrix.md',
        'skills/harness/assets/adoption-notes-template.md'
      ])
    );
    expect(result.writtenWorkflowPaths).toContain('get-shit-done/workflows/autonomous.md');

    const installedSkill = await readFile(path.join(result.installDir, 'skills', 'harness', 'SKILL.md'), 'utf8');
    const installedWorkflow = await readFile(path.join(result.workflowDir, 'autonomous.md'), 'utf8');
    expect(installedSkill).toContain('# Harness');
    expect(installedSkill).toContain('ai-harness --mode existing . --init-json');
    expect(installedWorkflow).toContain('Drain ready Beads work and incomplete GSD phase work autonomously.');
    expect(installedWorkflow).toContain('.codex/workflows/autonomous-execution.md');
  });

  it('refreshes existing managed skill files on reinstall', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const installDir = path.join(targetRoot, 'ai-harness');
    const skillPath = path.join(installDir, 'skills', 'harness', 'SKILL.md');
    const workflowPath = path.join(configRoot, 'get-shit-done', 'workflows', 'autonomous.md');

    await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot
    });

    await writeFile(skillPath, 'stale\n', 'utf8');
    await writeFile(workflowPath, 'stale\n', 'utf8');

    const result = await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot
    });

    expect(result.writtenPaths).toContain('skills/harness/SKILL.md');
    expect(result.writtenWorkflowPaths).toContain('get-shit-done/workflows/autonomous.md');
    await expect(readFile(skillPath, 'utf8')).resolves.toContain('# Harness');
    await expect(readFile(workflowPath, 'utf8')).resolves.toContain('Drain ready Beads work and incomplete GSD phase work autonomously.');
    await expect(readFile(workflowPath, 'utf8')).resolves.toContain('.codex/workflows/autonomous-execution.md');
  });
});
