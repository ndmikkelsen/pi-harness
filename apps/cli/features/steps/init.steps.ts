import { readFileSync } from 'node:fs';
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

const TLDR_CONTRACT_MARKERS = [
  'main answer first',
  'always include a section labeled `Summary`',
  'always include a section labeled `TLDR`',
  'Keep `TLDR` shorter than `Summary`',
  'final section at the very bottom of the response',
] as const;
const LEGACY_TOP_SUMMARY_HINT = /lead with a brief summary/i;

function normalizeTldrSource(source: string): string {
  return source.replace(/\\`/g, '`');
}

function markerIndex(source: string, marker: string): number {
  return normalizeTldrSource(source).indexOf(marker);
}

function expectOrderedMarkers(source: string): void {
  let previousIndex = -1;

  for (const marker of TLDR_CONTRACT_MARKERS) {
    const index = markerIndex(source, marker);

    expect(index, `expected TLDR contract marker: ${marker}`).toBeGreaterThan(-1);
    expect(index).toBeGreaterThan(previousIndex);
    previousIndex = index;
  }
}

function assertTldrScaffoldContract(world: CliFeatureWorld): void {
  const result = requireResult(world);
  const targetDir = requireTargetDir(world);
  const roleWorkflow = readFileSync(path.join(targetDir, '.pi', 'extensions', 'role-workflow.ts'), 'utf8');
  const repoWorkflows = readFileSync(path.join(targetDir, '.pi', 'extensions', 'repo-workflows.ts'), 'utf8');
  const systemPrompt = readFileSync(path.join(targetDir, '.pi', 'SYSTEM.md'), 'utf8');
  const roleBodyIndex = roleWorkflow.indexOf('${role.body}');

  expect(roleBodyIndex).toBeGreaterThan(-1);
  const appendedPrompt = roleWorkflow.slice(roleBodyIndex + '${role.body}'.length);

  expect(appendedPrompt).toContain('${TLDR_GUIDANCE}');
  expectOrderedMarkers(roleWorkflow);
  expect(roleWorkflow).not.toMatch(LEGACY_TOP_SUMMARY_HINT);
  expectOrderedMarkers(systemPrompt);
  expect(systemPrompt).not.toMatch(LEGACY_TOP_SUMMARY_HINT);
  expect(repoWorkflows).not.toMatch(/registerCommand\(['"]tldr['"]/i);
  expect(result.createdPaths).not.toContain('.pi/extensions/tldr.ts');
}

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
      '.pi/prompts/serve.md',
      '.pi/skills/bake/SKILL.md',
      'scripts/bootstrap-worktree.sh',
      'scripts/cognee-brief.sh',
      'scripts/serve.sh',
      'docker/Dockerfile.cognee',
      'STICKYNOTE.example.md'
    ])
  );

  assertTldrScaffoldContract(world);
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
      '.pi/prompts/serve.md',
      '.pi/skills/bake/SKILL.md',
      'scripts/bootstrap-worktree.sh',
      'scripts/cognee-brief.sh',
      'scripts/serve.sh',
      'docker/Dockerfile.cognee'
    ])
  );
}

export async function thenTheCodexRuntimeFilesAreAvailable(world: CliFeatureWorld): Promise<void> {
  const agentsGuide = await readTargetFile(world, 'AGENTS.md');
  const bootstrapScript = await readTargetFile(world, 'scripts/bootstrap-worktree.sh');
  const workflowExtension = await readTargetFile(world, '.pi/extensions/repo-workflows.ts');
  const servePrompt = await readTargetFile(world, '.pi/prompts/serve.md');

  expect(agentsGuide).toContain('.pi/extensions/*');
  expect(agentsGuide).toContain('.pi/prompts/*');
  expect(agentsGuide).toContain('.pi/skills/*');
  expect(agentsGuide).toContain('./scripts/bootstrap-worktree.sh');
  expect(agentsGuide).toContain('./scripts/serve.sh');
  expect(bootstrapScript).toContain('bd ready --json');
  expect(bootstrapScript).toContain('AGENTS.md');
  expect(workflowExtension).toContain("registerCommand('bootstrap-worktree'");
  expect(workflowExtension).toContain("registerCommand('cognee-brief'");
  expect(workflowExtension).not.toContain("registerCommand('serve'");
  expect(workflowExtension).toContain('scripts/bootstrap-worktree.sh');
  expect(workflowExtension).toContain('scripts/cognee-brief.sh');
  expect(servePrompt).toContain('/serve');
  expect(servePrompt).toContain('./scripts/serve.sh --commit-message "<message>"');
  expect(servePrompt).toContain('Keep `/serve` prompt-native; do not shadow it with a project-local extension command.');
}

export async function thenNoOpenCodeCompatibilityFilesAreCreated(world: CliFeatureWorld): Promise<void> {
  await expect(access(path.join(requireTargetDir(world), '.opencode', 'worktree.jsonc'))).rejects.toThrow();
  await expect(access(path.join(requireTargetDir(world), '.rules', 'patterns', 'omo-agent-contract.md'))).rejects.toThrow();
}
