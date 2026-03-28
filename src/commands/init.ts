import path from 'node:path';

import { runCleanup } from '../core/cleanup.js';
import { ensureGitRepository } from '../core/git.js';
import { applyManagedEntries } from '../core/filesystem.js';
import { DEFAULT_POLICY } from '../core/policy.js';
import { resolvePorts } from '../core/port-detection.js';
import { resolveProjectInput } from '../core/project-input.js';
import type { InitCommandOptions, InitResult, ScaffoldContext } from '../core/types.js';
import { buildManagedEntries } from '../generators/index.js';

export async function runInit(options: InitCommandOptions): Promise<InitResult> {
  const input = resolveProjectInput({
    cwd: options.cwd,
    projectArg: options.projectArg,
    targetArg: options.targetArg,
    mode: options.mode
  });

  const portSettings = resolvePorts({
    detectPorts: options.detectPorts,
    doltPort: options.doltPort,
    cogneeDbPort: options.cogneeDbPort,
    computeHost: options.computeHost ?? DEFAULT_POLICY.computeHost,
    computeUser: options.computeUser ?? DEFAULT_POLICY.computeUser,
    sshKeyPath: options.sshKeyPath ?? DEFAULT_POLICY.sshKeyPath
  });

  const context: ScaffoldContext = {
    ...input,
    assistant: options.assistant,
    doltPort: portSettings.doltPort,
    cogneeDbPort: portSettings.cogneeDbPort,
    computeHost: options.computeHost ?? DEFAULT_POLICY.computeHost,
    computeUser: options.computeUser ?? DEFAULT_POLICY.computeUser,
    sshKeyPath: options.sshKeyPath ?? DEFAULT_POLICY.sshKeyPath,
    registryHost: DEFAULT_POLICY.registryHost,
    generatedOn: new Date().toISOString().slice(0, 10)
  };

  if (options.cleanupManifestId && context.mode !== 'existing') {
    throw new Error('Cleanup manifests can only be used in existing-project mode.');
  }

  const cleanup = await runCleanup({
    targetDir: context.targetDir,
    manifestId: options.cleanupManifestId,
    dryRun: options.dryRun,
    nonInteractive: options.nonInteractive,
    confirmCleanup: options.confirmCleanup
  });

  const entryResult = await applyManagedEntries(context, buildManagedEntries(context), {
    targetDir: context.targetDir,
    force: options.force,
    dryRun: options.dryRun,
    mergeRootFiles: options.mergeRootFiles
  });

  const notes = [...portSettings.notes];
  if (!options.skipGit && !options.dryRun) {
    notes.push(...ensureGitRepository(context.targetDir));
  }

  return {
    ...entryResult,
    assistant: context.assistant,
    mode: context.mode,
    targetDir: context.targetDir,
    appName: context.appName,
    notes,
    cleanup
  };
}

export function formatInitReport(result: InitResult): string {
  const targetLabel = path.relative(process.cwd(), result.targetDir) || '.';
  const lines = [
    `Scaffolded ${result.appName} (${result.mode}, ${result.assistant}) in ${targetLabel}`,
    `Created: ${result.createdPaths.length}`,
    `Skipped: ${result.skippedPaths.length}`
  ];

  if (result.cleanup.enabled) {
    lines.push(`Cleanup removed: ${result.cleanup.summary.deleted}`);
    if (result.cleanup.summary.promptRequired > 0) {
      lines.push(`Cleanup prompts required: ${result.cleanup.summary.promptRequired}`);
    }
  }

  if (result.createdPaths.length > 0) {
    lines.push('', 'Created files:');
    for (const item of result.createdPaths.slice(0, 12)) {
      lines.push(`- ${item}`);
    }
    if (result.createdPaths.length > 12) {
      lines.push(`- ...and ${result.createdPaths.length - 12} more`);
    }
  }

  if (result.notes.length > 0) {
    lines.push('', 'Notes:');
    for (const note of result.notes) {
      lines.push(`- ${note}`);
    }
  }

  if (result.cleanup.enabled && result.cleanup.actions.length > 0) {
    lines.push('', 'Cleanup:');
    for (const action of result.cleanup.actions) {
      lines.push(`- ${action.path} (${action.status})`);
    }
  }

  return `${lines.join('\n')}\n`;
}
