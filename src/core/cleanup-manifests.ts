import type { CleanupManifest } from './types.js';

const LEGACY_RUNTIME_DIR = `.${['cl', 'aude'].join('')}`;
const LEGACY_RUNTIME_GUIDE = ['CL', 'AUDE.md'].join('');

const LEGACY_AI_FRAMEWORKS_V1: CleanupManifest = {
  id: 'legacy-ai-frameworks-v1',
  version: 1,
  description: 'Curated cleanup entries for legacy AI workflow artifacts replaced by ai-harness.',
  entries: [
    {
      id: 'legacy-runtime-dir',
      path: LEGACY_RUNTIME_DIR,
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy assistant runtime directory replaced by the .codex runtime surface'
    },
    {
      id: 'legacy-role-briefs-dir',
      path: '.agents',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy role-brief directory replaced by .codex/agents'
    },
    {
      id: 'legacy-runtime-guide',
      path: LEGACY_RUNTIME_GUIDE,
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy assistant root guide replaced by AGENTS.md and .codex/README.md'
    },
    {
      id: 'legacy-governance-constitution',
      path: 'CONSTITUTION.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy governance placeholder replaced by .planning/, .rules/, and AGENTS.md'
    },
    {
      id: 'legacy-governance-vision',
      path: 'VISION.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy vision placeholder replaced by .planning/PROJECT.md and requirements docs'
    },
    {
      id: 'legacy-planning-traceability',
      path: '.planning/TRACEABILITY.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy traceability placeholder replaced by traceability inside .planning/REQUIREMENTS.md'
    },
    {
      id: 'legacy-broad-cognee-sync',
      path: '.codex/scripts/sync-to-cognee.sh',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'replaced by the planning-focused sync-planning-to-cognee.sh flow'
    },
    {
      id: 'legacy-session-handoff-template',
      path: '.codex/templates/session-handoff.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'removed from the current .codex runtime surface'
    }
  ]
};

const BUILTIN_MANIFESTS = new Map<string, CleanupManifest>([[LEGACY_AI_FRAMEWORKS_V1.id, LEGACY_AI_FRAMEWORKS_V1]]);

export function listCleanupManifestIds(): string[] {
  return [...BUILTIN_MANIFESTS.keys()];
}

export function getCleanupManifest(manifestId: string): CleanupManifest {
  const manifest = BUILTIN_MANIFESTS.get(manifestId);
  if (!manifest) {
    const choices = listCleanupManifestIds().join(', ');
    throw new Error(`Unknown cleanup manifest: ${manifestId}. Available manifests: ${choices}`);
  }

  return manifest;
}
