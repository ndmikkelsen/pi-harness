import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);

async function initGitRepo(repoDir: string) {
  await execFile('git', ['init', '-b', 'main'], { cwd: repoDir });
  await execFile('git', ['config', 'user.name', 'Pi Harness Tests'], { cwd: repoDir });
  await execFile('git', ['config', 'user.email', 'tests@example.com'], { cwd: repoDir });
}

async function setGhListResponse(fixture: { ghListFile: string }, payload: unknown) {
  await writeFile(fixture.ghListFile, `${JSON.stringify(payload)}\n`, 'utf8');
}

async function createPromoteFixture() {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-promote-'));
  const repoDir = path.join(workspace, 'repo');
  const remoteDir = path.join(workspace, 'remote.git');
  const binDir = path.join(workspace, 'bin');
  const ghLog = path.join(workspace, 'gh.log');
  const ghListFile = path.join(workspace, 'gh-pr-list.json');
  const pnpmLog = path.join(workspace, 'pnpm.log');

  await mkdir(repoDir, { recursive: true });
  await mkdir(remoteDir, { recursive: true });
  await mkdir(binDir, { recursive: true });
  await initGitRepo(repoDir);
  await execFile('git', ['init', '--bare'], { cwd: remoteDir });

  const sourcePromote = await readFile(path.join(process.cwd(), 'scripts', 'promote.sh'), 'utf8');
  await mkdir(path.join(repoDir, 'scripts'), { recursive: true });
  await writeFile(path.join(repoDir, 'scripts', 'promote.sh'), sourcePromote, 'utf8');
  await chmod(path.join(repoDir, 'scripts', 'promote.sh'), 0o755);

  await writeFile(
    path.join(repoDir, 'package.json'),
    JSON.stringify(
      {
        name: 'promote-fixture',
        private: true,
        scripts: {
          typecheck: 'node -e "process.exit(0)"',
          test: 'node -e "process.exit(0)"',
          'test:bdd': 'node -e "process.exit(0)"',
          'test:smoke:dist': 'node -e "process.exit(0)"'
        }
      },
      null,
      2
    ),
    'utf8'
  );
  await writeFile(path.join(repoDir, 'README.md'), '# promote fixture\n', 'utf8');
  await writeFile(path.join(repoDir, '.gitignore'), '/STICKYNOTE.md\n', 'utf8');
  await writeFile(path.join(repoDir, 'STICKYNOTE.md'), '# local only\n', 'utf8');
  await writeFile(ghListFile, '[]\n', 'utf8');

  await writeFile(
    path.join(binDir, 'pnpm'),
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${pnpmLog}"
exit 0
`,
    'utf8'
  );
  await writeFile(
    path.join(binDir, 'gh'),
    `#!/usr/bin/env bash
set -euo pipefail

log_file="${ghLog}"
list_file="${ghListFile}"

record_body_file() {
  local previous=""
  local body_file=""

  for arg in "$@"; do
    if [[ "$previous" == "--body-file" ]]; then
      body_file="$arg"
      break
    fi
    previous="$arg"
  done

  if [[ -n "$body_file" && -f "$body_file" ]]; then
    printf 'BODY<<EOF\n' >> "$log_file"
    cat "$body_file" >> "$log_file"
    printf '\nEOF\n' >> "$log_file"
  fi
}

printf '%s\n' "$*" >> "$log_file"

if [[ "$1 $2" == "pr list" ]]; then
  cat "$list_file"
  exit 0
fi

if [[ "$1 $2" == "pr create" ]]; then
  record_body_file "$@"
  printf 'https://example.test/pr/501\n'
  exit 0
fi

if [[ "$1 $2" == "pr edit" ]]; then
  record_body_file "$@"
  exit 0
fi

exit 1
`,
    'utf8'
  );
  await chmod(path.join(binDir, 'pnpm'), 0o755);
  await chmod(path.join(binDir, 'gh'), 0o755);

  await execFile('git', ['add', '.'], { cwd: repoDir });
  await execFile('git', ['commit', '-m', 'chore: seed promotion fixture'], { cwd: repoDir });
  await execFile('git', ['remote', 'add', 'origin', remoteDir], { cwd: repoDir });
  await execFile('git', ['push', '-u', 'origin', 'main'], { cwd: repoDir });
  await execFile('git', ['checkout', '-b', 'dev'], { cwd: repoDir });
  await writeFile(path.join(repoDir, 'README.md'), '# promote fixture\n\nrelease delta\n', 'utf8');
  await execFile('git', ['add', 'README.md'], { cwd: repoDir });
  await execFile('git', ['commit', '-m', 'feat: prepare dev release'], { cwd: repoDir });

  return {
    workspace,
    repoDir,
    remoteDir,
    binDir,
    ghLog,
    ghListFile,
    pnpmLog
  };
}

describe('promote.sh', () => {
  it('pushes dev, creates a PR to main with an explicit promotion body, and prints a post-promotion summary', { timeout: 15000 }, async () => {
    const fixture = await createPromoteFixture();

    try {
      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'promote.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      const ghLog = await readFile(fixture.ghLog, 'utf8');
      const pnpmLog = await readFile(fixture.pnpmLog, 'utf8');
      const remoteHeads = await execFile('git', ['ls-remote', '--heads', 'origin', 'dev'], {
        cwd: fixture.repoDir,
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Promotion complete. PR to main: https://example.test/pr/501');
      expect(result.stdout).toContain('Post-promotion summary:');
      expect(result.stdout).toContain('- Source branch: dev');
      expect(result.stdout).toContain('- Target branch: main');
      expect(result.stdout).toContain('- Latest commit: feat: prepare dev release');
      expect(ghLog).toContain('pr create --base main --head dev --title');
      expect(ghLog).toContain('--body-file');
      expect(ghLog).toContain('## Promotion Summary');
      expect(ghLog).toContain('## Commit Summary');
      expect(ghLog).toContain('- feat: prepare dev release');
      expect(pnpmLog).toContain('typecheck');
      expect(pnpmLog).toContain('test');
      expect(pnpmLog).toContain('test:bdd');
      expect(pnpmLog).toContain('test:smoke:dist');
      expect(remoteHeads.stdout).toContain('refs/heads/dev');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('updates an existing dev-to-main PR body instead of creating a new PR', { timeout: 15000 }, async () => {
    const fixture = await createPromoteFixture();

    try {
      await setGhListResponse(fixture, [
        { number: 81, url: 'https://example.test/pr/81', baseRefName: 'main', state: 'OPEN' }
      ]);

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'promote.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      const ghLog = await readFile(fixture.ghLog, 'utf8');

      expect(result.stdout).toContain('Promotion complete. PR to main: https://example.test/pr/81');
      expect(ghLog).not.toContain('pr create');
      expect(ghLog).toContain('pr edit 81 --body-file');
      expect(ghLog).toContain('## Promotion Summary');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('refuses to promote from a non-dev branch', async () => {
    const fixture = await createPromoteFixture();

    try {
      await execFile('git', ['checkout', '-b', 'feat/release-shortcut'], { cwd: fixture.repoDir });

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'promote.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({ stderr: expect.stringContaining('Promotion only supports the dev branch') });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('requires a clean dev worktree before promoting', async () => {
    const fixture = await createPromoteFixture();

    try {
      await writeFile(path.join(fixture.repoDir, 'README.md'), '# promote fixture\n\nlocal dirty change\n', 'utf8');

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'promote.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({ stderr: expect.stringContaining('Promotion requires a clean working tree on dev') });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('refuses to reuse a dev PR that targets a branch other than main', { timeout: 15000 }, async () => {
    const fixture = await createPromoteFixture();

    try {
      await setGhListResponse(fixture, [
        { number: 91, url: 'https://example.test/pr/91', baseRefName: 'release', state: 'OPEN' }
      ]);

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'promote.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({ stderr: expect.stringContaining('Open PR for dev already targets release') });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });
});
