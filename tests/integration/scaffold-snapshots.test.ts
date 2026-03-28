import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

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
  it('matches the Codex scaffold snapshot', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'scaiff-snapshot-'));

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

    expect(envrc).not.toContain('metadata.json');
    expect(envrc).not.toContain('$_DOLT_');
    expect(result.files).not.toContain('.beads/config.yaml');
    expect(result.files).not.toContain('.codex/scripts/sync-to-cognee.sh');
    expect(result.files).not.toContain('CONSTITUTION.md');
    expect(result.files).not.toContain('VISION.md');
    expect(result.files).not.toContain('STICKYNOTE.md');
    expect(result['README.md']).toContain('Run `bd init` once in the repository before using Beads.');
    expect(result['README.md']).toContain('Review AGENTS.md, .codex/README.md, and the guides in .rules/.');
    expect(result['.codex/README.md']).toContain('Use native `bd` as the Beads task-tracking interface after `bd init`');
    expect(result['.codex/README.md']).toContain('./.codex/scripts/sync-planning-to-cognee.sh');
    expect(result['.codex/README.md']).not.toContain('./.codex/scripts/sync-to-cognee.sh');
    expect(beadsGuide).toContain('Run `bd init` once per repository');
    expect(beadsGuide).toContain('Use native `bd` commands for Beads.');
    expect(result).toMatchSnapshot();
  });

  it('matches the OpenCode scaffold snapshot', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'scaiff-snapshot-'));

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
