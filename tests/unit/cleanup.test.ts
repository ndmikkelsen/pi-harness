import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getCleanupManifest } from '../../src/core/cleanup-manifests.js';
import { runCleanup } from '../../src/core/cleanup.js';

const manifest = getCleanupManifest('legacy-ai-frameworks-v1');
const legacyRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-runtime-dir')!.path;
const legacyRuntimeGuide = manifest.entries.find((entry) => entry.id === 'legacy-runtime-guide')!.path;
const legacyTraceabilityDoc = manifest.entries.find((entry) => entry.id === 'legacy-planning-traceability')?.path;

describe('cleanup manifests', () => {
  it('exposes the curated legacy cleanup manifest', () => {
    const manifest = getCleanupManifest('legacy-ai-frameworks-v1');

    expect(manifest.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyRuntimeGuide, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyRuntimeDir, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: legacyTraceabilityDoc, disposition: 'prompt-before-delete' }),
        expect.objectContaining({ path: '.codex/scripts/sync-to-cognee.sh', disposition: 'safe-delete' })
      ])
    );
  });
});

describe('runCleanup', () => {
  it('reports prompt-required for ambiguous curated entries in non-interactive mode', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cleanup-'));
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
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cleanup-'));
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
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cleanup-'));
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

  it('deletes the deprecated traceability placeholder only when explicitly confirmed', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cleanup-'));
    await mkdir(path.join(targetDir, '.planning'), { recursive: true });
    await writeFile(path.join(targetDir, '.planning', 'TRACEABILITY.md'), '# traceability\n', 'utf8');

    const result = await runCleanup({
      targetDir,
      manifestId: 'legacy-ai-frameworks-v1',
      dryRun: false,
      confirmCleanup: async (entry) => entry.path === '.planning/TRACEABILITY.md'
    });

    expect(result.status).toBe('applied');
    expect(result.removedPaths).toContain('.planning/TRACEABILITY.md');
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '.planning/TRACEABILITY.md', status: 'deleted' })
      ])
    );
  });

  it('plans safe deletions during dry-run without touching disk', async () => {
    const targetDir = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-cleanup-'));
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
