import type { ManagedEntry, ScaffoldContext } from '../core/types.js';
import { isCodexCompatibleAssistant } from '../core/assistant.js';
import { buildClaudeEntries } from './claude.js';
import { buildConfigEntries } from './config.js';
import { buildCodexEntries } from './codex.js';
import { buildPlanningEntries } from './planning.js';
import { buildProjectDocEntries } from './project-docs.js';
import { buildRootEntries } from './root.js';
import { buildRuleEntries } from './rules.js';

export function buildManagedEntries(context: ScaffoldContext): ManagedEntry[] {
  return [
    ...buildRootEntries(),
    ...buildPlanningEntries(),
    ...buildClaudeEntries(),
    ...(isCodexCompatibleAssistant(context.assistant) ? buildCodexEntries() : []),
    ...buildConfigEntries(),
    ...buildRuleEntries(),
    ...buildProjectDocEntries()
  ];
}
