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

async function createLandFixture() {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-land-'));
  const repoDir = path.join(workspace, 'repo');
  const remoteDir = path.join(workspace, 'remote.git');
  const binDir = path.join(workspace, 'bin');
  const ghLog = path.join(workspace, 'gh.log');
  const pnpmLog = path.join(workspace, 'pnpm.log');
  const syncLog = path.join(workspace, 'sync.log');

  await mkdir(repoDir, { recursive: true });
  await mkdir(remoteDir, { recursive: true });
  await mkdir(binDir, { recursive: true });
  await initGitRepo(repoDir);
  await execFile('git', ['init', '--bare'], { cwd: remoteDir });

  const sourceLand = await readFile(
    path.join(process.cwd(), 'scripts', 'land.sh'),
    'utf8'
  );
  await mkdir(path.join(repoDir, 'scripts'), { recursive: true });
  await writeFile(path.join(repoDir, 'scripts', 'land.sh'), sourceLand, 'utf8');
  await chmod(path.join(repoDir, 'scripts', 'land.sh'), 0o755);

  await writeFile(
    path.join(repoDir, 'package.json'),
    JSON.stringify(
      {
        name: 'land-fixture',
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
  await writeFile(path.join(repoDir, 'README.md'), '# land fixture\n', 'utf8');

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
printf '%s\n' "$*" >> "${ghLog}"
if [[ "$1 $2" == "pr list" ]]; then
  printf '[]\n'
  exit 0
fi
if [[ "$1 $2" == "pr create" ]]; then
  printf 'https://example.test/pr/123\n'
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
  await execFile('git', ['commit', '-m', 'chore: seed landing fixture'], { cwd: repoDir });
  await execFile('git', ['remote', 'add', 'origin', remoteDir], { cwd: repoDir });
  await execFile('git', ['push', '-u', 'origin', 'main'], { cwd: repoDir });
  await execFile('git', ['checkout', '-b', 'feat/land-fixture'], { cwd: repoDir });

  return {
    workspace,
    repoDir,
    remoteDir,
    binDir,
      ghLog,
      pnpmLog,
      syncLog
    };
}

describe('land.sh', () => {
  it('pushes the feature branch and creates a PR to dev', { timeout: 15000 }, async () => {
    const fixture = await createLandFixture();

    try {
      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'land.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      const ghLog = await readFile(fixture.ghLog, 'utf8');
      const pnpmLog = await readFile(fixture.pnpmLog, 'utf8');
      const remoteHeads = await execFile('git', ['ls-remote', '--heads', 'origin', 'feat/land-fixture'], {
        cwd: fixture.repoDir,
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Landing complete. PR to dev: https://example.test/pr/123');
      expect(ghLog).toContain('pr create --base dev --head feat/land-fixture --fill');
      expect(pnpmLog).toContain('typecheck');
      expect(pnpmLog).toContain('test');
      expect(pnpmLog).toContain('test:bdd');
      expect(pnpmLog).toContain('test:smoke:dist');
      expect(remoteHeads.stdout).toContain('refs/heads/feat/land-fixture');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('refuses to land from main', async () => {
    const fixture = await createLandFixture();

    try {
      await execFile('git', ['checkout', 'main'], { cwd: fixture.repoDir });

      await expect(
        execFile(path.join(fixture.repoDir, 'scripts', 'land.sh'), [], {
          cwd: fixture.repoDir,
          env: {
            ...process.env,
            PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
          },
          encoding: 'utf8'
        })
      ).rejects.toMatchObject({ stderr: expect.stringContaining('Refusing to land directly from main') });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('invokes the Pi-native artifact sync when present', async () => {
    const fixture = await createLandFixture();

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

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'land.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Landing complete. PR to dev: https://example.test/pr/123');
      expect(await readFile(fixture.syncLog, 'utf8')).toContain('pi-sync-invoked');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });

  it('continues landing when Pi-native artifact sync reports an unavailable-but-skipped path', async () => {
    const fixture = await createLandFixture();

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

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'land.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Landing complete. PR to dev: https://example.test/pr/123');
      expect(result.stdout).toContain('Cognee unavailable - skipping artifact sync');
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  });
  it('does not invoke deprecated planning-sync legacy artifacts during landing', async () => {
    const fixture = await createLandFixture();

    try {
      // Seed legacy cleanup artifacts; supported scripts/land.sh must ignore them.
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

      const result = await execFile(path.join(fixture.repoDir, 'scripts', 'land.sh'), [], {
        cwd: fixture.repoDir,
        env: {
          ...process.env,
          PATH: `${fixture.binDir}:${process.env.PATH ?? ''}`
        },
        encoding: 'utf8'
      });

      expect(result.stdout).toContain('Landing complete. PR to dev: https://example.test/pr/123');
      await expect(readFile(fixture.syncLog, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(fixture.workspace, { recursive: true, force: true });
    }
  }, 15000);
});
