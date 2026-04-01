import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { InitResult } from '../../../../src/core/types.js';

export interface CliFeatureWorld {
  workspace: string;
  targetDir?: string;
  result?: InitResult;
  report?: string;
}

export async function createCliFeatureWorld(prefix: string): Promise<CliFeatureWorld> {
  return {
    workspace: await mkdtemp(path.join(os.tmpdir(), prefix))
  };
}

export async function disposeCliFeatureWorld(world: CliFeatureWorld): Promise<void> {
  await rm(world.workspace, { recursive: true, force: true });
}

export function requireResult(world: CliFeatureWorld): InitResult {
  if (!world.result) {
    throw new Error('Expected feature world to contain an init result');
  }

  return world.result;
}

export function requireTargetDir(world: CliFeatureWorld): string {
  if (!world.targetDir) {
    throw new Error('Expected feature world to contain a target directory');
  }

  return world.targetDir;
}

export async function readTargetFile(world: CliFeatureWorld, relativePath: string): Promise<string> {
  return readFile(path.join(requireTargetDir(world), relativePath), 'utf8');
}
