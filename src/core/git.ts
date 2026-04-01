import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const worktreeHookStart = '# --- BEGIN AI HARNESS WORKTREE HOOK ---';
const worktreeHookEnd = '# --- END AI HARNESS WORKTREE HOOK ---';

function gitOutput(targetDir: string, args: string[]): string | null {
  const result = spawnSync('git', args, {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim() || null;
}

function resolveHooksDir(targetDir: string): { hooksDir: string; mode: 'default' | 'custom' } | null {
  const configuredHooksPath = gitOutput(targetDir, ['config', '--get', 'core.hooksPath']);

  if (configuredHooksPath !== null) {
    return {
      hooksDir: path.isAbsolute(configuredHooksPath) ? configuredHooksPath : path.join(targetDir, configuredHooksPath),
      mode: 'custom'
    };
  }

  const gitDir = gitOutput(targetDir, ['rev-parse', '--git-dir']);
  if (gitDir === null) {
    return null;
  }

  return {
    hooksDir: path.join(targetDir, gitDir, 'hooks'),
    mode: 'default'
  };
}

function worktreeHookBlock(): string {
  return [
    worktreeHookStart,
    'repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"',
    'if [ -n "$repo_root" ] && [ -x "$repo_root/.codex/scripts/bootstrap-worktree.sh" ]; then',
    '  "$repo_root/.codex/scripts/bootstrap-worktree.sh" --quiet || true',
    'fi',
    worktreeHookEnd
  ].join('\n');
}

function preCommitConfigSupportsWorktreeBootstrap(targetDir: string): boolean {
  const configPath = path.join(targetDir, '.pre-commit-config.yaml');
  if (!existsSync(configPath)) {
    return false;
  }

  const config = readFileSync(configPath, 'utf8');
  return config.includes('entry: scripts/hooks/post-checkout') && config.includes('post-checkout');
}

function ensureManagedPostCheckoutHook(hookFile: string): 'created' | 'updated' | 'unchanged' {
  const block = worktreeHookBlock();

  if (!existsSync(hookFile)) {
    mkdirSync(path.dirname(hookFile), { recursive: true });
    writeFileSync(hookFile, `#!/bin/sh\nset -eu\n\n${block}\n`, 'utf8');
    chmodSync(hookFile, 0o755);
    return 'created';
  }

  const existingContent = readFileSync(hookFile, 'utf8');
  if (existingContent.includes(worktreeHookStart)) {
    chmodSync(hookFile, 0o755);
    return 'unchanged';
  }

  const separator = existingContent.endsWith('\n') ? '\n' : '\n\n';
  writeFileSync(hookFile, `${existingContent}${separator}${block}\n`, 'utf8');
  chmodSync(hookFile, 0o755);
  return 'updated';
}

function installPreCommitHooks(targetDir: string): 'installed' | 'missing' | 'failed' | 'unsupported' {
  if (!preCommitConfigSupportsWorktreeBootstrap(targetDir)) {
    return 'unsupported';
  }

  const installResult = spawnSync('pre-commit', ['install'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (installResult.error?.name === 'Error' || installResult.error?.message?.includes('ENOENT')) {
    return 'missing';
  }
  if (installResult.status !== 0) {
    return 'failed';
  }

  const postCheckoutResult = spawnSync('pre-commit', ['install', '--hook-type', 'post-checkout'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (postCheckoutResult.status !== 0) {
    return 'failed';
  }

  return 'installed';
}

function ensureWorktreeHookSetup(targetDir: string): string[] {
  const notes: string[] = [];
  const hookTarget = resolveHooksDir(targetDir);

  if (hookTarget === null) {
    return ['Unable to resolve the git hooks directory. Wire the post-checkout hook manually if you need automatic worktree bootstrap.'];
  }

  if (hookTarget.mode === 'custom') {
    const result = ensureManagedPostCheckoutHook(path.join(hookTarget.hooksDir, 'post-checkout'));
    if (result === 'created' || result === 'updated') {
      notes.push('Wired the active post-checkout hook to run the tracked worktree bootstrap script.');
    }
    return notes;
  }

  const preCommitStatus = installPreCommitHooks(targetDir);
  if (preCommitStatus === 'installed') {
    notes.push('Installed pre-commit hooks, including post-checkout worktree bootstrap.');
    return notes;
  }

  const fallbackResult = ensureManagedPostCheckoutHook(path.join(hookTarget.hooksDir, 'post-checkout'));
  if (fallbackResult === 'created' || fallbackResult === 'updated') {
    notes.push('Installed a direct post-checkout hook for automatic worktree bootstrap.');
  }

  if (preCommitStatus === 'missing') {
    notes.push('`pre-commit` is not installed locally, so ai-harness fell back to a direct post-checkout hook.');
  } else if (preCommitStatus === 'unsupported') {
    notes.push('The existing `.pre-commit-config.yaml` does not declare the ai-harness worktree bootstrap hook, so ai-harness fell back to a direct post-checkout hook.');
  } else if (preCommitStatus === 'failed') {
    notes.push('`pre-commit install` did not succeed, so ai-harness fell back to a direct post-checkout hook.');
  }

  return notes;
}

export function ensureGitRepository(targetDir: string): string[] {
  const repoCheck = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (repoCheck.status === 0) {
    return ['Git repository already present.', ...ensureWorktreeHookSetup(targetDir)];
  }

  const initResult = spawnSync('git', ['init', '--initial-branch=main'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (initResult.status === 0) {
    return [
      'Initialized a git repository on main. Create a feature branch before making your first commit.',
      ...ensureWorktreeHookSetup(targetDir)
    ];
  }

  const fallbackInit = spawnSync('git', ['init'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (fallbackInit.status !== 0) {
    return ['Git initialization failed. Review the local git installation before committing this scaffold.'];
  }

  spawnSync('git', ['branch', '-M', 'main'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  return [
    'Initialized a git repository on main. Create a feature branch before making your first commit.',
    ...ensureWorktreeHookSetup(targetDir)
  ];
}
