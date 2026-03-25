import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { LOCAL_LAUNCHER_NAMES, renderLauncherScript } from '../../src/local-launcher.js';

describe('renderLauncherScript', () => {
  it('renders a wrapper that targets the selected repo', () => {
    const repoPath = '/tmp/ai-scaffolding';
    const result = renderLauncherScript(repoPath);

    expect(result).toContain(`REPO="\${SCAFF_REPO:-${repoPath}}"`);
    expect(result).toContain('DIST="$REPO/dist/src/cli.js"');
    expect(result).toContain('TSX="$REPO/node_modules/.bin/tsx"');
    expect(result).toContain('exec node "$DIST" "$@"');
    expect(result).toContain('pnpm --dir "$REPO" build');
    expect(result).toContain('exec "$TSX" "$SRC" "$@"');
  });

  it('installs the CLI launcher name', () => {
    expect(LOCAL_LAUNCHER_NAMES).toEqual(['scaff']);
  });

  it('renders a stable basename-based error prefix', () => {
    const result = renderLauncherScript(path.resolve('/tmp/repo'));
    expect(result).toContain("printf '%s: %s\\n' \"$(basename \"$0\")\" \"$*\" >&2");
  });
});
