import type { ManagedEntry, ScaffoldContext } from '../core/types.js';
import { buildConfigEntries } from './config.js';
import { buildCodexEntries } from './codex.js';
import { buildOmpEntries } from './omp.js';
import { buildProjectDocEntries } from './project-docs.js';
import { buildRootEntries } from './root.js';
import { buildRuleEntries } from './rules.js';

export function buildManagedEntries(context: ScaffoldContext): ManagedEntry[] {
  return [
    ...buildRootEntries(),
    ...buildOmpEntries(),
    ...buildCodexEntries(),
    ...buildConfigEntries(),
    ...buildRuleEntries(),
    ...buildProjectDocEntries()
  ];
}
