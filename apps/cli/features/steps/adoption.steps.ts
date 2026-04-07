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

export async function givenExistingProjectDirectoryWithCustomRootFiles(world: CliFeatureWorld): Promise<void> {
  world.targetDir = path.join(world.workspace, 'existing-project');
  await mkdir(requireTargetDir(world), { recursive: true });
  await writeFile(path.join(requireTargetDir(world), '.gitignore'), 'dist/\n', 'utf8');
  await writeFile(path.join(requireTargetDir(world), '.env.example'), 'EXISTING_ONLY=true\n', 'utf8');
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
}

export async function thenPreExistingScaffoldFilesAreLeftUnchanged(world: CliFeatureWorld): Promise<void> {
  const result = requireResult(world);

  expect(result.skippedPaths).toEqual(expect.arrayContaining(['README.md', '.gitignore', '.env.example']));
  expect(await readFile(path.join(requireTargetDir(world), 'README.md'), 'utf8')).toBe('# Custom README\n');
  expect(await readFile(path.join(requireTargetDir(world), '.gitignore'), 'utf8')).toBe('dist/\n');
  expect(await readFile(path.join(requireTargetDir(world), '.env.example'), 'utf8')).toBe('EXISTING_ONLY=true\n');
}

export async function thenScaffoldEntriesAreAppendedToRootFilesWithoutRemovingCustomContent(
  world: CliFeatureWorld
): Promise<void> {
  const result = requireResult(world);
  const gitignore = await readFile(path.join(requireTargetDir(world), '.gitignore'), 'utf8');
  const envExample = await readFile(path.join(requireTargetDir(world), '.env.example'), 'utf8');

  expect(result.createdPaths).toEqual(expect.arrayContaining(['.gitignore', '.env.example']));
  expect(gitignore).toContain('dist/');
  expect(gitignore).toContain('.kamal/secrets');
  expect(envExample).toContain('EXISTING_ONLY=true');
  expect(envExample).toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
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
    expect.arrayContaining(['AGENTS.md', '.pi/settings.json', '.pi/prompts/land.md', 'scripts/bootstrap-worktree.sh'])
  );
}

export async function thenNoOpenCodeCompatibilityFilesAreCreated(world: CliFeatureWorld): Promise<void> {
  await expect(access(path.join(requireTargetDir(world), '.opencode', 'worktree.jsonc'))).rejects.toThrow();
  await expect(access(path.join(requireTargetDir(world), '.rules', 'patterns', 'omo-agent-contract.md'))).rejects.toThrow();
}
