import os from 'node:os';
import path from 'node:path';

import type { GsdDefaultsEntry, OpenCodeConfigEntry, OpenCodeSkillEntry, OpenCodeWorkflowEntry } from './types.js';
import { loadTemplate } from './template-loader.js';

type JsonObject = Record<string, unknown>;

function stableJsonStringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseJsonObject(content: string): JsonObject | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as JsonObject;
    }
  } catch {}

  return null;
}

function mergeOpenCodeDefaults(existingContent: string, generatedContent: string): string | null {
  const existing = parseJsonObject(existingContent);
  const generated = parseJsonObject(generatedContent);

  if (existing === null || generated === null) {
    return generatedContent;
  }

  const generatedAgents = (generated.agents ?? {}) as JsonObject;
  const generatedCategories = (generated.categories ?? {}) as JsonObject;
  const existingAgents = (existing.agents ?? {}) as JsonObject;
  const existingCategories = (existing.categories ?? {}) as JsonObject;

  const merged: JsonObject = {
    ...existing,
    agents: {
      ...existingAgents,
      ...generatedAgents
    },
    categories: {
      ...existingCategories,
      ...generatedCategories
    }
  };

  const mergedContent = stableJsonStringify(merged);
  return mergedContent === existingContent ? null : mergedContent;
}

function mergeGsdDefaults(existingContent: string, generatedContent: string): string | null {
  const existing = parseJsonObject(existingContent);
  const generated = parseJsonObject(generatedContent);

  if (existing === null || generated === null) {
    return generatedContent;
  }

  const generatedOverrides = (generated.model_overrides ?? {}) as JsonObject;
  const existingOverrides = (existing.model_overrides ?? {}) as JsonObject;

  const merged: JsonObject = {
    ...existing,
    model_profile: generated.model_profile,
    resolve_model_ids: generated.resolve_model_ids,
    model_overrides: {
      ...existingOverrides,
      ...generatedOverrides
    }
  };

  const mergedContent = stableJsonStringify(merged);
  return mergedContent === existingContent ? null : mergedContent;
}

export const OPENCODE_SKILL_REPO_NAME = 'ai-harness';
export const OPENCODE_SKILL_NAME = 'harness';

export function defaultOpenCodeSkillsRoot(): string {
  return path.join(os.homedir(), '.opencode', 'skills');
}

export function defaultOpenCodeConfigRoot(): string {
  return path.join(os.homedir(), '.config', 'opencode');
}

export function defaultGsdRoot(): string {
  return path.join(os.homedir(), '.gsd');
}

export function openCodeSkillInstallDir(targetRoot = defaultOpenCodeSkillsRoot()): string {
  return path.join(targetRoot, OPENCODE_SKILL_REPO_NAME);
}

export function openCodeWorkflowInstallDir(configRoot = defaultOpenCodeConfigRoot()): string {
  return path.join(configRoot, 'get-shit-done', 'workflows');
}

export function openCodeDefaultsFilePath(configRoot = defaultOpenCodeConfigRoot()): string {
  return path.join(configRoot, 'oh-my-opencode.json');
}

export function gsdDefaultsFilePath(gsdRoot = defaultGsdRoot()): string {
  return path.join(gsdRoot, 'defaults.json');
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

export function buildOpenCodeConfigEntries(): OpenCodeConfigEntry[] {
  return [
    {
      path: 'oh-my-opencode.json',
      content: () => loadTemplate('opencode/oh-my-opencode.json'),
      merge: mergeOpenCodeDefaults
    }
  ];
}

export function buildGsdDefaultsEntries(): GsdDefaultsEntry[] {
  return [
    {
      path: 'defaults.json',
      content: () => loadTemplate('gsd/defaults.json'),
      merge: mergeGsdDefaults
    }
  ];
}
