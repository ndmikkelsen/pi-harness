import { access } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'vitest';

import { formatInitReport, runInit } from '../../../../src/commands/init.js';
import type { CliFeatureWorld } from '../support/world.js';
import { readTargetFile, requireResult, requireTargetDir } from '../support/world.js';

type NewProjectOptions = {
  projectName: string;
  dryRun?: boolean;
  [key: string]: unknown;
};

export async function givenEmptyTargetDirectory(world: CliFeatureWorld): Promise<void> {
  expect(world.workspace).toBeTruthy();
}

export async function whenIInitializeNewProject(world: CliFeatureWorld, options: NewProjectOptions): Promise<void> {
  world.result = await runInit({
    cwd: world.workspace,
    projectArg: options.projectName,
    mode: 'auto',
    dryRun: options.dryRun ?? false,
    force: false,
    skipGit: true,
    detectPorts: false
  });
  world.targetDir = path.join(world.workspace, options.projectName);
  world.report = formatInitReport(requireResult(world));
}

export function thenTheCliCreatesTheAiWorkflowScaffoldFiles(world: CliFeatureWorld): void {
  const result = requireResult(world);

  expect(result.mode).toBe('new');
  expect(result.createdPaths).toEqual(
    expect.arrayContaining([
      'AGENTS.md',
      '.pi/settings.json',
      '.pi/SYSTEM.md',
      '.pi/extensions/repo-workflows.ts',
      '.pi/prompts/adopt.md',
      '.pi/prompts/land.md',
      '.pi/skills/bake/SKILL.md',
      'scripts/bootstrap-worktree.sh',
      'scripts/cognee-brief.sh',
      'scripts/land.sh',
      'docker/Dockerfile.cognee',
      'STICKYNOTE.example.md'
    ])
  );
}

export function thenTheCliReportsCreatedFilesInItsSummary(world: CliFeatureWorld): void {
  expect(world.report).toContain('Created files:');
  expect(world.report).toContain('AGENTS.md');
  expect(world.report).toContain('.pi/settings.json');
}

export function thenTheCliReportsPlannedChanges(world: CliFeatureWorld): void {
  const result = requireResult(world);

  expect(result.createdPaths.length).toBeGreaterThan(0);
  expect(world.report).toContain(`Scaffolded ${result.appName} (${result.mode})`);
}

export async function thenNoFilesAreWrittenToDisk(world: CliFeatureWorld): Promise<void> {
  await expect(access(requireTargetDir(world))).rejects.toThrow();
}

export async function thenTheCliCreatesCodexCompatibilityFiles(world: CliFeatureWorld): Promise<void> {
  const result = requireResult(world);

  expect(result.createdPaths).toEqual(
    expect.arrayContaining([
      'AGENTS.md',
      '.pi/settings.json',
      '.pi/extensions/repo-workflows.ts',
      '.pi/prompts/land.md',
      '.pi/skills/bake/SKILL.md',
      'scripts/bootstrap-worktree.sh',
      'scripts/cognee-brief.sh',
      'scripts/land.sh',
      'docker/Dockerfile.cognee'
    ])
  );
}

export async function thenTheCodexRuntimeFilesAreAvailable(world: CliFeatureWorld): Promise<void> {
  const agentsGuide = await readTargetFile(world, 'AGENTS.md');
  const bootstrapScript = await readTargetFile(world, 'scripts/bootstrap-worktree.sh');
  const workflowExtension = await readTargetFile(world, '.pi/extensions/repo-workflows.ts');

  expect(agentsGuide).toContain('.pi/extensions/*');
  expect(agentsGuide).toContain('.pi/prompts/*');
  expect(agentsGuide).toContain('.pi/skills/*');
  expect(agentsGuide).toContain('./scripts/bootstrap-worktree.sh');
  expect(bootstrapScript).toContain('bd ready --json');
  expect(bootstrapScript).toContain('AGENTS.md');
  expect(workflowExtension).toContain("registerCommand('bootstrap-worktree'");
  expect(workflowExtension).toContain("registerCommand('cognee-brief'");
  expect(workflowExtension).toContain("registerCommand('land'");
  expect(workflowExtension).toContain('scripts/bootstrap-worktree.sh');
  expect(workflowExtension).toContain('scripts/cognee-brief.sh');
  expect(workflowExtension).toContain('scripts/land.sh');
}

export async function thenNoOpenCodeCompatibilityFilesAreCreated(world: CliFeatureWorld): Promise<void> {
  await expect(access(path.join(requireTargetDir(world), '.opencode', 'worktree.jsonc'))).rejects.toThrow();
  await expect(access(path.join(requireTargetDir(world), '.rules', 'patterns', 'omo-agent-contract.md'))).rejects.toThrow();
}
