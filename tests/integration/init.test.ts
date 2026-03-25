import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runInit } from '../../src/commands/init.js';

describe('runInit', () => {
  it('creates the scaffold for a new project', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'sample-app',
      assistant: 'claude',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    expect(result.mode).toBe('new');
    expect(result.assistant).toBe('claude');
    expect(result.createdPaths).toContain('.gitignore');
    expect(result.createdPaths).toContain('.planning/config.json');
    expect(result.createdPaths).toContain('.claude/settings.json');
    await expect(readFile(path.join(workspace, 'sample-app', '.codex', 'README.md'), 'utf8')).rejects.toThrow();
  });

  it('creates Codex compatibility files when codex is selected', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'codex-app',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const codexReadme = await readFile(path.join(workspace, 'codex-app', '.codex', 'README.md'), 'utf8');
    const agentsGuide = await readFile(path.join(workspace, 'codex-app', 'AGENTS.md'), 'utf8');
    const codexBridgeWrapper = await readFile(path.join(workspace, 'codex-app', '.codex', 'scripts', 'cognee-brief.sh'), 'utf8');

    expect(result.assistant).toBe('codex');
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(result.createdPaths).toContain('AGENTS.md');
    expect(result.createdPaths).toContain('.claude/settings.json');
    expect(codexReadme).toContain('Codex Compatibility Layer');
    expect(agentsGuide).toContain('Codex Workflow');
    expect(codexBridgeWrapper).toContain('.claude/scripts/cognee-bridge.sh');
  });

  it('creates OpenCode-compatible files on the Codex scaffold when opencode is selected', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'opencode-app',
      assistant: 'opencode',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const codexReadme = await readFile(path.join(workspace, 'opencode-app', '.codex', 'README.md'), 'utf8');
    const agentsGuide = await readFile(path.join(workspace, 'opencode-app', 'AGENTS.md'), 'utf8');

    expect(result.assistant).toBe('opencode');
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(result.createdPaths).toContain('AGENTS.md');
    expect(codexReadme).toContain('OpenCode Compatibility Layer');
    expect(agentsGuide).toContain('OpenCode Workflow');
    expect(agentsGuide).toContain('.codex/');
  });

  it('does not overwrite existing files in existing-project mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-'));
    const targetDir = path.join(workspace, 'existing-project');
    const readmePath = path.join(targetDir, 'README.md');
    const gitignorePath = path.join(targetDir, '.gitignore');

    await writeFile(path.join(workspace, 'placeholder.txt'), 'placeholder', 'utf8');
    await mkdir(targetDir, { recursive: true });
    await writeFile(readmePath, '# Custom README\n', 'utf8');
    await writeFile(gitignorePath, 'dist/\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'claude',
      mode: 'existing',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const readme = await readFile(readmePath, 'utf8');
    const gitignore = await readFile(gitignorePath, 'utf8');

    expect(readme).toBe('# Custom README\n');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('.kamal/secrets');
    expect(result.skippedPaths).toContain('README.md');
    expect(result.createdPaths).toContain('.gitignore');
  });

  it('supports dry-run mode without writing files', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'dry-run-app',
      assistant: 'claude',
      mode: 'auto',
      dryRun: true,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    expect(result.createdPaths.length).toBeGreaterThan(0);
    await expect(readFile(path.join(workspace, 'dry-run-app', '.gitignore'), 'utf8')).rejects.toThrow();
  });
});
