import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { getCleanupManifest } from '../../src/core/cleanup-manifests.js';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const manifest = getCleanupManifest('legacy-ai-frameworks-v1');
const legacyRuntimeDir = manifest.entries.find((entry) => entry.id === 'legacy-runtime-dir')!.path;

describe('CLI init', () => {
  it('preserves existing scaffold files by default in existing mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'scaiff-cli-init-'));
    const targetDir = path.join(workspace, 'existing-preserve');
    const gitignorePath = path.join(targetDir, '.gitignore');
    const envExamplePath = path.join(targetDir, '.env.example');

    await mkdir(targetDir, { recursive: true });
    await writeFile(gitignorePath, 'dist/\n', 'utf8');
    await writeFile(envExamplePath, 'EXISTING_ONLY=true\n', 'utf8');

    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', '--mode', 'existing', '--assistant', 'codex', '--init-json', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as { createdPaths: string[]; skippedPaths: string[] };

    expect(payload.createdPaths).not.toContain('.gitignore');
    expect(payload.createdPaths).not.toContain('.env.example');
    expect(payload.skippedPaths).toContain('.gitignore');
    expect(payload.skippedPaths).toContain('.env.example');
    expect(await readFile(gitignorePath, 'utf8')).toBe('dist/\n');
    expect(await readFile(envExamplePath, 'utf8')).toBe('EXISTING_ONLY=true\n');
  });

  it('merges root files only when merge-root-files is set', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'scaiff-cli-init-'));
    const targetDir = path.join(workspace, 'existing-merge');
    const gitignorePath = path.join(targetDir, '.gitignore');
    const envExamplePath = path.join(targetDir, '.env.example');

    await mkdir(targetDir, { recursive: true });
    await writeFile(gitignorePath, 'dist/\n', 'utf8');
    await writeFile(envExamplePath, 'EXISTING_ONLY=true\n', 'utf8');

    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', '--mode', 'existing', '--assistant', 'codex', '--merge-root-files', '--init-json', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as { createdPaths: string[] };
    const gitignore = await readFile(gitignorePath, 'utf8');
    const envExample = await readFile(envExamplePath, 'utf8');

    expect(payload.createdPaths).toContain('.gitignore');
    expect(payload.createdPaths).toContain('.env.example');
    expect(gitignore).toContain('.kamal/secrets');
    expect(envExample).toContain('# AI workflow scaffold');
    expect(envExample).toContain('LLM_API_KEY=YOUR_OPENAI_API_KEY_HERE');
  });

  it('reports curated cleanup removals in init-json output', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'scaiff-cli-init-'));
    const targetDir = path.join(workspace, 'existing-cleanup');

    await mkdir(path.join(targetDir, '.codex', 'templates'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'templates', 'session-handoff.md'), '# old\n', 'utf8');

    const result = await execFile(
      process.execPath,
      [
        tsxCli,
        'src/cli.ts',
        '--mode',
        'existing',
        '--assistant',
        'codex',
        '--cleanup-manifest',
        'legacy-ai-frameworks-v1',
        '--init-json',
        targetDir
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as {
      cleanup: { status: string; removedPaths: string[]; summary: { deleted: number } };
    };

    expect(payload.cleanup.status).toBe('applied');
    expect(payload.cleanup.removedPaths).toContain('.codex/templates/session-handoff.md');
    expect(payload.cleanup.summary.deleted).toBeGreaterThan(0);
  });

  it('returns prompt-required cleanup actions in non-interactive mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'scaiff-cli-init-'));
    const targetDir = path.join(workspace, 'existing-ambiguous');

    await mkdir(path.join(targetDir, legacyRuntimeDir), { recursive: true });
    await writeFile(path.join(targetDir, legacyRuntimeDir, 'notes.md'), '# notes\n', 'utf8');

    let stdout = '';
    try {
      await execFile(
        process.execPath,
        [
          tsxCli,
          'src/cli.ts',
          '--mode',
          'existing',
          '--assistant',
          'codex',
          '--cleanup-manifest',
          'legacy-ai-frameworks-v1',
          '--non-interactive',
          '--init-json',
          targetDir
        ],
        {
          cwd: repoRoot,
          encoding: 'utf8'
        }
      );
    } catch (error) {
      stdout = (error as { stdout?: string }).stdout ?? '';
    }

    const payload = JSON.parse(stdout) as {
      cleanup: {
        status: string;
        actions: Array<{ path: string; status: string }>;
        summary: { promptRequired: number };
      };
    };

    expect(payload.cleanup.status).toBe('blocked');
    expect(payload.cleanup.summary.promptRequired).toBeGreaterThan(0);
    expect(payload.cleanup.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: legacyRuntimeDir, status: 'prompt-required' })
      ])
    );
  });
});
