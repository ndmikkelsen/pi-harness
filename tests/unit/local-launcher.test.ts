import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

import { LOCAL_LAUNCHER_NAMES, renderGlobalBakeExtension, renderLauncherScript } from '../../src/local-launcher.js';

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

function executeRenderedBakeExtension(options: {
  args: string;
  cwd: string;
  hasUI?: boolean;
  launcherPath?: string;
}): ExecutedExtensionResult {
  const workspace = mkdtempSync(path.join(os.tmpdir(), 'pi-harness-rendered-ext-'));
  const extensionPath = path.join(workspace, 'index.ts');
  const probePath = path.join(workspace, 'probe.ts');

  try {
    writeFileSync(
      extensionPath,
      renderGlobalBakeExtension({ launcherPath: options.launcherPath ?? '/tmp/pi-harness' }),
      'utf8',
    );
    writeFileSync(
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
    throw new Error('rendered extension did not register a /bake handler');
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

    const stdout = execFileSync(
      process.execPath,
      [
        tsxCli,
        probePath,
        pathToFileURL(extensionPath).href,
        JSON.stringify({
          args: options.args,
          cwd: options.cwd,
          hasUI: options.hasUI ?? true,
        }),
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      },
    );

    return JSON.parse(stdout) as ExecutedExtensionResult;
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

describe('renderLauncherScript', () => {
  it('renders a wrapper that targets the selected repo', () => {
    const repoPath = '/tmp/pi-harness';
    const result = renderLauncherScript(repoPath);

    expect(result).toContain(`REPO="\${PI_HARNESS_REPO:-${repoPath}}"`);
    expect(result).toContain('DIST="$REPO/dist/src/cli.js"');
    expect(result).toContain('TSX="$REPO/node_modules/.bin/tsx"');
    expect(result).toContain('exec node "$DIST" "$@"');
    expect(result).toContain('pnpm --dir "$REPO" build');
    expect(result).toContain('exec "$TSX" "$SRC" "$@"');
  });

  it('installs the CLI launcher name', () => {
    expect(LOCAL_LAUNCHER_NAMES).toEqual(['pi-harness']);
  });

  it('renders a stable basename-based error prefix', () => {
    const result = renderLauncherScript(path.resolve('/tmp/repo'));
    expect(result).toContain("printf '%s: %s\\n' \"$(basename \"$0\")\" \"$*\" >&2");
  });

  it('renders a shell-valid launcher script', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'pi-harness-launcher-'));
    const scriptPath = path.join(workspace, 'pi-harness');

    try {
      writeFileSync(scriptPath, renderLauncherScript(path.resolve('/tmp/repo')), 'utf8');
      expect(() => {
        execFileSync('bash', ['-n', scriptPath], { stdio: 'pipe' });
      }).not.toThrow();
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });
});

describe('renderGlobalBakeExtension', () => {
  it('keeps escaped backslashes intact in the generated extension source', () => {
    const result = renderGlobalBakeExtension({ launcherPath: '/tmp/pi-harness' });

    expect(result).toContain(String.raw`if (char === '\\')`);
    expect(result).toContain(String.raw`/\s/.test(char)`);
    expect(result).toContain(String.raw`current += '\\';`);
  });

  it('renders TypeScript source that tsx can parse', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'pi-harness-global-ext-'));
    const scriptPath = path.join(workspace, 'index.ts');

    try {
      writeFileSync(scriptPath, renderGlobalBakeExtension({ launcherPath: '/tmp/pi-harness' }), 'utf8');
      expect(() => {
        execFileSync(process.execPath, [tsxCli, '-e', `import(${JSON.stringify(scriptPath)})`], {
          stdio: 'pipe',
        });
      }).not.toThrow();
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  it('auto-detects new targets without injecting existing-repo cleanup defaults', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'pi-harness-new-target-'));

    try {
      const result = executeRenderedBakeExtension({
        args: 'fresh-app',
        cwd: workspace,
      });

      expect(result).toEqual({
        registeredCommand: 'bake',
        description: 'Auto-detect new vs existing repositories and run pi-harness with Pi-native bake defaults.',
        execCalls: [
          {
            command: '/tmp/pi-harness',
            args: ['fresh-app', '--init-json'],
          },
        ],
        notifications: ['pi-harness /bake finished.'],
      });
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  it('auto-detects existing targets and injects cleanup defaults', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'pi-harness-existing-target-'));
    const existingDir = path.join(workspace, 'existing-app');

    try {
      mkdirSync(existingDir, { recursive: true });
      writeFileSync(path.join(existingDir, 'README.md'), '# existing\n', 'utf8');

      const result = executeRenderedBakeExtension({
        args: 'existing-app',
        cwd: workspace,
        hasUI: false,
      });

      expect(result.execCalls).toEqual([
        {
          command: '/tmp/pi-harness',
          args: [
            '--mode',
            'existing',
            '--force',
            '--cleanup-manifest',
            'legacy-ai-frameworks-v1',
            '--cleanup-confirm-all',
            '--merge-root-files',
            'existing-app',
            '--init-json',
          ],
        },
      ]);
      expect(result.notifications).toEqual([]);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  it('keeps explicit control flags intact while still appending --init-json', () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), 'pi-harness-explicit-flags-'));

    try {
      const result = executeRenderedBakeExtension({
        args: '--mode existing "repo with spaces"',
        cwd: workspace,
      });

      expect(result.execCalls).toEqual([
        {
          command: '/tmp/pi-harness',
          args: ['--mode', 'existing', 'repo with spaces', '--init-json'],
        },
      ]);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });
});
