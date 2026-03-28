import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const buildDir = path.join(rootDir, 'dist');
const compiledCli = path.join(buildDir, 'src', 'cli.js');
const compiledTemplates = path.join(buildDir, 'src', 'templates');

if (!existsSync(compiledCli)) {
  throw new Error(`Build artifact missing: ${compiledCli}`);
}

if (!existsSync(compiledTemplates)) {
  throw new Error(`Templates missing from build: ${compiledTemplates}`);
}

const workspace = mkdtempSync(path.join(os.tmpdir(), 'scaiff-smoke-'));

try {
  const cli = path.join(buildDir, 'src', 'cli.js');

  const runCli = (args) => {
    execFileSync(process.execPath, [cli, ...args], {
      cwd: buildDir,
      stdio: 'inherit'
    });
  };

  runCli(['--help']);
  runCli(['--assistant', 'codex', '--skip-git', '--dry-run', path.join(workspace, 'smoke-codex')]);
  runCli(['--assistant', 'opencode', '--skip-git', '--dry-run', path.join(workspace, 'smoke-opencode')]);
  runCli(['--assistant', 'codex', '--skip-git', path.join(workspace, 'smoke-verified-codex')]);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
