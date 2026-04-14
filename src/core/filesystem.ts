import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

import type { ApplyManagedEntriesOptions, ApplyManagedEntriesResult, ManagedEntry, ScaffoldContext } from './types.js';

export async function applyManagedEntries(
  context: ScaffoldContext,
  entries: ManagedEntry[],
  options: ApplyManagedEntriesOptions
): Promise<ApplyManagedEntriesResult> {
  const createdPaths: string[] = [];
  const skippedPaths: string[] = [];

  for (const entry of entries) {
    const outputPath = path.join(options.targetDir, entry.path);

    if (entry.kind === 'directory') {
      if (!options.dryRun) {
        await mkdir(outputPath, { recursive: true });
      }
      continue;
    }

    if (existsSync(outputPath)) {
      const canMerge = entry.merge !== undefined && entry.mergeGroup === 'root' && options.mergeRootFiles === true;

      if (canMerge) {
        const existingContent = await readFile(outputPath, 'utf8');
        const mergedContent = entry.merge!(existingContent, context);

        if (mergedContent !== null && mergedContent !== existingContent) {
          createdPaths.push(entry.path);
          if (!options.dryRun) {
            await writeFile(outputPath, mergedContent, 'utf8');
            if (entry.executable) {
              await chmod(outputPath, 0o755);
            }
          }
          continue;
        }

        skippedPaths.push(entry.path);
        continue;
      }

      if (!options.force) {
        skippedPaths.push(entry.path);
        continue;
      }
    }

    createdPaths.push(entry.path);
    if (options.dryRun) {
      continue;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, entry.content(context), 'utf8');
    if (entry.executable) {
      await chmod(outputPath, 0o755);
    }
  }

  return { createdPaths, skippedPaths };
}
