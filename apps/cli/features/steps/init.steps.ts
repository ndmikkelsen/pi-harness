import { access } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'vitest';

import { formatInitReport, runInit } from '../../../../src/commands/init.js';
import type { AssistantTarget } from '../../../../src/core/types.js';
import type { CliFeatureWorld } from '../support/world.js';
import { readTargetFile, requireResult, requireTargetDir } from '../support/world.js';

export async function givenEmptyTargetDirectory(world: CliFeatureWorld): Promise<void> {
  expect(world.workspace).toBeTruthy();
}

export async function whenIInitializeNewProject(
  world: CliFeatureWorld,
  options: {
    projectName: string;
    assistant: AssistantTarget;
    dryRun?: boolean;
  }
): Promise<void> {
  world.result = await runInit({
    cwd: world.workspace,
    projectArg: options.projectName,
    assistant: options.assistant,
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
    expect.arrayContaining(['.codex/README.md', '.rules/patterns/operator-workflow.md', 'STICKYNOTE.example.md'])
  );
}

export function thenTheCliReportsCreatedFilesInItsSummary(world: CliFeatureWorld): void {
  expect(world.report).toContain('Created files:');
  expect(world.report).toContain('scripts/hooks/post-checkout');
}

export function thenTheCliReportsPlannedChanges(world: CliFeatureWorld): void {
  const result = requireResult(world);

  expect(result.createdPaths.length).toBeGreaterThan(0);
  expect(world.report).toContain(`Scaffolded ${result.appName}`);
}

export async function thenNoFilesAreWrittenToDisk(world: CliFeatureWorld): Promise<void> {
  await expect(access(requireTargetDir(world))).rejects.toThrow();
}

export async function thenTheCliCreatesCodexCompatibilityFiles(world: CliFeatureWorld): Promise<void> {
  const result = requireResult(world);

  expect(result.createdPaths).toEqual(
    expect.arrayContaining(['.codex/README.md', '.codex/workflows/autonomous-execution.md', 'AGENTS.md'])
  );

  const codexReadme = await readTargetFile(world, '.codex/README.md');
  expect(codexReadme).toContain('Compatibility Layer');
}

export async function thenTheCodexRuntimeFilesAreAvailable(world: CliFeatureWorld): Promise<void> {
  const agentsGuide = await readTargetFile(world, 'AGENTS.md');
  const autonomousWorkflow = await readTargetFile(world, '.codex/workflows/autonomous-execution.md');

  expect(agentsGuide).toContain('.rules/patterns/operator-workflow.md');
  expect(autonomousWorkflow).toContain('bd ready --json');
  expect(agentsGuide).not.toContain('.rules/patterns/omo-agent-contract.md');
}

export async function thenNoOpenCodeCompatibilityFilesAreCreated(world: CliFeatureWorld): Promise<void> {
  await expect(access(path.join(requireTargetDir(world), '.opencode', 'worktree.jsonc'))).rejects.toThrow();
  await expect(access(path.join(requireTargetDir(world), '.rules', 'patterns', 'omo-agent-contract.md'))).rejects.toThrow();
}
