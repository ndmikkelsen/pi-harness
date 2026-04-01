import os from 'node:os';
import path from 'node:path';

import type { OpenCodeSkillEntry, OpenCodeWorkflowEntry } from './types.js';
import { loadTemplate } from './template-loader.js';

export const OPENCODE_SKILL_REPO_NAME = 'ai-harness';
export const OPENCODE_SKILL_NAME = 'harness';

export function defaultOpenCodeSkillsRoot(): string {
  return path.join(os.homedir(), '.opencode', 'skills');
}

export function defaultOpenCodeConfigRoot(): string {
  return path.join(os.homedir(), '.config', 'opencode');
}

export function openCodeSkillInstallDir(targetRoot = defaultOpenCodeSkillsRoot()): string {
  return path.join(targetRoot, OPENCODE_SKILL_REPO_NAME);
}

export function openCodeWorkflowInstallDir(configRoot = defaultOpenCodeConfigRoot()): string {
  return path.join(configRoot, 'get-shit-done', 'workflows');
}

export function buildOpenCodeSkillEntries(): OpenCodeSkillEntry[] {
  return [
    {
      path: `skills/${OPENCODE_SKILL_NAME}/SKILL.md`,
      content: () => loadTemplate('codex/skills/harness/SKILL.md')
    },
    {
      path: `skills/${OPENCODE_SKILL_NAME}/references/ai-harness-command-matrix.md`,
      content: () => loadTemplate('codex/skills/harness/references/ai-harness-command-matrix.md')
    },
    {
      path: `skills/${OPENCODE_SKILL_NAME}/references/existing-repo-context-checklist.md`,
      content: () => loadTemplate('codex/skills/harness/references/existing-repo-context-checklist.md')
    },
    {
      path: `skills/${OPENCODE_SKILL_NAME}/references/scaffold-customization-map.md`,
      content: () => loadTemplate('codex/skills/harness/references/scaffold-customization-map.md')
    },
    {
      path: `skills/${OPENCODE_SKILL_NAME}/references/manifest-discovery.md`,
      content: () => loadTemplate('codex/skills/harness/references/manifest-discovery.md')
    },
    {
      path: `skills/${OPENCODE_SKILL_NAME}/assets/adoption-notes-template.md`,
      content: () => loadTemplate('codex/skills/harness/assets/adoption-notes-template.md')
    }
  ];
}

export function buildOpenCodeWorkflowEntries(): OpenCodeWorkflowEntry[] {
  return [
    {
      path: 'get-shit-done/workflows/autonomous.md',
      content: () => loadTemplate('opencode/get-shit-done/workflows/autonomous.md')
    }
  ];
}
