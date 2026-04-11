import { access, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { getCleanupManifest } from './cleanup-manifests.js';
import type { CleanupAction, CleanupConfirmer, CleanupManifestEntry, CleanupResult } from './types.js';

export interface RunCleanupOptions {
  targetDir: string;
  manifestId?: string;
  dryRun: boolean;
  cleanupConfirmAll?: boolean;
  nonInteractive?: boolean;
  confirmCleanup?: CleanupConfirmer;
}

async function pathState(targetDir: string, relativePath: string): Promise<'file' | 'directory' | 'missing'> {
  try {
    const fileStat = await stat(path.join(targetDir, relativePath));
    return fileStat.isDirectory() ? 'directory' : 'file';
  } catch {
    return 'missing';
  }
}

async function promptForCleanup(entry: CleanupManifestEntry): Promise<boolean | null> {
  if (!input.isTTY || !output.isTTY) {
    return null;
  }

  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(`Delete ${entry.path}? ${entry.reason} [y/N] `);
    return answer.trim().toLowerCase() === 'y';
  } finally {
    rl.close();
  }
}

function summarize(actions: CleanupAction[]) {
  return {
    deleted: actions.filter((action) => action.status === 'deleted').length,
    skipped: actions.filter((action) => action.status === 'skipped').length,
    missing: actions.filter((action) => action.status === 'missing').length,
    promptRequired: actions.filter((action) => action.status === 'prompt-required').length,
    declined: actions.filter((action) => action.status === 'declined').length,
    planned: actions.filter((action) => action.status === 'planned').length
  };
}

export async function runCleanup(options: RunCleanupOptions): Promise<CleanupResult> {
  if (!options.manifestId) {
    return {
      enabled: false,
      status: 'not-requested',
      summary: { deleted: 0, skipped: 0, missing: 0, promptRequired: 0, declined: 0, planned: 0 },
      removedPaths: [],
      actions: []
    };
  }

  const manifest = getCleanupManifest(options.manifestId);
  const actions: CleanupAction[] = [];
  const removedPaths: string[] = [];

  for (const entry of manifest.entries) {
    const state = await pathState(options.targetDir, entry.path);

    if (state === 'missing') {
      actions.push({
        path: entry.path,
        kind: entry.kind,
        disposition: entry.disposition,
        status: 'missing',
        reason: entry.reason
      });
      continue;
    }

    if (state !== entry.kind) {
      actions.push({
        path: entry.path,
        kind: entry.kind,
        disposition: entry.disposition,
        status: 'prompt-required',
        reason: `${entry.reason}; expected ${entry.kind} but found ${state}`
      });
      continue;
    }

    if (entry.disposition === 'safe-delete') {
      if (options.dryRun) {
        actions.push({
          path: entry.path,
          kind: entry.kind,
          disposition: entry.disposition,
          status: 'planned',
          reason: entry.reason
        });
      } else {
        await rm(path.join(options.targetDir, entry.path), { recursive: true, force: false });
        removedPaths.push(entry.path);
        actions.push({
          path: entry.path,
          kind: entry.kind,
          disposition: entry.disposition,
          status: 'deleted',
          reason: entry.reason
        });
      }
      continue;
    }

    let decision: boolean | null;
    if (options.confirmCleanup) {
      decision = await options.confirmCleanup(entry);
    } else if (options.cleanupConfirmAll === true) {
      decision = true;
    } else if (options.nonInteractive === true) {
      decision = null;
    } else if (options.dryRun) {
      decision = null;
    } else {
      decision = await promptForCleanup(entry);
    }

    if (decision === null) {
      actions.push({
        path: entry.path,
        kind: entry.kind,
        disposition: entry.disposition,
        status: 'prompt-required',
        reason: entry.reason
      });
      continue;
    }

    if (!decision) {
      actions.push({
        path: entry.path,
        kind: entry.kind,
        disposition: entry.disposition,
        status: 'declined',
        reason: entry.reason
      });
      continue;
    }

    if (options.dryRun) {
      actions.push({
        path: entry.path,
        kind: entry.kind,
        disposition: entry.disposition,
        status: 'planned',
        reason: entry.reason
      });
      continue;
    }

    await rm(path.join(options.targetDir, entry.path), { recursive: true, force: false });
    removedPaths.push(entry.path);
    actions.push({
      path: entry.path,
      kind: entry.kind,
      disposition: entry.disposition,
      status: 'deleted',
      reason: entry.reason
    });
  }

  const summary = summarize(actions);
  const hasPromptRequired = summary.promptRequired > 0;
  const status = options.dryRun ? 'dry-run' : hasPromptRequired ? 'blocked' : 'applied';

  return {
    enabled: true,
    manifestId: manifest.id,
    status,
    summary,
    removedPaths,
    actions
  };
}
