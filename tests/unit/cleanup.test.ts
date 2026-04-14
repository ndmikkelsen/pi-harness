import { access, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
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
const legacyBroadCogneeSync = manifest.entries.find((entry) => entry.id === 'legacy-broad-cognee-sync')!.path;
const legacyPlanningSyncBackend = manifest.entries.find((entry) => entry.id === 'legacy-planning-sync-backend')!.path;
const legacyPlanningSyncWrapper = manifest.entries.find((entry) => entry.id === 'legacy-planning-sync-wrapper')!.path;
const legacyRepoLocalBakePrompt = manifest.entries.find((entry) => entry.id === 'legacy-repo-local-bake-prompt')!.path;
const legacyRepoLocalBakeScript = manifest.entries.find((entry) => entry.id === 'legacy-repo-local-bake-script')!.path;
const legacyHelperScout = manifest.entries.find((entry) => entry.id === 'legacy-helper-scout')!.path;
const legacyHelperPlanner = manifest.entries.find((entry) => entry.id === 'legacy-helper-planner')!.path;
const legacyHelperWorker = manifest.entries.find((entry) => entry.id === 'legacy-helper-worker')!.path;
const legacyHelperResearcher = manifest.entries.find((entry) => entry.id === 'legacy-helper-researcher')!.path;
const legacyHelperContextBuilder = manifest.entries.find((entry) => entry.id === 'legacy-helper-context-builder')!.path;

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
        expect.objectContaining({ path: legacyBroadCogneeSync, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyPlanningSyncBackend, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyPlanningSyncWrapper, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyRepoLocalBakePrompt, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyRepoLocalBakeScript, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyHelperScout, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyHelperPlanner, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyHelperWorker, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyHelperResearcher, disposition: 'safe-delete' }),
        expect.objectContaining({ path: legacyHelperContextBuilder, disposition: 'safe-delete' })
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

  it('deletes stale repo-local bake artifacts during non-interactive cleanup', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.pi', 'prompts'), { recursive: true });
    await mkdir(path.join(targetDir, 'scripts'), { recursive: true });
    await writeFile(path.join(targetDir, legacyRepoLocalBakePrompt), '# stale bake prompt\n', 'utf8');
    await writeFile(path.join(targetDir, legacyRepoLocalBakeScript), '#!/usr/bin/env bash\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      nonInteractive: true
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toEqual(
      expect.arrayContaining([legacyRepoLocalBakePrompt, legacyRepoLocalBakeScript])
    );
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyRepoLocalBakePrompt, status: 'deleted' }),
        expect.objectContaining({ path: legacyRepoLocalBakeScript, status: 'deleted' })
      ])
    );
    await expect(access(path.join(targetDir, legacyRepoLocalBakePrompt))).rejects.toThrow();
    await expect(access(path.join(targetDir, legacyRepoLocalBakeScript))).rejects.toThrow();
  });

  it('deletes stale helper subagent files during non-interactive cleanup', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.pi', 'agents'), { recursive: true });
    for (const helperPath of [legacyHelperScout, legacyHelperPlanner, legacyHelperWorker, legacyHelperResearcher, legacyHelperContextBuilder]) {
      await writeFile(path.join(targetDir, helperPath), '# stale helper\n', 'utf8');
    }

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      nonInteractive: true
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toEqual(
      expect.arrayContaining([legacyHelperScout, legacyHelperPlanner, legacyHelperWorker, legacyHelperResearcher, legacyHelperContextBuilder])
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



  it('auto-confirms prompt-before-delete entries when cleanupConfirmAll is enabled', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.codex', 'templates'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'templates', 'session-handoff.md'), '# old\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      cleanupConfirmAll: true,
    });

    expect(result.status).toBe('applied');
    expect(result.summary.promptRequired).toBe(0);
    expect(result.removedPaths).toEqual(expect.arrayContaining(['.codex']));
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.codex', status: 'deleted' }),
        expect.objectContaining({ path: '.codex/templates/session-handoff.md', status: 'missing' }),
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
