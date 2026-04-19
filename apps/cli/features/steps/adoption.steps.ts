import { readFileSync } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'vitest';

import { runInit } from '../../../../src/commands/init.js';
import { getCleanupManifest } from '../../../../src/core/cleanup-manifests.js';
import type { InitResult } from '../../../../src/core/types.js';
import type { CliFeatureWorld } from '../support/world.js';
import { requireResult, requireTargetDir } from '../support/world.js';

const manifest = getCleanupManifest('legacy-ai-frameworks-v1');
const legacyRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-runtime-dir')!.path;
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

type ExistingRepoOptions = {
  mergeRootFiles?: boolean;
  cleanupManifestId?: string;
  nonInteractive?: boolean;
};

async function applyExistingRepo(world: CliFeatureWorld, options: ExistingRepoOptions = {}): Promise<InitResult> {
  const result = await runInit({
    cwd: world.workspace,
    projectArg: requireTargetDir(world),
    mode: 'existing',
    dryRun: false,
    force: false,
    cleanupManifestId: options.cleanupManifestId,
    mergeRootFiles: options.mergeRootFiles,
    nonInteractive: options.nonInteractive,
    skipGit: true,
    detectPorts: false
  });

  world.result = result;
  return result;
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

function assertCanonicalBakeAndAdoptCompatibility(world: CliFeatureWorld): void {
  const result = requireResult(world);
  const targetDir = requireTargetDir(world);
  const adoptPrompt = readFileSync(path.join(targetDir, '.pi', 'prompts', 'adopt.md'), 'utf8');
  const bakeSkill = readFileSync(path.join(targetDir, '.pi', 'skills', 'bake', 'SKILL.md'), 'utf8');

  expect(result.createdPaths).toEqual(expect.arrayContaining(['.pi/prompts/adopt.md', '.pi/skills/bake/SKILL.md']));
  expect(adoptPrompt).toContain('# Adopt an existing repository with pi-harness');
  expect(adoptPrompt).toContain('pi-harness --mode existing . --init-json');
  expect(bakeSkill).toContain('name: bake');
  expect(bakeSkill).toContain('# Bake');
  expect(bakeSkill).toContain('/skill:bake');
  expect(bakeSkill).toContain('pi-harness --mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --merge-root-files --init-json');
}

export async function givenExistingProjectDirectoryWithCustomRootFiles(world: CliFeatureWorld): Promise<void> {
  world.targetDir = path.join(world.workspace, 'existing-project');
  await mkdir(requireTargetDir(world), { recursive: true });
  await writeFile(path.join(requireTargetDir(world), '.gitignore'), 'dist/\n', 'utf8');
  await writeFile(
    path.join(requireTargetDir(world), '.env.example'),
    'EXISTING_ONLY=true\nAPP_ENV=production\nLLM_API_KEY=EXISTING_KEY\n# Custom comment\n',
    'utf8'
  );
  await writeFile(path.join(requireTargetDir(world), 'README.md'), '# Custom README\n', 'utf8');
}

export async function whenIApplyTheScaffoldInExistingProjectMode(world: CliFeatureWorld): Promise<void> {
  await applyExistingRepo(world);
}

export async function whenIApplyTheScaffoldInExistingProjectModeWithRootFileMergingEnabled(
  world: CliFeatureWorld
): Promise<void> {
  await applyExistingRepo(world, { mergeRootFiles: true });
}

export async function givenExistingProjectDirectoryWithCuratedLegacyAiFrameworkFiles(
  world: CliFeatureWorld
): Promise<void> {
  world.targetDir = path.join(world.workspace, 'existing-cleanup');
  await mkdir(path.join(requireTargetDir(world), '.codex', 'templates'), { recursive: true });
  await mkdir(path.join(requireTargetDir(world), '.codex', 'scripts'), { recursive: true });
  await writeFile(path.join(requireTargetDir(world), '.codex', 'templates', 'session-handoff.md'), '# old\n', 'utf8');
  await writeFile(path.join(requireTargetDir(world), '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');
}

export async function whenIApplyTheScaffoldInExistingProjectModeWithCuratedCleanupEnabled(
  world: CliFeatureWorld
): Promise<void> {
  await applyExistingRepo(world, { cleanupManifestId: 'legacy-ai-frameworks-v1' });
}

export async function givenExistingProjectDirectoryWithAmbiguousLegacyAiFrameworkFiles(
  world: CliFeatureWorld
): Promise<void> {
  world.targetDir = path.join(world.workspace, 'existing-ambiguous');
  await mkdir(path.join(requireTargetDir(world), legacyRuntimeDir), { recursive: true });
  await writeFile(path.join(requireTargetDir(world), legacyRuntimeDir, 'notes.md'), '# notes\n', 'utf8');
}

export async function whenIApplyTheScaffoldInExistingProjectModeWithCuratedCleanupEnabledAndNoPromptsAllowed(
  world: CliFeatureWorld
): Promise<void> {
  await applyExistingRepo(world, {
    cleanupManifestId: 'legacy-ai-frameworks-v1',
    nonInteractive: true
  });
}

export async function givenExistingProjectDirectoryWithoutCodexFiles(world: CliFeatureWorld): Promise<void> {
  world.targetDir = path.join(world.workspace, 'existing-pi-baseline');
  await mkdir(requireTargetDir(world), { recursive: true });
  await writeFile(path.join(requireTargetDir(world), 'README.md'), '# Existing Repo\n', 'utf8');
}

export async function whenIApplyTheScaffoldInExistingProjectModeForAssistant(
  world: CliFeatureWorld,
  ..._legacyStepArgs: unknown[]
): Promise<void> {
  await applyExistingRepo(world);
}

export function thenMissingAiWorkflowFilesAreCreated(world: CliFeatureWorld): void {
  const result = requireResult(world);

  expect(result.createdPaths).toEqual(
    expect.arrayContaining([
      'AGENTS.md',
      '.pi/settings.json',
      '.pi/prompts/adopt.md',
      '.pi/skills/bake/SKILL.md',
      'scripts/bootstrap-worktree.sh',
      'scripts/cognee-brief.sh'
    ])
  );

  assertCanonicalBakeAndAdoptCompatibility(world);
  assertTldrScaffoldContract(world);
}

export async function thenPreExistingScaffoldFilesAreLeftUnchanged(world: CliFeatureWorld): Promise<void> {
  const result = requireResult(world);

  expect(result.skippedPaths).toEqual(expect.arrayContaining(['README.md', '.gitignore', '.env.example']));
  expect(await readFile(path.join(requireTargetDir(world), 'README.md'), 'utf8')).toBe('# Custom README\n');
  expect(await readFile(path.join(requireTargetDir(world), '.gitignore'), 'utf8')).toBe('dist/\n');
  expect(await readFile(path.join(requireTargetDir(world), '.env.example'), 'utf8')).toBe(
    'EXISTING_ONLY=true\nAPP_ENV=production\nLLM_API_KEY=EXISTING_KEY\n# Custom comment\n'
  );
}

export async function thenScaffoldEntriesAreAppendedToRootFilesWithoutRemovingCustomContent(
  world: CliFeatureWorld
): Promise<void> {
  const result = requireResult(world);
  const gitignore = await readFile(path.join(requireTargetDir(world), '.gitignore'), 'utf8');
  const envExample = await readFile(path.join(requireTargetDir(world), '.env.example'), 'utf8');
  const countEnvKey = (key: string) => envExample.split('\n').filter((line) => line.startsWith(`${key}=`)).length;

  expect(result.createdPaths).toEqual(expect.arrayContaining(['.gitignore', '.env.example']));
  expect(gitignore).toContain('dist/');
  expect(gitignore).toContain('.kamal/secrets');
  expect(envExample).toContain('EXISTING_ONLY=true');
  expect(envExample).toContain('# Custom comment');
  expect(envExample).toContain('# AI workflow scaffold');
  expect(envExample).toContain('APP_ENV=production');
  expect(envExample).not.toContain('APP_ENV=development');
  expect(countEnvKey('APP_ENV')).toBe(1);
  expect(envExample).toContain('LLM_API_KEY=EXISTING_KEY');
  expect(envExample).not.toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
  expect(countEnvKey('LLM_API_KEY')).toBe(1);
  expect(envExample).toContain('GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN_HERE');
  expect(countEnvKey('GITHUB_PERSONAL_ACCESS_TOKEN')).toBe(1);
  expect(countEnvKey('APP_PORT')).toBe(1);
  expect(countEnvKey('APP_SECRET')).toBe(1);
  expect(countEnvKey('DATABASE_URL')).toBe(1);
  expect(countEnvKey('COGNEE_URL')).toBe(1);
}

export async function thenCuratedLegacyFilesAreRemovedBeforeNewScaffoldFilesAreCreated(
  world: CliFeatureWorld
): Promise<void> {
  const result = requireResult(world);

  expect(result.cleanup.status).toBe('blocked');
  expect(result.cleanup.removedPaths).toEqual(
    expect.arrayContaining(['.codex/templates/session-handoff.md', '.codex/scripts/sync-to-cognee.sh'])
  );
  expect(result.cleanup.summary.promptRequired).toBeGreaterThan(0);
  expect(result.cleanup.actions).toEqual(
    expect.arrayContaining([expect.objectContaining({ path: '.codex', status: 'prompt-required' })])
  );
  expect(result.createdPaths).toEqual(expect.arrayContaining(['AGENTS.md', '.pi/settings.json']));

  assertCanonicalBakeAndAdoptCompatibility(world);
}

export function thenAmbiguousCleanupEntriesAreReportedForConfirmation(world: CliFeatureWorld): void {
  const result = requireResult(world);

  expect(result.cleanup.status).toBe('blocked');
  expect(result.cleanup.summary.promptRequired).toBeGreaterThan(0);
  expect(result.cleanup.actions).toEqual(
    expect.arrayContaining([expect.objectContaining({ path: legacyRuntimeDir, status: 'prompt-required' })])
  );
}

export async function thenAmbiguousFilesAreLeftUnchanged(world: CliFeatureWorld): Promise<void> {
  const content = await readFile(path.join(requireTargetDir(world), legacyRuntimeDir, 'notes.md'), 'utf8');
  expect(content).toBe('# notes\n');
}

export function thenCodexCompatibilityFilesAreCreated(world: CliFeatureWorld): void {
  const result = requireResult(world);

  expect(result.createdPaths).toEqual(
    expect.arrayContaining(['AGENTS.md', '.pi/settings.json', '.pi/prompts/serve.md', 'scripts/bootstrap-worktree.sh'])
  );

  assertCanonicalBakeAndAdoptCompatibility(world);
}

export async function thenNoOpenCodeCompatibilityFilesAreCreated(world: CliFeatureWorld): Promise<void> {
  await expect(access(path.join(requireTargetDir(world), '.opencode', 'worktree.jsonc'))).rejects.toThrow();
  await expect(access(path.join(requireTargetDir(world), '.rules', 'patterns', 'omo-agent-contract.md'))).rejects.toThrow();
}
