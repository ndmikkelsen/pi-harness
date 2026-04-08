import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getCleanupManifest } from '../../src/core/cleanup-manifests.js';
import { runInit } from '../../src/commands/init.js';

const manifest = getCleanupManifest('legacy-ai-frameworks-v1');
const legacyRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-runtime-dir')!.path;
const requiredRuntimePaths = [
  'AGENTS.md',
  '.pi/settings.json',
  '.pi/SYSTEM.md',
  '.pi/agents/lead.md',
  '.pi/agents/explore.md',
  '.pi/agents/plan.md',
  '.pi/agents/build.md',
  '.pi/agents/review.md',
  '.pi/agents/plan-change.chain.md',
  '.pi/agents/ship-change.chain.md',
  '.pi/extensions/repo-workflows.ts',
  '.pi/extensions/role-workflow.ts',
  '.pi/prompts/adopt.md',
  '.pi/prompts/serve.md',
  '.pi/prompts/triage.md',
  '.pi/prompts/plan-change.md',
  '.pi/prompts/ship-change.md',
  '.pi/prompts/parallel-wave.md',
  '.pi/prompts/review-change.md',
  '.pi/prompts/feat-change.md',
  '.pi/skills/beads/SKILL.md',
  '.pi/skills/cognee/SKILL.md',
  '.pi/skills/red-green-refactor/SKILL.md',
  '.pi/skills/bake/SKILL.md',
  '.pi/skills/parallel-wave-design/SKILL.md',
  '.pi/skills/subagent-workflow/SKILL.md',
  'scripts/bootstrap-worktree.sh',
  'scripts/cognee-bridge.sh',
  'scripts/cognee-brief.sh',
  'scripts/sync-artifacts-to-cognee.sh',
  'scripts/serve.sh',
  'docker/Dockerfile.cognee',
  'config/deploy.cognee.yml'
];
const existingModeBaselinePaths = [
  'AGENTS.md',
  '.pi/settings.json',
  '.pi/agents/lead.md',
  '.pi/extensions/repo-workflows.ts',
  '.pi/extensions/role-workflow.ts',
  '.pi/prompts/adopt.md',
  '.pi/prompts/plan-change.md',
  '.pi/skills/bake/SKILL.md',
  '.pi/skills/subagent-workflow/SKILL.md',
  'scripts/bootstrap-worktree.sh',
  'scripts/sync-artifacts-to-cognee.sh'
];

