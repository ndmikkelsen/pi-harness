import { spawnSync } from 'node:child_process';

export function ensureGitRepository(targetDir: string): string[] {
  const repoCheck = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (repoCheck.status === 0) {
    return ['Git repository already present.'];
  }

  const initResult = spawnSync('git', ['init', '--initial-branch=main'], {
    cwd: targetDir,
    encoding: 'utf8'
  });

  if (initResult.status === 0) {
    return ['Initialized a git repository on main. Create a feature branch before making your first commit.'];
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

  return ['Initialized a git repository on main. Create a feature branch before making your first commit.'];
}
