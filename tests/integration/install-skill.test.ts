import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runInstallSkill } from '../../src/commands/install-skill.js';
import { buildGsdDefaultsEntries, buildOpenCodeConfigEntries } from '../../src/core/opencode-skill.js';

describe('runInstallSkill', () => {
  it('installs the OpenCode skill bundle into the requested skills root', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');

    const result = await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    expect(result.assistant).toBe('opencode');
    expect(result.skillName).toBe('harness');
    expect(result.installDir).toBe(path.join(targetRoot, 'ai-harness'));
    expect(result.workflowDir).toBe(path.join(configRoot, 'get-shit-done', 'workflows'));
    expect(result.gsdRoot).toBe(gsdRoot);
    expect(result.writtenPaths).toEqual(
      expect.arrayContaining([
        'skills/harness/SKILL.md',
        'skills/harness/references/ai-harness-command-matrix.md',
        'skills/harness/assets/adoption-notes-template.md'
      ])
    );
    expect(result.writtenConfigPaths).toContain('oh-my-opencode.json');
    expect(result.writtenWorkflowPaths).toContain('get-shit-done/workflows/autonomous.md');
    expect(result.writtenDefaultsPaths).toContain('defaults.json');

    const installedSkill = await readFile(path.join(result.installDir, 'skills', 'harness', 'SKILL.md'), 'utf8');
    const installedOpenCodeDefaults = await readFile(path.join(configRoot, 'oh-my-opencode.json'), 'utf8');
    const installedWorkflow = await readFile(path.join(result.workflowDir, 'autonomous.md'), 'utf8');
    const installedGsdDefaults = await readFile(path.join(gsdRoot, 'defaults.json'), 'utf8');
    expect(installedSkill).toContain('# Harness');
    expect(installedSkill).toContain('ai-harness --mode existing . --init-json');
    expect(installedOpenCodeDefaults).toContain('"sisyphus": {');
    expect(installedOpenCodeDefaults).toContain('"model": "openai/gpt-5.4"');
    expect(installedOpenCodeDefaults).toContain('"model": "openai/gpt-5.3-codex"');
    expect(installedOpenCodeDefaults).toContain('"model": "opencode/big-pickle"');
    expect(installedWorkflow).toContain('Drain ready Beads work and incomplete GSD phase work autonomously.');
    expect(installedWorkflow).toContain('.codex/workflows/autonomous-execution.md');
    expect(installedGsdDefaults).toContain('"model_profile": "inherit"');
    expect(installedGsdDefaults).toContain('"gsd-planner": "openai/gpt-5.3-codex"');
    expect(installedGsdDefaults).toContain('"gsd-executor": "openai/gpt-5.4"');
    expect(installedGsdDefaults).toContain('"gsd-codebase-mapper": "opencode/big-pickle"');
  });

  it('refreshes existing managed skill and defaults files on reinstall', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');
    const installDir = path.join(targetRoot, 'ai-harness');
    const skillPath = path.join(installDir, 'skills', 'harness', 'SKILL.md');
    const defaultsPath = path.join(configRoot, 'oh-my-opencode.json');
    const workflowPath = path.join(configRoot, 'get-shit-done', 'workflows', 'autonomous.md');
    const gsdDefaultsPath = path.join(gsdRoot, 'defaults.json');

    await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    await writeFile(skillPath, 'stale\n', 'utf8');
    await writeFile(defaultsPath, 'stale\n', 'utf8');
    await writeFile(workflowPath, 'stale\n', 'utf8');
    await writeFile(gsdDefaultsPath, 'stale\n', 'utf8');

    const result = await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    expect(result.writtenPaths).toContain('skills/harness/SKILL.md');
    expect(result.writtenConfigPaths).toContain('oh-my-opencode.json');
    expect(result.writtenWorkflowPaths).toContain('get-shit-done/workflows/autonomous.md');
    expect(result.writtenDefaultsPaths).toContain('defaults.json');
    await expect(readFile(skillPath, 'utf8')).resolves.toContain('# Harness');
    await expect(readFile(defaultsPath, 'utf8')).resolves.toContain('"sisyphus": {');
    await expect(readFile(workflowPath, 'utf8')).resolves.toContain('Drain ready Beads work and incomplete GSD phase work autonomously.');
    await expect(readFile(workflowPath, 'utf8')).resolves.toContain('.codex/workflows/autonomous-execution.md');
    await expect(readFile(gsdDefaultsPath, 'utf8')).resolves.toContain('"gsd-executor": "openai/gpt-5.4"');
  });

  it('preserves unrelated OpenCode and GSD JSON config on rerun', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');
    const defaultsPath = path.join(configRoot, 'oh-my-opencode.json');
    const gsdDefaultsPath = path.join(gsdRoot, 'defaults.json');

    await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    await writeFile(
      defaultsPath,
      `${JSON.stringify(
        {
          provider: {
            custom: {
              apiBase: 'https://example.test'
            }
          },
          plugin: ['user-plugin@latest'],
          agents: {
            customAgent: {
              model: 'user/model'
            },
            sisyphus: {
              model: 'wrong/model',
              variant: 'low'
            }
          },
          categories: {
            customCategory: {
              model: 'user/category-model'
            },
            writing: {
              model: 'wrong/model',
              variant: 'low'
            }
          }
        },
        null,
        2
      )}\n`,
      'utf8'
    );

    await writeFile(
      gsdDefaultsPath,
      `${JSON.stringify(
        {
          mode: 'interactive',
          model_profile: 'budget',
          resolve_model_ids: true,
          custom_flag: true,
          model_overrides: {
            'gsd-planner': 'wrong/model',
            'gsd-custom-agent': 'user/model'
          }
        },
        null,
        2
      )}\n`,
      'utf8'
    );

    const result = await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    expect(result.writtenConfigPaths).toContain('oh-my-opencode.json');
    expect(result.writtenDefaultsPaths).toContain('defaults.json');

    const mergedOpenCodeDefaults = JSON.parse(await readFile(defaultsPath, 'utf8')) as {
      provider: { custom: { apiBase: string } };
      plugin: string[];
      agents: Record<string, { model: string; variant?: string }>;
      categories: Record<string, { model: string; variant?: string }>;
    };
    const mergedGsdDefaults = JSON.parse(await readFile(gsdDefaultsPath, 'utf8')) as {
      mode: string;
      model_profile: string;
      resolve_model_ids: string;
      custom_flag: boolean;
      model_overrides: Record<string, string>;
    };

    expect(mergedOpenCodeDefaults.provider.custom.apiBase).toBe('https://example.test');
    expect(mergedOpenCodeDefaults.plugin).toEqual(['user-plugin@latest']);
    expect(mergedOpenCodeDefaults.agents.customAgent).toEqual({ model: 'user/model' });
    expect(mergedOpenCodeDefaults.categories.customCategory).toEqual({ model: 'user/category-model' });
    expect(mergedOpenCodeDefaults.agents.sisyphus).toEqual({ model: 'openai/gpt-5.4', variant: 'high' });
    expect(mergedOpenCodeDefaults.categories.writing).toEqual({ model: 'openai/gpt-5.3-codex', variant: 'medium' });

    expect(mergedGsdDefaults.mode).toBe('interactive');
    expect(mergedGsdDefaults.custom_flag).toBe(true);
    expect(mergedGsdDefaults.model_profile).toBe('inherit');
    expect(mergedGsdDefaults.resolve_model_ids).toBe('omit');
    expect(mergedGsdDefaults.model_overrides['gsd-custom-agent']).toBe('user/model');
    expect(mergedGsdDefaults.model_overrides['gsd-planner']).toBe('openai/gpt-5.3-codex');
  });

  it('replaces malformed managed defaults files with generated content', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');
    const defaultsPath = path.join(configRoot, 'oh-my-opencode.json');
    const gsdDefaultsPath = path.join(gsdRoot, 'defaults.json');
    const generatedOpenCodeDefaults = buildOpenCodeConfigEntries()[0]?.content();
    const generatedGsdDefaults = buildGsdDefaultsEntries()[0]?.content();

    expect(generatedOpenCodeDefaults).toBeDefined();
    expect(generatedGsdDefaults).toBeDefined();

    await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    await writeFile(defaultsPath, '{"provider": {\n', 'utf8');
    await writeFile(gsdDefaultsPath, '{"model_overrides": [\n', 'utf8');

    const result = await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    expect(result.writtenConfigPaths).toContain('oh-my-opencode.json');
    expect(result.writtenDefaultsPaths).toContain('defaults.json');
    await expect(readFile(defaultsPath, 'utf8')).resolves.toBe(generatedOpenCodeDefaults);
    await expect(readFile(gsdDefaultsPath, 'utf8')).resolves.toBe(generatedGsdDefaults);
  });

  it('surfaces permission-denied errors when refreshing managed defaults files', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-install-skill-'));
    const targetRoot = path.join(workspace, 'opencode-skills');
    const configRoot = path.join(workspace, 'opencode-config');
    const gsdRoot = path.join(workspace, '.gsd');
    const defaultsPath = path.join(configRoot, 'oh-my-opencode.json');

    await runInstallSkill({
      cwd: workspace,
      assistant: 'opencode',
      targetRoot,
      configRoot,
      gsdRoot
    });

    await writeFile(defaultsPath, '{"stale": true}\n', 'utf8');
    await chmod(defaultsPath, 0o400);

    await expect(
      runInstallSkill({
        cwd: workspace,
        assistant: 'opencode',
        targetRoot,
        configRoot,
        gsdRoot
      })
    ).rejects.toMatchObject({
      code: 'EACCES',
      path: defaultsPath,
      message: expect.stringContaining('permission denied')
    });
  });
});