describe('runInit', () => {
  it('creates the scaffold for a new project', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'sample-app',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'sample-app');
    const envExample = await readFile(path.join(projectDir, '.env.example'), 'utf8');
    const beadsConfig = await readFile(path.join(projectDir, '.beads', 'config.yaml'), 'utf8');

    expect(result.mode).toBe('new');
    expect(result.createdPaths).toContain('.gitignore');
    expect(result.createdPaths).toEqual(expect.arrayContaining(requiredRuntimePaths));
    expect(result.createdPaths).toContain('.beads/hooks/post-checkout');
    expect(result.createdPaths).toContain('STICKYNOTE.example.md');
    expect(result.createdPaths).not.toContain('.opencode/worktree.jsonc');
    expect(result.createdPaths).not.toContain('.planning/TRACEABILITY.md');
    expect(result.createdPaths).not.toContain('CONSTITUTION.md');
    expect(result.createdPaths).not.toContain('VISION.md');
    expect(result.createdPaths).not.toContain('STICKYNOTE.md');
    expect(envExample).toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
    expect(envExample).toContain('COGNEE_URL=https://sample-app-cognee.apps.compute.lan');
    expect(envExample).not.toContain('BEADS_DOLT_PASSWORD');
    expect(beadsConfig).toContain('backup:');
    expect(beadsConfig).toContain('enabled: false');
    expect(result.cleanup.enabled).toBe(false);
  });

  it('does not scaffold planning artifacts by default', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'planning-app',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'planning-app');
    const stickyExample = await readFile(path.join(projectDir, 'STICKYNOTE.example.md'), 'utf8');

    expect(stickyExample).toContain('# Session Handoff');
    expect(stickyExample).toContain('Keep `STICKYNOTE.md` untracked, and expect linked worktrees to point back to the main worktree copy.');
    expect(stickyExample).toContain('`/serve` will reuse `## Completed This Session` for the PR summary');
    expect(stickyExample).toContain('- Outcome ready to ship:');
    expect(stickyExample).toContain('- Checks still needed before serving:');
    await expect(readFile(path.join(projectDir, '.planning', 'REQUIREMENTS.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, '.planning', 'ROADMAP.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, '.planning', 'STATE.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, '.planning', 'TRACEABILITY.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, 'CONSTITUTION.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, 'VISION.md'), 'utf8')).rejects.toThrow();
    await expect(readFile(path.join(projectDir, 'STICKYNOTE.md'), 'utf8')).rejects.toThrow();
  });

  it('creates the Pi-native runtime baseline', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const result = await runInit({
      cwd: workspace,
      projectArg: 'pi-app',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'pi-app');
    const agentsGuide = await readFile(path.join(projectDir, 'AGENTS.md'), 'utf8');
    const systemPrompt = await readFile(path.join(projectDir, '.pi', 'SYSTEM.md'), 'utf8');
    const settings = await readFile(path.join(projectDir, '.pi', 'settings.json'), 'utf8');
    const workflowExtension = await readFile(path.join(projectDir, '.pi', 'extensions', 'repo-workflows.ts'), 'utf8');
    const roleWorkflowExtension = await readFile(path.join(projectDir, '.pi', 'extensions', 'role-workflow.ts'), 'utf8');
    const servePrompt = await readFile(path.join(projectDir, '.pi', 'prompts', 'serve.md'), 'utf8');
    const syncArtifactsScript = await readFile(path.join(projectDir, 'scripts', 'sync-artifacts-to-cognee.sh'), 'utf8');
    const featChangePrompt = await readFile(path.join(projectDir, '.pi', 'prompts', 'feat-change.md'), 'utf8');
    const bakeSkill = await readFile(path.join(projectDir, '.pi', 'skills', 'bake', 'SKILL.md'), 'utf8');

    expect(result.createdPaths).toEqual(expect.arrayContaining(requiredRuntimePaths));
    expect(agentsGuide).toContain('.pi/extensions/*');
    expect(agentsGuide).toContain('.pi/prompts/*');
    expect(agentsGuide).toContain('.pi/skills/*');
    expect(agentsGuide).toContain('./scripts/bootstrap-worktree.sh');
    expect(agentsGuide).toContain('./scripts/cognee-brief.sh');
    expect(agentsGuide).toContain('./scripts/serve.sh');
    expect(agentsGuide).toContain("Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to use `/serve` or `./scripts/serve.sh` when the lane is allowed to publish.");
    expect(systemPrompt).toContain('Use `AGENTS.md` as the primary project instruction file.');
    expect(systemPrompt).toContain('Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*`');
    expect(systemPrompt).toContain("Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as `/serve` intent when the current lane is allowed to publish.");
    expect(settings).toContain('npm:pi-subagents');
    expect(settings).toContain('.pi/extensions/repo-workflows.ts');
    expect(workflowExtension).toContain("registerCommand('bootstrap-worktree'");
    expect(workflowExtension).toContain("registerCommand('cognee-brief'");
    expect(workflowExtension).toContain('scripts/bootstrap-worktree.sh');
    expect(workflowExtension).toContain('scripts/cognee-brief.sh');
    expect(roleWorkflowExtension).toContain("registerShortcut('ctrl+.'");
    expect(roleWorkflowExtension).toContain("registerShortcut('ctrl+,'");
    expect(roleWorkflowExtension).toContain("registerCommand('role'");
    expect(roleWorkflowExtension).toContain('ROLE_ALIASES');
    expect(servePrompt).toContain('scripts/serve.sh');
    expect(servePrompt).toContain('./scripts/serve.sh --commit-message "<message>"');
    expect(servePrompt).toContain('Keep `/serve` prompt-native; do not shadow it with a project-local extension command.');
    expect(servePrompt).toContain("let's serve the dish");
    expect(syncArtifactsScript).toContain('context.md');
    expect(syncArtifactsScript).toContain('progress.md');
    expect(featChangePrompt).toContain('project-local `lead` role');
    expect(featChangePrompt).toContain('plan-change');
    expect(featChangePrompt).toContain('explicit RED command');
    expect(bakeSkill).toContain('.pi/settings.json');
    expect(bakeSkill).toContain('.pi/extensions/role-workflow.ts');
    expect(bakeSkill).toContain('.pi/agents/*.md');
    expect(bakeSkill).toContain('.pi/agents/*.chain.md');
    expect(bakeSkill).toContain('.pi/extensions/repo-workflows.ts');
    expect(bakeSkill).toContain('.pi/prompts/serve.md');
    const cogneeSkill = await readFile(path.join(projectDir, '.pi', 'skills', 'cognee', 'SKILL.md'), 'utf8');
    const redGreenRefactorSkill = await readFile(path.join(projectDir, '.pi', 'skills', 'red-green-refactor', 'SKILL.md'), 'utf8');
    expect(cogneeSkill).toContain('./scripts/cognee-brief.sh');
    expect(redGreenRefactorSkill).toContain('pnpm test:bdd');
  });

  it('configures the Cognee deploy template for single-tenant pgvector startup', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'cognee-app',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'cognee-app');
    const deployConfig = await readFile(path.join(projectDir, 'config', 'deploy.cognee.yml'), 'utf8');
    const dockerfile = await readFile(path.join(projectDir, 'docker', 'Dockerfile.cognee'), 'utf8');

    expect(deployConfig).toContain('REQUIRE_AUTHENTICATION: "false"');
    expect(deployConfig).toContain('ENABLE_BACKEND_ACCESS_CONTROL: "false"');
    expect(deployConfig).toContain('LLM_MODEL: gpt-4o-mini');
    expect(deployConfig).toContain('VECTOR_DATASET_DATABASE_HANDLER: pgvector');
    expect(deployConfig).toContain('response_timeout: 300');
    expect(deployConfig).toContain('path: /health');
    expect(deployConfig).toContain('dockerfile: docker/Dockerfile.cognee');
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
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'bootstrap-app');
    const bootstrapScript = await readFile(path.join(projectDir, 'scripts', 'bootstrap-worktree.sh'), 'utf8');
    await expect(readFile(path.join(projectDir, '.opencode', 'worktree.jsonc'), 'utf8')).rejects.toThrow();

    expect(bootstrapScript).toContain('.env');
    expect(bootstrapScript).toContain('.kamal/secrets');
    expect(bootstrapScript).toContain('direnv allow');
    expect(bootstrapScript).toContain('bd ready --json');
    expect(bootstrapScript).toContain('AGENTS.md');
  });

  it('scaffolds Pi-native prompts and scripts for Cognee and serving', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));

    await runInit({
      cwd: workspace,
      projectArg: 'workflow-app',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const projectDir = path.join(workspace, 'workflow-app');
    const agentsGuide = await readFile(path.join(projectDir, 'AGENTS.md'), 'utf8');
    const adoptPrompt = await readFile(path.join(projectDir, '.pi', 'prompts', 'adopt.md'), 'utf8');
    const servePrompt = await readFile(path.join(projectDir, '.pi', 'prompts', 'serve.md'), 'utf8');
    const cogneeBriefScript = await readFile(path.join(projectDir, 'scripts', 'cognee-brief.sh'), 'utf8');

    expect(agentsGuide).toContain('./scripts/cognee-brief.sh "<query>"');
    expect(agentsGuide).toContain('./scripts/serve.sh');
    expect(agentsGuide).toContain("let's serve the dish");
    expect(adoptPrompt).toContain('pi-harness --mode existing . --init-json');
    expect(adoptPrompt).toContain('--cleanup-manifest legacy-ai-frameworks-v1 --init-json');
    expect(servePrompt).toContain('/serve');
    expect(servePrompt).toContain('scripts/serve.sh');
    expect(servePrompt).toContain('./scripts/serve.sh --commit-message "<message>"');
    expect(servePrompt).toContain('Keep `/serve` prompt-native; do not shadow it with a project-local extension command.');
    expect(servePrompt).toContain("let's serve the dish");
    expect(cogneeBriefScript).toContain('scripts/cognee-bridge.sh');
    expect(cogneeBriefScript).toContain('exec "$BRIDGE" brief "$@"');
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
    expect(result.createdPaths).toEqual(expect.arrayContaining(existingModeBaselinePaths));
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

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      mode: 'existing',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false,
      mergeRootFiles: true,
    });

    const gitignore = await readFile(gitignorePath, 'utf8');
    const envExample = await readFile(envExamplePath, 'utf8');

    expect(result.createdPaths).toEqual(expect.arrayContaining(existingModeBaselinePaths));
    expect(gitignore).toContain('dist/');
    expect(gitignore).toContain('.kamal/secrets');
    expect(envExample).toContain('EXISTING_ONLY=true');
    expect(envExample).toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
  });

  it('supports cleanup guidance for adopted repositories without removing ambiguous files by default', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-'));
    const targetDir = path.join(workspace, 'existing-with-legacy-runtime');

    await mkdir(path.join(targetDir, legacyRuntimeDir), { recursive: true });
    await writeFile(path.join(targetDir, legacyRuntimeDir, 'notes.md'), '# notes\n', 'utf8');

    const result = await runInit({
      cwd: workspace,
      projectArg: targetDir,
      mode: 'existing',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false,
      cleanupManifestId: 'legacy-ai-frameworks-v1',
    });

    expect(result.cleanup.enabled).toBe(true);
    expect(result.cleanup.status).toBe('blocked');
    expect(result.cleanup.summary.promptRequired).toBeGreaterThan(0);
    expect(result.cleanup.actions).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: legacyRuntimeDir, status: 'prompt-required' })])
    );
    expect(result.createdPaths).toEqual(expect.arrayContaining(['AGENTS.md', '.pi/settings.json']));
  });
});
