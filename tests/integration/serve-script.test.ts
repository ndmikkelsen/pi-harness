import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);

const FILLED_STICKYNOTE = `# Session Handoff

**Project:** Serve Fixture

## Completed This Session

- Current branch: feat/serve-fixture
- Current task: Verify serve contract
- Verified with: pnpm test -- tests/integration/serve-script.test.ts

## Key Files Changed

- scripts/serve.sh

## Pending / Follow-Up

- None.
`;

async function initGitRepo(repoDir: string) {
  await execFile('git', ['init', '-b', 'main'], { cwd: repoDir });
  await execFile('git', ['config', 'user.name', 'Pi Harness Tests'], { cwd: repoDir });
  await execFile('git', ['config', 'user.email', 'tests@example.com'], { cwd: repoDir });
}

async function setGhListResponse(fixture: { ghListFile: string }, payload: unknown) {
  await writeFile(fixture.ghListFile, `${JSON.stringify(payload)}\n`, 'utf8');
}

async function seedUsableStickyNote(repoDir: string, content = FILLED_STICKYNOTE) {
  await writeFile(path.join(repoDir, 'STICKYNOTE.md'), content, 'utf8');
}

async function createServeFixture() {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-serve-'));
  const repoDir = path.join(workspace, 'repo');
  const remoteDir = path.join(workspace, 'remote.git');
  const binDir = path.join(workspace, 'bin');
  const ghLog = path.join(workspace, 'gh.log');
  const ghListFile = path.join(workspace, 'gh-pr-list.json');
  const pnpmLog = path.join(workspace, 'pnpm.log');
  const syncLog = path.join(workspace, 'sync.log');

  await mkdir(repoDir, { recursive: true });
  await mkdir(remoteDir, { recursive: true });
  await mkdir(binDir, { recursive: true });
  await initGitRepo(repoDir);
  await execFile('git', ['init', '--bare'], { cwd: remoteDir });

  const sourceServe = await readFile(path.join(process.cwd(), 'scripts', 'serve.sh'), 'utf8');
  const stickyExample = await readFile(path.join(process.cwd(), 'STICKYNOTE.example.md'), 'utf8');
  await mkdir(path.join(repoDir, 'scripts'), { recursive: true });
  await writeFile(path.join(repoDir, 'scripts', 'serve.sh'), sourceServe, 'utf8');
  await chmod(path.join(repoDir, 'scripts', 'serve.sh'), 0o755);

  await writeFile(
    path.join(repoDir, 'package.json'),
    JSON.stringify(
      {
        name: 'serve-fixture',
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
  await writeFile(path.join(repoDir, 'README.md'), '# serve fixture\n', 'utf8');
  await writeFile(path.join(repoDir, '.gitignore'), '/STICKYNOTE.md\n', 'utf8');
  await writeFile(path.join(repoDir, 'STICKYNOTE.example.md'), stickyExample, 'utf8');
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
  printf 'https://example.test/pr/123\n'
  exit 0
fi

if [[ "$1 $2" == "pr edit" ]]; then
  record_body_file "$@"
  exit 0
fi

if [[ "$1 $2" == "pr view" ]]; then
  printf '{}\n'
  exit 0
fi

exit 1
`,
    'utf8'
  );
  await chmod(path.join(binDir, 'pnpm'), 0o755);
  await chmod(path.join(binDir, 'gh'), 0o755);

  await execFile('git', ['add', '.'], { cwd: repoDir });
  await execFile('git', ['commit', '-m', 'chore: seed serving fixture'], { cwd: repoDir });
  await execFile('git', ['remote', 'add', 'origin', remoteDir], { cwd: repoDir });
  await execFile('git', ['push', '-u', 'origin', 'main'], { cwd: repoDir });
  await execFile('git', ['checkout', '-b', 'feat/serve-fixture'], { cwd: repoDir });
  await seedUsableStickyNote(repoDir);

  return {
    workspace,
    repoDir,
    remoteDir,
    binDir,
    ghLog,
    ghListFile,
    pnpmLog,
    syncLog
  };
}

describe('serve.sh', () => {
  it('pushes the feature branch, creates a PR with an explicit completed-work body, and prints a post-serve summary', { timeout: 15000 }, async () => {
    const fixture = await createServeFixture();

    try {
      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      const ghLog = await readFile(fixture.ghLog, 'utf8');
      const pnpmLog = await readFile(fixture.pnpmLog, 'utf8');
      const remoteHeads = await execFile('git', ['ls-remote', '--heads', 'origin', 'feat/serve-fixture'], {
        cwd: fixture.repoDir,
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Serve complete. PR to dev: https://example.test/pr/123');
      expect(result.stdout).toContain('Post-serve branch summary:');
      expect(result.stdout).toContain('- Branch: feat/serve-fixture');
      expect(result.stdout).toContain('- Latest commit: chore: seed serving fixture');
      expect(ghLog).toContain('pr create --base dev --head feat/serve-fixture --title');
      expect(ghLog).toContain('--body-file');
      expect(ghLog).not.toContain('--fill');
      expect(ghLog).toContain('## Completed Work');
      expect(ghLog).toContain('- Current task: Verify serve contract');
      expect(ghLog).toContain('## Branch Summary');
      expect(ghLog).toContain('- Latest commit: chore: seed serving fixture');
      expect(pnpmLog).toContain('typecheck');
      expect(pnpmLog).toContain('test');
      expect(pnpmLog).toContain('test:bdd');
      expect(pnpmLog).toContain('test:smoke:dist');
      expect(remoteHeads.stdout).toContain('refs/heads/feat/serve-fixture');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('updates an existing PR body with the completed-work summary instead of relying on create --fill', { timeout: 15000 }, async () => {
    const fixture = await createServeFixture();

    try {
      await setGhListResponse(fixture, [
        { number: 77, url: 'https://example.test/pr/77', baseRefName: 'dev', state: 'OPEN' }
      ]);

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      const ghLog = await readFile(fixture.ghLog, 'utf8');

      expect(result.stdout).toContain('Serve complete. PR to dev: https://example.test/pr/77');
      expect(ghLog).not.toContain('pr create');
      expect(ghLog).toContain('pr edit 77 --body-file');
      expect(ghLog).toContain('## Completed Work');
      expect(ghLog).toContain('- Current branch: feat/serve-fixture');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('refuses to serve from main', async () => {
    const fixture = await createServeFixture();

    try {
      await execFile('git', ['checkout', 'main'], { cwd: fixture.repoDir });

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({ stderr: expect.stringContaining('Refusing to serve directly from main') });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('requires a usable local STICKYNOTE.md before serving', async () => {
    const fixture = await createServeFixture();

    try {
      await rm(path.join(fixture.repoDir, 'STICKYNOTE.md'), { force: true });

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({
        stderr: expect.stringContaining('Serving requires a usable local STICKYNOTE.md')
      });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('refuses to serve when STICKYNOTE.md is tracked', async () => {
    const fixture = await createServeFixture();

    try {
      await execFile('git', ['add', '-f', 'STICKYNOTE.md'], { cwd: fixture.repoDir });
      await execFile('git', ['commit', '-m', 'test: track sticky note'], { cwd: fixture.repoDir });

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({
        stderr: expect.stringContaining('STICKYNOTE.md must stay local-only and untracked before serving')
      });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('refuses to serve when STICKYNOTE.md still matches the untouched template', async () => {
    const fixture = await createServeFixture();

    try {
      const stickyExample = await readFile(path.join(fixture.repoDir, 'STICKYNOTE.example.md'), 'utf8');
      await seedUsableStickyNote(fixture.repoDir, stickyExample);

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({
        stderr: expect.stringContaining('STICKYNOTE.md still matches STICKYNOTE.example.md')
      });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('invokes the Pi-native artifact sync when present', async () => {
    const fixture = await createServeFixture();

    try {
      await writeFile(
        path.join(fixture.repoDir, 'scripts', 'sync-artifacts-to-cognee.sh'),
        `#!/usr/bin/env bash
set -euo pipefail
printf 'pi-sync-invoked\n' >> "${fixture.syncLog}"
exit 0
`,
        'utf8'
      );
      await chmod(path.join(fixture.repoDir, 'scripts', 'sync-artifacts-to-cognee.sh'), 0o755);
      await execFile('git', ['add', 'scripts/sync-artifacts-to-cognee.sh'], { cwd: fixture.repoDir });
      await execFile('git', ['commit', '-m', 'test: seed pi-native artifact sync'], { cwd: fixture.repoDir });

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Serve complete. PR to dev: https://example.test/pr/123');
      expect(await readFile(fixture.syncLog, 'utf8')).toContain('pi-sync-invoked');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('continues serving when Pi-native artifact sync reports an unavailable-but-skipped path', { timeout: 15000 }, async () => {
    const fixture = await createServeFixture();

    try {
      await writeFile(
        path.join(fixture.repoDir, 'scripts', 'sync-artifacts-to-cognee.sh'),
        `#!/usr/bin/env bash
set -euo pipefail
printf 'Cognee unavailable - skipping artifact sync\n'
exit 0
`,
        'utf8'
      );
      await chmod(path.join(fixture.repoDir, 'scripts', 'sync-artifacts-to-cognee.sh'), 0o755);
      await execFile('git', ['add', 'scripts/sync-artifacts-to-cognee.sh'], { cwd: fixture.repoDir });
      await execFile('git', ['commit', '-m', 'test: allow skipped pi-native artifact sync'], { cwd: fixture.repoDir });

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Serve complete. PR to dev: https://example.test/pr/123');
      expect(result.stdout).toContain('Cognee unavailable - skipping artifact sync');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('does not invoke deprecated planning-sync legacy artifacts during serving', async () => {
    const fixture = await createServeFixture();

    try {
      await mkdir(path.join(fixture.repoDir, '.codex', 'scripts'), { recursive: true });
      await writeFile(
        path.join(fixture.repoDir, '.codex', 'scripts', 'sync-planning-to-cognee.sh'),
        `#!/usr/bin/env bash
set -euo pipefail
printf 'legacy-wrapper-invoked\n' >> "${fixture.syncLog}"
exit 42
`,
        'utf8'
      );
      await writeFile(
        path.join(fixture.repoDir, '.codex', 'scripts', 'cognee-sync-planning.sh'),
        `#!/usr/bin/env bash
set -euo pipefail
printf 'legacy-backend-invoked\n' >> "${fixture.syncLog}"
exit 43
`,
        'utf8'
      );
      await chmod(path.join(fixture.repoDir, '.codex', 'scripts', 'sync-planning-to-cognee.sh'), 0o755);
      await chmod(path.join(fixture.repoDir, '.codex', 'scripts', 'cognee-sync-planning.sh'), 0o755);
      await execFile(
        'git',
        ['add', '.codex/scripts/sync-planning-to-cognee.sh', '.codex/scripts/cognee-sync-planning.sh'],
        { cwd: fixture.repoDir }
      );
      await execFile('git', ['commit', '-m', 'test: seed deprecated planning-sync legacy artifacts'], {
        cwd: fixture.repoDir
      });

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'serve.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Serve complete. PR to dev: https://example.test/pr/123');
      await expect(readFile(fixture.syncLog, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  }, 15000);
});
