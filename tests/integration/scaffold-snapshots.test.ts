import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { runInit } from '../../src/commands/init.js';

async function collectFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(rootDir, absolutePath)));
      continue;
    }
    files.push(path.relative(rootDir, absolutePath));
  }

  return files.sort();
}

async function snapshotForProject(rootDir: string, includeCodex: boolean) {
  const snapshot: Record<string, string | string[]> = {
    files: await collectFiles(rootDir),
    'README.md': await readFile(path.join(rootDir, 'README.md'), 'utf8'),
    '.codex/README.md': await readFile(path.join(rootDir, '.codex', 'README.md'), 'utf8'),
    'STICKYNOTE.example.md': await readFile(path.join(rootDir, 'STICKYNOTE.example.md'), 'utf8'),
    '.gitignore': await readFile(path.join(rootDir, '.gitignore'), 'utf8')
  };

  if (includeCodex) {
    snapshot['AGENTS.md'] = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8');
  }

  return snapshot;
}

describe('scaffold snapshots', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30T00:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('matches the Codex scaffold snapshot', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-snapshot-'));

    await runInit({
      cwd: workspace,
      projectArg: 'snapshot-codex',
      assistant: 'codex',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const result = await snapshotForProject(path.join(workspace, 'snapshot-codex'), true);
    const envrc = await readFile(path.join(workspace, 'snapshot-codex', '.envrc'), 'utf8');
    const beadsGuide = await readFile(path.join(workspace, 'snapshot-codex', '.rules', 'patterns', 'beads-integration.md'), 'utf8');
    const autonomousWorkflow = await readFile(path.join(workspace, 'snapshot-codex', '.codex', 'workflows', 'autonomous-execution.md'), 'utf8');

    expect(envrc).not.toContain('metadata.json');
    expect(envrc).not.toContain('$_DOLT_');
    expect(result.files).toContain('.beads/config.yaml');
    expect(result.files).not.toContain('.codex/scripts/sync-to-cognee.sh');
    expect(result.files).not.toContain('CONSTITUTION.md');
    expect(result.files).not.toContain('VISION.md');
    expect(result.files).not.toContain('STICKYNOTE.md');
    expect(result['README.md']).toContain('Scaffolded with `ai-harness` v0.1.0');
    expect(result['README.md']).toContain('This scaffold assumes `ai-harness` is used locally to set up and refresh repos');
    expect(result['README.md']).toContain('there is no separate `scaiff` binary or package alias');
    expect(result['README.md']).toContain('Run `bd init` once in the repository before using Beads.');
    expect(result['README.md']).toContain('Review .rules/patterns/operator-workflow.md, AGENTS.md, and .codex/README.md.');
    expect(result['.codex/README.md']).toContain('Use native `bd` as the Beads task-tracking interface after `bd init`');
    expect(result['.codex/README.md']).toContain('.rules/patterns/omo-agent-contract.md');
    expect(result['.codex/README.md']).toContain('./.codex/scripts/sync-planning-to-cognee.sh');
    expect(result['.codex/README.md']).toContain('.codex/workflows/autonomous-execution.md');
    expect(result['.codex/README.md']).toContain('pnpm test:bdd');
    expect(result['.codex/README.md']).not.toContain('./.codex/scripts/sync-to-cognee.sh');
    expect(beadsGuide).toContain('Run `bd init` once per repository');
    expect(beadsGuide).toContain('Use native `bd` commands for Beads.');
    expect(autonomousWorkflow).toContain('BEADS_AVAILABLE');
    expect(autonomousWorkflow).toContain('.rules/patterns/omo-agent-contract.md');
    expect(autonomousWorkflow).toContain('bd ready --json');
    expect(autonomousWorkflow).toContain('/gsd-next');
    expect(autonomousWorkflow).toContain('gaps_found');
    expect(result).toMatchSnapshot();
  });

  it('matches the OpenCode scaffold snapshot', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-snapshot-'));

    await runInit({
      cwd: workspace,
      projectArg: 'snapshot-opencode',
      assistant: 'opencode',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const result = await snapshotForProject(path.join(workspace, 'snapshot-opencode'), true);
    expect(result).toMatchSnapshot();
  });
});
