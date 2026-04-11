import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { LOCAL_LAUNCHER_NAMES, renderGlobalBakeExtension, renderLauncherScript } from '../../src/local-launcher.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

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
});
