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
const existingModeBaselinePaths = ['AGENTS.md', '.pi/settings.json', '.pi/mcp.json', '.pi/agents/lead.md', '.pi/extensions/repo-workflows.ts', '.pi/extensions/role-workflow.ts', 'scripts/bootstrap-worktree.sh', 'scripts/bake.sh', 'scripts/sync-artifacts-to-cognee.sh'];

describe('CLI init', () => {
  it('prints local install guidance in the human-readable report', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'human-output-app');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--skip-git', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(result.stdout).toContain('Scaffolded human-output-app (new)');
    expect(result.stdout).toContain(
      'Use `pi-harness` locally on your machine to scaffold repos. The documented setup path is a checkout plus `pnpm build` and `pnpm install:local`; there is no registry-published package.'
    );
  });

  it('emits Pi-native init-json output', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'json-output-app');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--skip-git', '--init-json', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    const payload = JSON.parse(result.stdout) as {
      mode: string;
      createdPaths: string[];
      cleanup: { status: string };
    };

    expect(payload.mode).toBe('new');
    expect(payload.createdPaths).toEqual(expect.arrayContaining(['AGENTS.md', '.pi/settings.json', '.pi/mcp.json', 'scripts/bootstrap-worktree.sh']));
    expect(payload.cleanup.status).toBe('not-requested');
  });

  it('supports no-arg init-json flows when the current directory basename is not already a valid slug', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, '123 first bake');

    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, 'README.md'), '# existing repo\n', 'utf8');

    const result = await execFile(process.execPath, [tsxCli, path.join(repoRoot, 'src/cli.ts'), '--skip-git', '--init-json'], {
      cwd: targetDir,
      encoding: 'utf8'
    });

    const payload = JSON.parse(result.stdout) as {
      appName: string;
      mode: string;
      createdPaths: string[];
    };

    expect(payload.appName).toBe('project-123-first-bake');
    expect(payload.mode).toBe('existing');
    expect(payload.createdPaths).toEqual(expect.arrayContaining(['AGENTS.md', '.pi/settings.json', '.pi/mcp.json']));
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

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', targetDir], {
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

  it('preserves existing scaffold files by default in existing mode', { timeout: 10000 }, async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'existing-preserve');
    const gitignorePath = path.join(targetDir, '.gitignore');
    const envExamplePath = path.join(targetDir, '.env.example');

    await mkdir(targetDir, { recursive: true });
    await writeFile(gitignorePath, 'dist/\n', 'utf8');
    await writeFile(envExamplePath, 'EXISTING_ONLY=true\n', 'utf8');

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--mode', 'existing', '--init-json', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

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
      [tsxCli, 'src/cli.ts', '--mode', 'existing', '--merge-root-files', '--init-json', targetDir],
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

    let stdout = '';
    try {
      const result = await execFile(
        process.execPath,
        [tsxCli, 'src/cli.ts', '--mode', 'existing', '--cleanup-manifest', 'legacy-ai-frameworks-v1', '--init-json', targetDir],
        {
          cwd: repoRoot,
          encoding: 'utf8'
        }
      );
      stdout = result.stdout;
    } catch (error) {
      stdout = (error as { stdout?: string }).stdout ?? '';
    }

    const payload = JSON.parse(stdout) as {
      cleanup: {
        status: string;
        removedPaths: string[];
        summary: { deleted: number; promptRequired: number };
        actions: Array<{ path: string; status: string }>;
      };
    };

    expect(payload.cleanup.status).toBe('blocked');
    expect(payload.cleanup.removedPaths).toContain('.codex/templates/session-handoff.md');
    expect(payload.cleanup.summary.deleted).toBeGreaterThan(0);
    expect(payload.cleanup.summary.promptRequired).toBeGreaterThan(0);
    expect(payload.cleanup.actions).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: '.codex', status: 'prompt-required' })])
    );
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
      expect.arrayContaining([expect.objectContaining({ path: legacyRuntimeDir, status: 'prompt-required' })])
    );
  });
  it('auto-confirms curated cleanup entries when cleanup-confirm-all is set', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'existing-confirm-all');

    await mkdir(path.join(targetDir, '.codex', 'templates'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'templates', 'session-handoff.md'), '# old\n', 'utf8');

    const result = await execFile(
      process.execPath,
      [
        tsxCli,
        'src/cli.ts',
        '--mode',
        'existing',
        '--cleanup-manifest',
        'legacy-ai-frameworks-v1',
        '--cleanup-confirm-all',
        '--init-json',
        targetDir
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    );

    const payload = JSON.parse(result.stdout) as {
      cleanup: {
        status: string;
        removedPaths: string[];
        summary: { promptRequired: number };
      };
    };

    expect(payload.cleanup.status).toBe('applied');
    expect(payload.cleanup.summary.promptRequired).toBe(0);
    expect(payload.cleanup.removedPaths).toEqual(expect.arrayContaining(['.codex']));
  });


  it('reports mixed adoption outcomes for created skipped and removed files in init-json output', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'existing-mixed');

    await mkdir(path.join(targetDir, '.codex', 'scripts'), { recursive: true });
    await mkdir(path.join(targetDir, '.github', 'prompts'), { recursive: true });
    await writeFile(path.join(targetDir, '.codex', 'scripts', 'sync-to-cognee.sh'), '#!/usr/bin/env bash\n', 'utf8');
    await writeFile(path.join(targetDir, '.github', 'prompts', 'review.md'), '# keep\n', 'utf8');

    let stdout = '';
    try {
      const result = await execFile(
        process.execPath,
        [tsxCli, 'src/cli.ts', '--mode', 'existing', '--cleanup-manifest', 'legacy-ai-frameworks-v1', '--init-json', targetDir],
        {
          cwd: repoRoot,
          encoding: 'utf8'
        }
      );
      stdout = result.stdout;
    } catch (error) {
      stdout = (error as { stdout?: string }).stdout ?? '';
    }

    const payload = JSON.parse(stdout) as {
      createdPaths: string[];
      skippedPaths: string[];
      cleanup: {
        removedPaths: string[];
        status: string;
        summary: { promptRequired: number };
        actions: Array<{ path: string; status: string }>;
      };
    };

    expect(payload.cleanup.status).toBe('blocked');
    expect(payload.cleanup.removedPaths).toContain('.codex/scripts/sync-to-cognee.sh');
    expect(payload.cleanup.summary.promptRequired).toBeGreaterThan(0);
    expect(payload.cleanup.actions).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: '.codex', status: 'prompt-required' })])
    );
    expect(payload.createdPaths).toEqual(expect.arrayContaining(existingModeBaselinePaths));
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

    await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--mode', 'existing', '--init-json', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    const activeHook = await readFile(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), 'utf8');

    expect(activeHook).toContain('BEGIN PI HARNESS WORKTREE HOOK');
    expect(activeHook).toContain('scripts/bootstrap-worktree.sh');
  });

  it('normalizes legacy ai-harness post-checkout blocks during existing-repo adoption', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-cli-init-'));
    const targetDir = path.join(workspace, 'legacy-existing-hooks');

    await mkdir(path.join(targetDir, '.beads', 'hooks'), { recursive: true });
    await execFile('git', ['init', '--initial-branch=main'], { cwd: targetDir });
    await execFile('git', ['config', 'core.hooksPath', '.beads/hooks'], { cwd: targetDir });
    await writeFile(
      path.join(targetDir, '.beads', 'hooks', 'post-checkout'),
      `#!/usr/bin/env sh
# --- BEGIN BEADS INTEGRATION v0.57.0 ---
# This section is managed by beads. Do not remove these markers.
_bd_exit=0
if command -v bd >/dev/null 2>&1; then
  export BD_GIT_HOOK=1
  bd hooks run post-checkout "$@"
  _bd_exit=$?
fi
# --- END BEADS INTEGRATION ---

# --- BEGIN AI HARNESS WORKTREE HOOK ---
# Beads runs first. The AI Harness bootstrap runs after the Beads hook and is
# safe to invoke even when worktree bootstrap already ran earlier in checkout
# or worktree creation.
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -n "$repo_root" ] && [ -x "$repo_root/scripts/bootstrap-worktree.sh" ]; then
  "$repo_root/scripts/bootstrap-worktree.sh" --quiet || true
fi
if [ "$_bd_exit" -ne 0 ]; then
  exit "$_bd_exit"
fi
# --- END AI HARNESS WORKTREE HOOK ---
`,
      'utf8'
    );
    await chmod(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), 0o755);

    await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--mode', 'existing', '--init-json', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    const activeHook = await readFile(path.join(targetDir, '.beads', 'hooks', 'post-checkout'), 'utf8');

    expect(activeHook).toContain('BEGIN PI HARNESS WORKTREE HOOK');
    expect(activeHook).not.toContain('AI HARNESS WORKTREE HOOK');
    expect(activeHook.match(/BEGIN PI HARNESS WORKTREE HOOK/g)?.length ?? 0).toBe(1);
    expect(activeHook).toContain('The Pi Harness bootstrap runs after the Beads hook');
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

    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--mode', 'existing', targetDir], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`
      }
    });

    const preCommitCalls = await readFile(preCommitLog, 'utf8');
    const directHook = await readFile(path.join(targetDir, '.git', 'hooks', 'post-checkout'), 'utf8');

    expect(preCommitCalls).toBe('');
    expect(result.stdout).toContain('fell back to a direct post-checkout hook');
    expect(directHook).toContain('BEGIN PI HARNESS WORKTREE HOOK');
  });
});
