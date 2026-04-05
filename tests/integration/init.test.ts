import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getCleanupManifest } from '../../src/core/cleanup-manifests.js';
import { AI_HARNESS_VERSION } from '../../src/core/harness-release.js';
import { runInit } from '../../src/commands/init.js';

const manifest = getCleanupManifest('legacy-ai-frameworks-v1');
const legacyRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-runtime-dir')!.path;

describe('runInit', () => {
  it('creates the scaffold for a new project', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'sample-app',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const envExample = await readFile(path.join(workspace, 'sample-app', '.env.example'), 'utf8');

    expect(result.mode).toBe('new');
    expect(result.assistant).toBe('codex');
    expect(result.createdPaths).toContain('.gitignore');
    expect(result.createdPaths).not.toContain('.opencode/worktree.jsonc');
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(result.createdPaths).toContain('.codex/workflows/autonomous-execution.md');
    expect(result.createdPaths).toContain('.codex/skills/harness/SKILL.md');
    expect(result.createdPaths).toContain('.omp/agents/orchestrator.md');
    expect(result.createdPaths).toContain('.omp/skills/parallel-wave-design/SKILL.md');
    expect(result.createdPaths).not.toContain('.rules/patterns/omo-agent-contract.md');
    expect(result.createdPaths).toContain('.beads/hooks/post-checkout');
    expect(result.createdPaths).toContain('.rules/patterns/operator-workflow.md');
    expect(result.createdPaths).toContain('.codex/scripts/cognee-bridge.sh');
    expect(result.createdPaths).not.toContain('.codex/scripts/cognee-sync-planning.sh');
    expect(result.createdPaths).not.toContain('.codex/scripts/sync-planning-to-cognee.sh');
    expect(result.createdPaths).not.toContain('.codex/scripts/sync-to-cognee.sh');
    expect(result.createdPaths).not.toContain('.codex/templates/session-handoff.md');
    expect(result.createdPaths).not.toContain('.planning/TRACEABILITY.md');
    expect(result.createdPaths).not.toContain('CONSTITUTION.md');
    expect(result.createdPaths).not.toContain('VISION.md');
    expect(result.createdPaths).not.toContain('STICKYNOTE.md');
    expect(result.createdPaths).toContain('STICKYNOTE.example.md');
    expect(envExample).toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
    expect(envExample).toContain('COGNEE_URL=https://sample-app-cognee.apps.compute.lan');
    expect(envExample).not.toContain('BEADS_DOLT_PASSWORD');
    expect(result.cleanup.enabled).toBe(false);
  });

  it('does not scaffold planning artifacts by default', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'planning-app',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'planning-app');
    const stickyExample = await readFile(path.join(projectDir, 'STICKYNOTE.example.md'), 'utf8');

    expect(stickyExample).toContain('# Session Handoff');
    expect(stickyExample).toContain('- Current branch:');
    expect(stickyExample).toContain('- Note any validation still required before landing work.');
    await expect(readFile(path.join(projectDir, '.planning', 'REQUIREMENTS.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, '.planning', 'ROADMAP.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, '.planning', 'TRACEABILITY.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, 'CONSTITUTION.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, 'VISION.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, 'STICKYNOTE.md'), 'utf8')).rejects.toThrow();
  });

  it('creates Codex compatibility files when codex is selected', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
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
    const ompOrchestrator = await readFile(path.join(workspace, 'codex-app', '.omp', 'agents', 'orchestrator.md'), 'utf8');
    const ompSkill = await readFile(
      path.join(workspace, 'codex-app', '.omp', 'skills', 'parallel-wave-design', 'SKILL.md'),
      'utf8'
    );
    const codexBridgeWrapper = await readFile(path.join(workspace, 'codex-app', '.codex', 'scripts', 'cognee-brief.sh'), 'utf8');

    expect(result.assistant).toBe('codex');
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(result.createdPaths).toContain('.codex/workflows/autonomous-execution.md');
    expect(result.createdPaths).toContain('.codex/skills/harness/SKILL.md');
    expect(result.createdPaths).toContain('.omp/agents/orchestrator.md');
    expect(result.createdPaths).toContain('.omp/skills/parallel-wave-design/SKILL.md');
    expect(result.createdPaths).toContain('.rules/patterns/operator-workflow.md');
    expect(result.createdPaths).toContain('AGENTS.md');
    expect(result.createdPaths).toContain('.codex/docker/Dockerfile.cognee');
    expect(result.createdPaths).not.toContain('.codex/scripts/cognee-sync-planning.sh');
    expect(result.createdPaths).not.toContain('.codex/scripts/sync-planning-to-cognee.sh');
    expect(result.createdPaths).not.toContain('.codex/scripts/sync-to-cognee.sh');
    expect(result.createdPaths).not.toContain('.codex/templates/session-handoff.md');
    expect(codexReadme).toContain('Codex Compatibility Layer');
    expect(codexReadme).not.toContain('.rules/patterns/omo-agent-contract.md');
    expect(codexReadme).toContain('.rules/patterns/operator-workflow.md');
    expect(codexReadme).toContain('.omp/agents/orchestrator.md');
    expect(codexReadme).toContain('.omp/skills/parallel-wave-design/SKILL.md');
    expect(codexReadme).toContain('.codex/workflows/autonomous-execution.md');
    expect(codexReadme).toContain('./.codex/scripts/cognee-brief.sh');
    expect(codexReadme).toContain('.codex/skills/harness/SKILL.md');
    expect(codexReadme).not.toContain('./.codex/scripts/sync-to-cognee.sh');
    expect(agentsGuide).toContain('Codex Workflow');
    expect(agentsGuide).toContain('.omp/agents/*.md');
    expect(agentsGuide).toContain('.codex/workflows/autonomous-execution.md');
    expect(agentsGuide).not.toContain('.rules/patterns/omo-agent-contract.md');
    expect(ompOrchestrator).toContain('name: orchestrator');
    expect(ompOrchestrator).toContain('skill://parallel-wave-design');
    expect(ompSkill).toContain('name: parallel-wave-design');
    expect(codexBridgeWrapper).toContain('.codex/scripts/cognee-bridge.sh');
    await expect(readFile(path.join(workspace, 'codex-app', '.codex', 'scripts', 'cognee-sync-planning.sh'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(workspace, 'codex-app', '.codex', 'scripts', 'sync-planning-to-cognee.sh'), 'utf8')).rejects.toThrow();
  });

  it('configures the Cognee deploy template for single-tenant pgvector startup', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'cognee-app',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const deployConfig = await readFile(path.join(workspace, 'cognee-app', 'config', 'deploy.cognee.yml'), 'utf8');
    const dockerfile = await readFile(path.join(workspace, 'cognee-app', '.codex', 'docker', 'Dockerfile.cognee'), 'utf8');

    expect(deployConfig).toContain('REQUIRE_AUTHENTICATION: "false"');
    expect(deployConfig).toContain('ENABLE_BACKEND_ACCESS_CONTROL: "false"');
    expect(deployConfig).toContain('LLM_MODEL: gpt-4o-mini');
    expect(deployConfig).toContain('VECTOR_DATASET_DATABASE_HANDLER: pgvector');
    expect(deployConfig).toContain('response_timeout: 300');
    expect(deployConfig).toContain('path: /health');
    expect(dockerfile).toContain('Cognee release tags are not consistently published to Docker Hub.');
    expect(dockerfile).toContain(
      'FROM cognee/cognee:latest@sha256:eba227c33dd7f5eb997a0072f418792fd8aaa8873e9bb12240915d4e69396970'
    );
  });

  it('creates a worktree bootstrap script that links shared local env files', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'bootstrap-app',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const bootstrapScript = await readFile(
      path.join(workspace, 'bootstrap-app', '.codex', 'scripts', 'bootstrap-worktree.sh'),
      'utf8'
    );
    await expect(readFile(path.join(workspace, 'bootstrap-app', '.opencode', 'worktree.jsonc'), 'utf8')).rejects.toThrow();

    expect(bootstrapScript).toContain('.env');
    expect(bootstrapScript).toContain('.kamal/secrets');
    expect(bootstrapScript).toContain('direnv allow');
    expect(bootstrapScript).toContain('.rules/patterns/operator-workflow.md');
    expect(bootstrapScript).not.toContain('.rules/patterns/omo-agent-contract.md');
  });

  it('scaffolds Cognee fallback behavior for the codex-only baseline', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'cognee-policy-app',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'cognee-policy-app');
    const autonomousWorkflow = await readFile(
      path.join(projectDir, '.codex', 'workflows', 'autonomous-execution.md'),
      'utf8'
    );
    const managedAutonomousWorkflow = await readFile(
      path.join(projectDir, '.codex', 'scripts', 'bootstrap-worktree.sh'),
      'utf8'
    );

    expect(autonomousWorkflow).toContain('COGNEE_AVAILABLE');
    expect(autonomousWorkflow).toContain('continue only when the work remains locally verifiable');
    expect(autonomousWorkflow).not.toContain('.rules/patterns/omo-agent-contract.md');
    expect(managedAutonomousWorkflow).toContain('quiet=false');
  });

  it('does not overwrite existing files in existing-project mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-project');
    const readmePath = path.join(targetDir, 'README.md');
    const gitignorePath = path.join(targetDir, '.gitignore');
    const envExamplePath = path.join(targetDir, '.env.example');
    const originalReadme = '# Custom README\n';
    const originalGitignore = 'dist/\ncustom-cache/\n';
    const originalEnvExample = 'EXISTING_ONLY=true\n';

    await writeFile(path.join(workspace, 'placeholder.txt'), 'placeholder', 'utf8');
    await mkdir(targetDir, { recursive: true });
    await writeFile(readmePath, originalReadme, 'utf8');
    await writeFile(gitignorePath, originalGitignore, 'utf8');
    await writeFile(envExamplePath, originalEnvExample, 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const readme = await readFile(readmePath, 'utf8');
    const gitignore = await readFile(gitignorePath, 'utf8');
    const envExample = await readFile(envExamplePath, 'utf8');

    expect(readme).toBe(originalReadme);
    expect(gitignore).toBe(originalGitignore);
    expect(envExample).toBe(originalEnvExample);
    expect(result.skippedPaths).toContain('README.md');
    expect(result.skippedPaths).toContain('.gitignore');
    expect(result.skippedPaths).toContain('.env.example');
    expect(result.createdPaths).not.toContain('.gitignore');
    expect(result.createdPaths).not.toContain('.env.example');
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(result.createdPaths).toContain('.codex/workflows/autonomous-execution.md');
    expect(result.createdPaths).toContain('.codex/skills/harness/SKILL.md');
    expect(result.createdPaths).toContain('.omp/agents/orchestrator.md');
    expect(result.createdPaths).toContain('.omp/skills/parallel-wave-design/SKILL.md');
    expect(result.cleanup.enabled).toBe(false);
  });

  it('merges root files in existing-project mode only when explicitly requested', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-project-merge');
    const gitignorePath = path.join(targetDir, '.gitignore');
    const envExamplePath = path.join(targetDir, '.env.example');

    await mkdir(targetDir, { recursive: true });
    await writeFile(gitignorePath, 'dist/\n', 'utf8');
    await writeFile(envExamplePath, 'EXISTING_ONLY=true\n', 'utf8');

    const firstResult = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false,
      mergeRootFiles: true
    });

    const firstGitignore = await readFile(gitignorePath, 'utf8');
    const firstEnvExample = await readFile(envExamplePath, 'utf8');

    expect(firstResult.createdPaths).toContain('.gitignore');
    expect(firstResult.createdPaths).toContain('.env.example');
    expect(firstGitignore).toContain('dist/');
    expect(firstGitignore).toContain('.env');
    expect(firstGitignore).toContain('.kamal/secrets');
    expect(firstEnvExample).toContain('EXISTING_ONLY=true');
    expect(firstEnvExample).toContain('# AI workflow scaffold');
    expect(firstEnvExample).toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
    expect(firstEnvExample).not.toContain('BEADS_DOLT_PASSWORD');

    const secondResult = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false,
      mergeRootFiles: true
    });

    const secondGitignore = await readFile(gitignorePath, 'utf8');
    const secondEnvExample = await readFile(envExamplePath, 'utf8');

    expect(secondGitignore).toBe(firstGitignore);
    expect(secondEnvExample).toBe(firstEnvExample);
    expect(secondResult.skippedPaths).toContain('.gitignore');
    expect(secondResult.skippedPaths).toContain('.env.example');
  });

  it('applies safe curated cleanup entries before scaffolding existing repos', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-cleanup');
    const gitignorePath = path.join(targetDir, '.gitignore');
    const envExamplePath = path.join(targetDir, '.env.example');

    await mkdir(path.join(targetDir, '.codex', 'templates'), { recursive: true });
    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'templates', 'session-handoff.md'), '# old\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(gitignorePath, 'dist/\n', 'utf8');
    await writeFile(envExamplePath, 'EXISTING_ONLY=true\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      skipGit: true,
      detectPorts: false
    });

    expect(result.cleanup.enabled).toBe(true);
    expect(result.cleanup.status).toBe('applied');
    expect(result.cleanup.removedPaths).toEqual(
      expect.arrayContaining(['.codex/templates/session-handoff.md', '.codex/scripts/sync-to-cognee.sh'])
    );
    expect(result.cleanup.summary.deleted).toBe(2);
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(await readFile(gitignorePath, 'utf8')).toBe('dist/\n');
    expect(await readFile(envExamplePath, 'utf8')).toBe('EXISTING_ONLY=true\n');
    await expect(readFile(path.join(targetDir, '.codex', 'templates', 'session-handoff.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), 'utf8')).rejects.toThrow();
  });

  it('blocks ambiguous curated cleanup entries without deleting them in non-interactive mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-ambiguous-cleanup');

    await mkdir(path.join(targetDir, legacyRuntimeDir), { recursive: true });
    await writeFile(path.join(targetDir, legacyRuntimeDir, 'notes.md'), '# notes\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      nonInteractive: true,
      skipGit: true,
      detectPorts: false
    });

    expect(result.cleanup.enabled).toBe(true);
    expect(result.cleanup.status).toBe('blocked');
    expect(result.cleanup.summary.promptRequired).toBeGreaterThan(0);
    expect(result.cleanup.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyRuntimeDir, status: 'prompt-required' })
      ])
    );
    expect(result.createdPaths).toContain('.codex/README.md');
    expect(await readFile(path.join(targetDir, legacyRuntimeDir, 'notes.md'), 'utf8')).toContain('notes');
  });

  it('deletes prompt-before-delete entries when confirmation is provided', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-confirmed-cleanup');

    await mkdir(path.join(targetDir, '.agents'), { recursive: true });
    await writeFile(path.join(targetDir, '.agents', 'implementer.md'), '# implementer\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      skipGit: true,
      detectPorts: false,
      confirmCleanup: async (entry) => entry.path === '.agents'
    });

    expect(result.cleanup.status).toBe('applied');
    expect(result.cleanup.removedPaths).toContain('.agents');
    await expect(readFile(path.join(targetDir, '.agents', 'implementer.md'), 'utf8')).rejects.toThrow();
  });

  it('removes legacy Claude workflow artifacts only when confirmation is provided', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-confirmed-claude-cleanup');

    await mkdir(path.join(targetDir, '.claude', 'commands'), { recursive: true });
    await writeFile(path.join(targetDir, '.claude', 'commands', 'review.md'), '# review\n', 'utf8');
    await writeFile(path.join(targetDir, 'CLAUDE.md'), '# Claude\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      skipGit: true,
      detectPorts: false,
      confirmCleanup: async (entry) => entry.path === '.claude' || entry.path === 'CLAUDE.md'
    });

    expect(result.cleanup.status).toBe('applied');
    expect(result.cleanup.removedPaths).toEqual(expect.arrayContaining(['.claude', 'CLAUDE.md']));
    await expect(readFile(path.join(targetDir, '.claude', 'commands', 'review.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(targetDir, 'CLAUDE.md'), 'utf8')).rejects.toThrow();
  });

  it('removes the legacy planning workspace only when confirmation is provided', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-confirmed-planning-cleanup');

    await mkdir(path.join(targetDir, '.planning'), { recursive: true });
    await writeFile(path.join(targetDir, '.planning', 'TRACEABILITY.md'), '# traceability\n', 'utf8');
    await writeFile(path.join(targetDir, '.planning', 'PROJECT.md'), '# Custom Project\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      skipGit: true,
      detectPorts: false,
      confirmCleanup: async (entry) => entry.path === '.planning'
    });

    expect(result.cleanup.status).toBe('applied');
    expect(result.cleanup.removedPaths).toContain('.planning');
    await expect(readFile(path.join(targetDir, '.planning', 'TRACEABILITY.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(targetDir, '.planning', 'PROJECT.md'), 'utf8')).rejects.toThrow();
  });

  it('preserves mixed custom AI files while removing curated leftovers and creating missing harness files', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-mixed-adoption');

    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(targetDir, '.github', 'prompts'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, '.github', 'prompts', 'review.md'), '# custom prompt\n', 'utf8');
    await writeFile(path.join(targetDir, '.env.example'), 'EXISTING_ONLY=true\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      skipGit: true,
      detectPorts: false
    });

    expect(result.cleanup.status).toBe('applied');
    expect(result.cleanup.removedPaths).toContain('.codex/scripts/sync-to-cognee.sh');
    expect(result.createdPaths).toEqual(
      expect.arrayContaining(['.codex/README.md', 'AGENTS.md'])
    );
    expect(result.skippedPaths).toEqual(expect.arrayContaining(['.env.example']));
    expect(await readFile(path.join(targetDir, '.github', 'prompts', 'review.md'), 'utf8')).toBe('# custom prompt\n');
    await expect(readFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), 'utf8')).rejects.toThrow();
  });

  it('reports prompt-required in mixed repos while still removing safe curated leftovers', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-mixed-blocked-adoption');

    await mkdir(path.join(targetDir, '.claude', 'commands'), { recursive: true });
    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(targetDir, 'docs'), { recursive: true });
    await writeFile(path.join(targetDir, '.claude', 'commands', 'review.md'), '# legacy review\n', 'utf8');
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, 'docs', 'ai-notes.md'), '# keep me\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      assistant: 'codex',
      mode: 'existing',
      dryRun: false,
      force: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
      nonInteractive: true,
      skipGit: true,
      detectPorts: false
    });

    expect(result.cleanup.status).toBe('blocked');
    expect(result.cleanup.removedPaths).toContain('.codex/scripts/sync-to-cognee.sh');
    expect(result.cleanup.actions).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: '.claude', status: 'prompt-required' })])
    );
    expect(await readFile(path.join(targetDir, '.claude', 'commands', 'review.md'), 'utf8')).toBe('# legacy review\n');
    expect(await readFile(path.join(targetDir, 'docs', 'ai-notes.md'), 'utf8')).toBe('# keep me\n');
    await expect(readFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), 'utf8')).rejects.toThrow();
  });

  it('supports dry-run mode without writing files', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'dry-run-app',
      assistant: 'codex',
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
