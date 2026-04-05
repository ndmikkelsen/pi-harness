import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

describe('CLI help', () => {
  it('describes pi-harness as a local-use tool', async () => {
    const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--help'], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    expect(result.stdout).toContain('AI workflow scaffolder for local setup of new and existing projects.');
  });
});
