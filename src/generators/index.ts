import type { ManagedEntry, ScaffoldContext } from '../core/types.js';
import { buildConfigEntries } from './config.js';
import { buildPiEntries } from './pi.js';
import { buildProjectDocEntries } from './project-docs.js';
import { buildRootEntries } from './root.js';

export function buildManagedEntries(context: ScaffoldContext): ManagedEntry[] {
  return [
    ...buildRootEntries(),
    ...buildPiEntries(),
    ...buildConfigEntries(),
    ...buildProjectDocEntries()
  ];
}
