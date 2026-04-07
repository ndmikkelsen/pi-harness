import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getCleanupManifest } from '../../src/core/cleanup-manifests.js';
import { runCleanup } from '../../src/core/cleanup.js';

const manifest = getCleanupManifest('legacy-ai-frameworks-v1');
const legacyRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-runtime-dir')!.path;
const legacyRuntimeGuide = manifest.entries.find((entry) => entry.id === 'legacy-runtime-guide')!.path;
const legacyPlanningDir = manifest.entries.find((entry) => entry.id === 'legacy-gsd-planning-workspace')!.path;
const legacySisyphusDir = manifest.entries.find((entry) => entry.id === 'legacy-sisyphus-archive')!.path;
const legacyGsdWorkflowRule = manifest.entries.find((entry) => entry.id === 'legacy-gsd-workflow-rule')!.path;
const legacyOmpRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-omp-runtime-dir')!.path;
const legacyCodexRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-codex-runtime-dir')!.path;
const legacyRulesRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-rules-runtime-dir')!.path;
const legacyOmoContract = manifest.entries.find((entry) => entry.id === 'legacy-omo-contract')!.path;
const legacyBroadCogneeSync = manifest.entries.find((entry) => entry.id === 'legacy-broad-cognee-sync')!.path;
const legacyPlanningSyncBackend = manifest.entries.find((entry) => entry.id === 'legacy-planning-sync-backend')!.path;
const legacyPlanningSyncWrapper = manifest.entries.find((entry) => entry.id === 'legacy-planning-sync-wrapper')!.path;

describe('cleanup manifests', () => {
  it('exposes the curated legacy cleanup manifest', () => {
    const manifest = getCleanupManifest('legacy-ai-frameworks-v1');

    expect(manifest.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyRuntimeGuide, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyRuntimeDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyPlanningDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacySisyphusDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyGsdWorkflowRule, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyOmpRuntimeDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyCodexRuntimeDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyRulesRuntimeDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyOmoContract, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyBroadCogneeSync, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyPlanningSyncBackend, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyPlanningSyncWrapper, disposition: 'safe-delete' })
      ])
    );
  });
});

describe('runCleanup', () => {
  it('reports prompt-required for ambiguous curated entries in non-interactive mode', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, legacyRuntimeDir), { recursive: true });
    await writeFile(path.join(targetDir, legacyRuntimeDir, 'custom-notes.md'), '# custom\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      nonInteractive: true
    });

    expect(result.status).toBe('blocked');
    expect(result.summary.promptRequired).toBeGreaterThan(0);
    expect(result.removedPaths).toEqual([]);
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyRuntimeDir, status: 'prompt-required' })
      ])
    );
  });

  it('deletes prompt-before-delete entries when explicitly confirmed', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.agents'), { recursive: true });
    await writeFile(path.join(targetDir, '.agents', 'reviewer.md'), '# reviewer\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      confirmCleanup: async (entry) => entry.path === '.agents'
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toContain('.agents');
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.agents', status: 'deleted' })
      ])
    );
  });

  it('deletes legacy Claude runtime entries only when explicitly confirmed', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.claude', 'commands'), { recursive: true });
    await writeFile(path.join(targetDir, '.claude', 'commands', 'review.md'), '# review\n', 'utf8');
    await writeFile(path.join(targetDir, 'CLAUDE.md'), '# Claude\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      confirmCleanup: async (entry) => entry.path === '.claude' || entry.path === 'CLAUDE.md'
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toEqual(expect.arrayContaining(['.claude', 'CLAUDE.md']));
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.claude', status: 'deleted' }),
        expect.objectContaining({ path: 'CLAUDE.md', status: 'deleted' })
      ])
    );
  });

  it('deletes the deprecated planning workspace only when explicitly confirmed', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, legacyPlanningDir), { recursive: true });
    await writeFile(path.join(targetDir, legacyPlanningDir, 'TRACEABILITY.md'), '# traceability\n', 'utf8');
    await writeFile(path.join(targetDir, legacyPlanningDir, 'PROJECT.md'), '# project\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      confirmCleanup: async (entry) => entry.path === legacyPlanningDir
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toContain(legacyPlanningDir);
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyPlanningDir, status: 'deleted' })
      ])
    );
  });

  it('deletes the deprecated .sisyphus archive only when explicitly confirmed', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, legacySisyphusDir, 'runs'), { recursive: true });
    await writeFile(path.join(targetDir, legacySisyphusDir, 'runs', '2024-01-01.log'), 'archived\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      confirmCleanup: async (entry) => entry.path === legacySisyphusDir
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toContain(legacySisyphusDir);
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacySisyphusDir, status: 'deleted' })
      ])
    );
  });

  it('deletes a legacy GSD workflow rule only when explicitly confirmed', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.rules', 'patterns'), { recursive: true });
    await writeFile(path.join(targetDir, '.rules', 'patterns', 'gsd-workflow.md'), '# gsd workflow\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      confirmCleanup: async (entry) => entry.path === '.rules/patterns/gsd-workflow.md'
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toContain('.rules/patterns/gsd-workflow.md');
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.rules/patterns/gsd-workflow.md', status: 'deleted' })
      ])
    );
  });

  it('deletes deprecated planning-sync scripts even when the parent legacy runtime directory still requires confirmation', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await writeFile(path.join(targetDir, legacyPlanningSyncBackend), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, legacyPlanningSyncWrapper), '#!/usr/bin/env bash\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      nonInteractive: true
    });

    expect(result.status).toBe('blocked');
    expect(result.summary.promptRequired).toBeGreaterThan(0);
    expect(result.removedPaths).toEqual(
      expect.arrayContaining([legacyPlanningSyncBackend, legacyPlanningSyncWrapper])
    );
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.codex', status: 'prompt-required' }),
        expect.objectContaining({ path: legacyPlanningSyncBackend, status: 'deleted' }),
        expect.objectContaining({ path: legacyPlanningSyncWrapper, status: 'deleted' })
      ])
    );
  });


  it('plans safe deletions during dry-run without touching disk', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.codex', 'templates'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'templates', 'session-handoff.md'), '# old\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: true,
      nonInteractive: true
    });

    expect(result.status).toBe('dry-run');
    expect(result.summary.planned).toBeGreaterThan(0);
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.codex/templates/session-handoff.md', status: 'planned' })
      ])
    );
  });
});
