import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

interface ExecutedExtensionResult {
  registeredCommand: string;
  description: string | null;
  execCalls: Array<{
    command: string;
    args: string[];
  }>;
  notifications: string[];
}

async function executeInstalledBakeExtension(options: {
  extensionPath: string;
  args: string;
  cwd: string;
  hasUI?: boolean;
}): Promise<ExecutedExtensionResult> {
  const probePath = path.join(path.dirname(options.extensionPath), 'probe.ts');

  await writeFile(
    probePath,
    `// @ts-nocheck
async function main() {
  const [, , extensionUrl, inputJson] = process.argv;
  const { default: register } = await import(extensionUrl);
  const input = JSON.parse(inputJson);
  const execCalls = [];
  const notifications = [];
  let registeredCommand = null;
  let description = null;
  let handler = null;

  register({
    exec: async (command, args) => {
      execCalls.push({ command, args });
      return null;
    },
    registerCommand: (name, options) => {
      registeredCommand = name;
      description = options.description ?? null;
      handler = options.handler;
    },
  });

  if (typeof handler !== 'function') {
    throw new Error('installed extension did not register a /bake handler');
  }

  await handler(input.args, {
    cwd: input.cwd,
    hasUI: input.hasUI,
    ui: {
      notify(message) {
        notifications.push(message);
      },
    },
  });

  process.stdout.write(JSON.stringify({ registeredCommand, description, execCalls, notifications }));
}

main().catch((error) => {
  process.stderr.write(String(error instanceof Error ? error.stack ?? error.message : error));
  process.exit(1);
});
`,
    'utf8',
  );

  const result = await execFile(
    process.execPath,
    [
      tsxCli,
      probePath,
      pathToFileURL(options.extensionPath).href,
      JSON.stringify({
        args: options.args,
        cwd: options.cwd,
        hasUI: options.hasUI ?? true,
      }),
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  );

  return JSON.parse(result.stdout) as ExecutedExtensionResult;
}

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
    expect(extension).toContain("const LEGACY_CLEANUP_MANIFEST = 'legacy-ai-frameworks-v1';");
    expect(extension).toContain('function buildAutomaticBakeArgs');
    expect(extension).toContain('--cleanup-confirm-all');
    expect(extension).toContain('--merge-root-files');
    expect(extension).toContain("pi.registerCommand('bake'");
    expect(extension).toContain('Auto-detect new vs existing repositories and run pi-harness with Pi-native bake defaults.');
    expect(extension).toContain("ctx.ui.notify('pi-harness /bake finished.')");

    await execFile(process.execPath, [tsxCli, '-e', `import(${JSON.stringify(extensionPath)})`], {
      cwd: workspace,
      encoding: 'utf8',
    });

    const freshBake = await executeInstalledBakeExtension({
      extensionPath,
      args: 'fresh-app',
      cwd: workspace,
    });

    expect(freshBake).toEqual({
      registeredCommand: 'bake',
      description: 'Auto-detect new vs existing repositories and run pi-harness with Pi-native bake defaults.',
      execCalls: [
        {
          command: launcherPath,
          args: ['fresh-app', '--init-json'],
        },
      ],
      notifications: ['pi-harness /bake finished.'],
    });

    const existingRepoDir = path.join(workspace, 'existing-repo');
    await mkdir(existingRepoDir, { recursive: true });
    await writeFile(path.join(existingRepoDir, 'README.md'), '# existing\n', 'utf8');

    const existingBake = await executeInstalledBakeExtension({
      extensionPath,
      args: '',
      cwd: existingRepoDir,
      hasUI: false,
    });

    expect(existingBake.execCalls).toEqual([
      {
        command: launcherPath,
        args: [
          '--mode',
          'existing',
          '--force',
          '--cleanup-manifest',
          'legacy-ai-frameworks-v1',
          '--cleanup-confirm-all',
          '--merge-root-files',
          '--init-json',
        ],
      },
    ]);
    expect(existingBake.notifications).toEqual([]);

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
