import { existsSync, readdirSync } from 'node:fs';
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

  const candidateName = explicitProjectName ?? inferProjectName(path.basename(targetDir));
  if (!candidateName || !isValidProjectName(candidateName)) {
    throw new Error('Project name must be lowercase alphanumeric with hyphens (for example: my-api).');
  }

  return {
    appName: candidateName,
    appSlug: candidateName,
    appTitle: titleCaseFromSlug(candidateName),
    appVar: envVarNameFromSlug(candidateName),
    targetDir,
    mode: resolvedMode
  };
}
