import type { AssistantSelection, AssistantTarget } from './types.js';

export function isCodexCompatibleAssistant(value: AssistantTarget | AssistantSelection): boolean {
  return value === 'codex' || value === 'opencode';
}

export function assistantDisplayName(value: AssistantTarget): string {
  if (value === 'opencode') return 'OpenCode';
  if (value === 'codex') return 'Codex';
  return 'Claude';
}

export function codexCompatibilityLabel(value: AssistantTarget): string {
  return value === 'opencode' ? 'OpenCode' : 'Codex';
}
