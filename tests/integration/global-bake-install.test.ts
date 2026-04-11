import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

describe('global bake install', () => {
  it('installs the first-bake launcher and Pi-global /bake extension', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'pi-harness-global-bake-'));
    const repoDir = path.join(workspace, 'launcher-repo');
    const binDir = path.join(workspace, 'bin');
    const piAgentDir = path.join(workspace, 'pi-agent');

    await mkdir(path.join(repoDir, 'dist', 'src'), { recursive: true });
    await writeFile(
      path.join(repoDir, 'dist', 'src', 'cli.js'),
      '#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify({ cwd: process.cwd(), args: process.argv.slice(2) }));\n',
      'utf8',
    );
    await chmod(path.join(repoDir, 'dist', 'src', 'cli.js'), 0o755);

    const installResult = await execFile(
      process.execPath,
      [
        tsxCli,
        path.join(repoRoot, 'scripts', 'install-local-launcher.ts'),
        '--bin-dir',
        binDir,
        '--pi-agent-dir',
        piAgentDir,
        '--repo',
        repoDir,
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    );

    const launcherPath = path.join(binDir, 'pi-harness');
    const extensionPath = path.join(piAgentDir, 'extensions', 'pi-harness-bake', 'index.ts');
    const launcher = await readFile(launcherPath, 'utf8');
    const extension = await readFile(extensionPath, 'utf8');
    const launcherMode = (await stat(launcherPath)).mode & 0o111;

    expect(installResult.stdout).toContain(`Installed pi-harness -> ${launcherPath}`);
    expect(installResult.stdout).toContain(
      `Installed global Pi /bake extension (pi-harness-bake) -> ${extensionPath}`,
    );
    expect(launcherMode).not.toBe(0);
    expect(launcher).toContain(`REPO="\${PI_HARNESS_REPO:-${repoDir}}"`);
    expect(launcher).toContain('DIST="$REPO/dist/src/cli.js"');
    expect(launcher).toContain('pnpm --dir "$REPO" build');
    expect(launcher).toContain('exec "$TSX" "$SRC" "$@"');
    expect(extension).toContain(`const PI_HARNESS_LAUNCHER = ${JSON.stringify(launcherPath)};`);
    expect(extension).toContain("const DEFAULT_BAKE_ARGS = ['--init-json'];");
    expect(extension).toContain("pi.registerCommand('bake'");
    expect(extension).toContain('Run pi-harness for the current directory. Defaults to pi-harness --init-json.');
    expect(extension).toContain("ctx.ui.notify('pi-harness /bake finished.')");

    const launchResult = await execFile(launcherPath, ['--init-json', '.'], {
      cwd: workspace,
      encoding: 'utf8',
    });

    expect(JSON.parse(launchResult.stdout)).toEqual({
      cwd: await realpath(workspace),
      args: ['--init-json', '.'],
    });
  });
});
