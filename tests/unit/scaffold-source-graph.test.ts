import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ScaffoldContext } from '../../src/core/types.js';
import { buildManagedEntries } from '../../src/generators/index.js';

const scaffoldContext: ScaffoldContext = {
  appName: 'pi-harness',
  appSlug: 'pi-harness',
  appTitle: 'Pi Harness',
  appVar: 'PI_HARNESS',
  targetDir: '/tmp/pi-harness',
  mode: 'new',
  harnessVersion: '0.1.0',
  doltPort: 3021,
  cogneeDbPort: 5432,
  computeHost: '10.10.20.138',
  computeUser: 'compute',
  sshKeyPath: '~/.ssh/z3r0Layer-main',
  registryHost: 'harbor.compute.lan',
  generatedOn: '2026-04-07',
};

describe('scaffold source graph', () => {
  it('keeps buildManagedEntries wired to the Pi-native generators only', async () => {
    const indexSource = await readFile(path.join(process.cwd(), 'src', 'generators', 'index.ts'), 'utf8');

    expect(indexSource).toContain('buildRootEntries');
    expect(indexSource).toContain('buildPiEntries');
    expect(indexSource).toContain('buildConfigEntries');
    expect(indexSource).toContain('buildProjectDocEntries');
    expect(indexSource).not.toContain('buildCodexEntries');
    expect(indexSource).not.toContain('buildOmpEntries');
    expect(indexSource).not.toContain('buildRuleEntries');
    expect(indexSource).not.toContain('./codex.js');
    expect(indexSource).not.toContain('./omp.js');
    expect(indexSource).not.toContain('./rules.js');
  });

  it('emits only Pi-native managed paths', () => {
    const entries = buildManagedEntries(scaffoldContext);
    const paths = entries.map((entry) => entry.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        'AGENTS.md',
        '.pi/settings.json',
        '.config/deploy.yml',
        '.config/deploy.cognee.yml',
        '.docker/Dockerfile.cognee',
        'scripts/bootstrap-worktree.sh',
        'scripts/land.sh',
        'STICKYNOTE.example.md',
      ]),
    );
    expect(paths.some((candidate) => candidate.startsWith('.codex/'))).toBe(false);
    expect(paths.some((candidate) => candidate.startsWith('.omp/'))).toBe(false);
    expect(paths.some((candidate) => candidate.startsWith('.rules/'))).toBe(false);
  });

  it('keeps the maintained template roots aligned to the Pi-native scaffold', async () => {
    const templateRoot = path.join(process.cwd(), 'src', 'templates');
    const entries = (await readdir(templateRoot)).sort();

    expect(entries).toEqual(['.config', 'no-newline.txt', 'pi', 'project-docs', 'root', 'template-loader.txt']);
  });
});
