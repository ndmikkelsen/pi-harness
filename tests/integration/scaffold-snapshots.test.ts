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
    'CLAUDE.md': await readFile(path.join(rootDir, 'CLAUDE.md'), 'utf8'),
    '.gitignore': await readFile(path.join(rootDir, '.gitignore'), 'utf8')
  };

  if (includeCodex) {
    snapshot['.codex/README.md'] = await readFile(path.join(rootDir, '.codex', 'README.md'), 'utf8');
    snapshot['AGENTS.md'] = await readFile(path.join(rootDir, 'AGENTS.md'), 'utf8');
  }

  return snapshot;
}

describe('scaffold snapshots', () => {
  it('matches the Claude scaffold snapshot', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-snapshot-'));

    await runInit({
      cwd: workspace,
      projectArg: 'snapshot-claude',
      assistant: 'claude',
      mode: 'auto',
      dryRun: false,
      force: false,
      skipGit: true,
      detectPorts: false
    });

    const result = await snapshotForProject(path.join(workspace, 'snapshot-claude'), false);
    const script = await readFile(path.join(workspace, 'snapshot-claude', '.claude', 'scripts', 'bd'), 'utf8');
    const envrc = await readFile(path.join(workspace, 'snapshot-claude', '.envrc'), 'utf8');
    const beadsGuide = await readFile(path.join(workspace, 'snapshot-claude', '.rules', 'patterns', 'beads-integration.md'), 'utf8');

    expect(script).toContain('exec bd "$@"');
    expect(script).not.toContain('BEADS_DOLT_SERVER_');
    expect(script).not.toContain('10.10.20.138');
    expect(script).not.toContain('second_brain');
    expect(script).not.toContain('beads_SB');
    expect(script).not.toContain('{{');
    expect(script).not.toContain('}}');
    expect(envrc).not.toContain('metadata.json');
    expect(envrc).not.toContain('$_DOLT_');
    expect(result.files).not.toContain('.beads/config.yaml');
    expect(result['README.md']).toContain('Run `bd init` once in the repository before using Beads.');
    expect(beadsGuide).toContain('Run `bd init` once per repository');
    expect(beadsGuide).toContain('`bd dolt set <key> <value>`');
    expect(beadsGuide).not.toContain('compute is reachable');
    expect(result).toMatchSnapshot();
  });

  it('matches the Codex scaffold snapshot', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-scaffolding-snapshot-'));

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
    expect(result).toMatchSnapshot();
  });
});
