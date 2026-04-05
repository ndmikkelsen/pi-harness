import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
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
  it('prints local install guidance in the human-readable report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'human-output-app');

    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', '--assistant', 'codex', '--skip-git', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    expect(result.stdout).toContain('Scaffolded human-output-app (new, codex)');
    expect(result.stdout).toContain('Use `pi-harness` locally on your machine to scaffold repos. The documented setup path is a checkout plus `pnpm build` and `pnpm install:local`; there is no registry-published package.');
  });

  it('rejects the legacy OpenCode assistant target', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'legacy-opencode');

    await expect(
      execFile(process.execPath, [tsxCli, 'src/cli.ts', '--assistant', 'opencode', '--skip-git', targetDir], {
        cwd: repoRoot,
        encoding: 'utf8'
      })
    ).rejects.toMatchObject({
      stderr: expect.stringMatching(/OpenCode|opencode/)
    });
  });

  it('installs post-checkout hook support when pre-commit is available', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'hooked-app');
    const binDir = path.join(workspace, 'bin');
    const preCommitLog = path.join(workspace, 'pre-commit.log');

    await mkdir(binDir, { recursive: true });
    await writeFile(
      path.join(binDir, 'pre-commit'),
      `#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${preCommitLog}"
exit 0
`,
      'utf8'
    );
    await chmod(path.join(binDir, 'pre-commit'), 0o755);

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--assistant', 'codex', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`
      }
    });

    const preCommitCalls = await readFile(preCommitLog, 'utf8');
    const preCommitConfig = await readFile(path.join(targetDir, '.pre-commit-config.yaml'), 'utf8');
    const postCheckoutHook = path.join(targetDir, 'scripts', 'hooks', 'post-checkout');

    expect(result.stdout).toContain('Initialized a git repository on main.');
    expect(preCommitCalls).toContain('install');
    expect(preCommitCalls).toContain('install --hook-type post-checkout');
    expect(preCommitConfig).toContain('default_install_hook_types:');
    expect(preCommitConfig).toContain('- post-checkout');
    expect(preCommitConfig).toContain('entry: scripts/hooks/post-checkout');
    expect(preCommitConfig).toContain('stages: [post-checkout]');
    expect((await stat(postCheckoutHook)).mode & 0o111).toBeGreaterThan(0);
  });

  it('preserves existing scaffold files by default in existing mode', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
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
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
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
    expect(envExample).not.toContain('BEADS_DOLT_PASSWORD');
  });

  it('reports curated cleanup removals in init-json output', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
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
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
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

  it('reports mixed adoption outcomes for created skipped and removed files in init-json output', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'existing-mixed');

    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(targetDir, '.github', 'prompts'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, '.github', 'prompts', 'review.md'), '# keep\n', 'utf8');

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
      createdPaths: string[];
      skippedPaths: string[];
      cleanup: { removedPaths: string[]; status: string };
    };

    expect(payload.cleanup.status).toBe('applied');
    expect(payload.cleanup.removedPaths).toContain('.codex/scripts/sync-to-cognee.sh');
    expect(payload.createdPaths).toEqual(expect.arrayContaining(['.codex/README.md', 'AGENTS.md']));
    expect(await readFile(path.join(targetDir, '.github', 'prompts', 'review.md'), 'utf8')).toBe('# keep\n');
  });

  it('wires the active custom post-checkout hook during existing-repo adoption', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'existing-hooks');

    await mkdir(path.join(targetDir, '.beads', 'hooks'), { recursive: true });
    await execFile('git', ['init', '--initial-branch=main'], { cwd: targetDir });
    await execFile('git', ['config', 'core.hooksPath', '.beads/hooks'], { cwd: targetDir });
    await writeFile(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), '#!/bin/sh\nexit 0\n', 'utf8');
    await chmod(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), 0o755);

    await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', '--mode', 'existing', '--assistant', 'codex', '--init-json', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const activeHook = await readFile(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), 'utf8');

    expect(activeHook).toContain('BEGIN PI HARNESS WORKTREE HOOK');
    expect(activeHook).toContain('.codex/scripts/bootstrap-worktree.sh');
  });

  it('falls back to a direct post-checkout hook when an existing pre-commit config lacks bootstrap wiring', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'existing-default-hooks');
    const binDir = path.join(workspace, 'bin');
    const preCommitLog = path.join(workspace, 'pre-commit.log');

    await mkdir(binDir, { recursive: true });
    await writeFile(preCommitLog, '', 'utf8');
    await execFile('git', ['init', '--initial-branch=main', targetDir]);
    await writeFile(
      path.join(targetDir, '.pre-commit-config.yaml'),
      'default_install_hook_types:\n  - pre-commit\n\nrepos:\n  - repo: https://github.com/gitleaks/gitleaks\n    rev: v8.30.0\n    hooks:\n      - id: gitleaks\n',
      'utf8'
    );
    await writeFile(
      path.join(binDir, 'pre-commit'),
      `#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${preCommitLog}"
exit 0
`,
      'utf8'
    );
    await chmod(path.join(binDir, 'pre-commit'), 0o755);

    const result = await execFile(
      process.execPath,
      [tsxCli, 'src/cli.ts', '--mode', 'existing', '--assistant', 'codex', targetDir],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${binDir}:${process.env.PATH ?? ''}`
        }
      }
    );

    const preCommitCalls = await readFile(preCommitLog, 'utf8');
    const directHook = await readFile(path.join(targetDir, '.git', 'hooks', 'post-checkout'), 'utf8');

    expect(preCommitCalls).toBe('');
    expect(result.stdout).toContain('fell back to a direct post-checkout hook');
    expect(directHook).toContain('BEGIN PI HARNESS WORKTREE HOOK');
  });
});
