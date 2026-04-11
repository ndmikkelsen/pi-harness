import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { ResolvedProjectInput, ResolveProjectInputOptions } from './types.js';
import { envVarNameFromSlug, inferProjectName, isValidProjectName, titleCaseFromSlug } from './strings.js';

function expandHome(value: string): string {
  return value.startsWith('~/') ? path.join(os.homedir(), value.slice(2)) : value;
}

function looksLikePath(value: string): boolean {
  return value === '.' || value === '..' || value.startsWith('~/') || value.startsWith('/') || value.includes(path.sep);
}

function directoryHasFiles(targetDir: string): boolean {
  if (!existsSync(targetDir)) {
    return false;
  }

  return readdirSync(targetDir).length > 0;
}

function gitOutput(targetDir: string, args: string[]): string | null {
  try {
    const output = execFileSync('git', args, {
      cwd: targetDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();

    return output.length > 0 ? output : null;
  } catch {
    return null;
  }
}

function normalizeExistingPath(value: string): string {
  try {
    return realpathSync.native(value);
  } catch {
    return path.resolve(value);
  }
}

function detectLinkedWorktreeCanonicalRepoName(targetDir: string): string | null {
  const showTopLevel = gitOutput(targetDir, ['rev-parse', '--show-toplevel']);
  if (!showTopLevel || normalizeExistingPath(showTopLevel) !== normalizeExistingPath(targetDir)) {
    return null;
  }

  const gitCommonDir = gitOutput(targetDir, ['rev-parse', '--git-common-dir']);
  const gitDir = gitOutput(targetDir, ['rev-parse', '--git-dir']);
  if (!gitCommonDir || !gitDir) {
    return null;
  }

  const resolvedCommonDir = normalizeExistingPath(path.resolve(targetDir, gitCommonDir));
  const resolvedGitDir = normalizeExistingPath(path.resolve(targetDir, gitDir));

  if (path.basename(resolvedCommonDir) !== '.git' || resolvedCommonDir === resolvedGitDir) {
    return null;
  }

  const repoName = path.basename(path.dirname(resolvedCommonDir));
  return repoName.length > 0 ? repoName : null;
}

export function resolveProjectInput(options: ResolveProjectInputOptions): ResolvedProjectInput {
  const projectArg = options.projectArg?.trim();
  const rawTargetArg = options.targetArg?.trim();

  const inferredTargetArg = !rawTargetArg && projectArg && looksLikePath(projectArg) ? projectArg : rawTargetArg;
  const explicitProjectName = !rawTargetArg && projectArg && looksLikePath(projectArg) ? undefined : projectArg;

  const targetDir = inferredTargetArg
    ? path.resolve(options.cwd, expandHome(inferredTargetArg))
    : explicitProjectName
      ? path.resolve(options.cwd, explicitProjectName)
      : options.cwd;

  const targetExists = existsSync(targetDir);
  const targetHasFiles = directoryHasFiles(targetDir);
  const resolvedMode = options.mode === 'auto' ? (targetHasFiles ? 'existing' : 'new') : options.mode;

  if (resolvedMode === 'existing' && !targetExists) {
    throw new Error(`Cannot adopt missing directory: ${targetDir}`);
  }

  if (resolvedMode === 'new' && targetHasFiles) {
    throw new Error(`Refusing to scaffold a new project into a non-empty directory: ${targetDir}`);
  }

  const linkedWorktreeCanonicalName = detectLinkedWorktreeCanonicalRepoName(targetDir);
  const inferredName = linkedWorktreeCanonicalName ?? path.basename(targetDir);
  const candidateName = explicitProjectName ?? inferProjectName(inferredName);
  if (!candidateName || !isValidProjectName(candidateName)) {
    throw new Error('Project name must be lowercase alphanumeric with hyphens (for example: my-api).');
  }

  const inferenceNotes =
    linkedWorktreeCanonicalName === null
      ? []
      : [
          `Detected linked git worktree; using canonical repo slug "${candidateName}" from the main worktree instead of the current worktree directory name.`
        ];

  return {
    appName: candidateName,
    appSlug: candidateName,
    appTitle: titleCaseFromSlug(candidateName),
    appVar: envVarNameFromSlug(candidateName),
    targetDir,
    mode: resolvedMode,
    inferenceNotes
  };
}
