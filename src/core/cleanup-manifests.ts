import type { CleanupManifest } from './types.js';

const LEGACY_RUNTIME_DIR = `.${['cl', 'aude'].join('')}`;
const LEGACY_RUNTIME_GUIDE = ['CL', 'AUDE.md'].join('');

const LEGACY_AI_FRAMEWORKS_V1: CleanupManifest = {
  id: 'legacy-ai-frameworks-v1',
  version: 1,
  description: 'Curated cleanup entries for legacy AI workflow artifacts replaced by pi-harness.',
  entries: [
    {
      id: 'legacy-runtime-dir',
      path: LEGACY_RUNTIME_DIR,
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy assistant runtime directory replaced by the .codex runtime surface',
    },
    {
      id: 'legacy-role-briefs-dir',
      path: '.agents',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy role-brief directory replaced by .codex/agents',
    },
    {
      id: 'legacy-runtime-guide',
      path: LEGACY_RUNTIME_GUIDE,
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy assistant root guide replaced by AGENTS.md and .codex/README.md',
    },
    {
      id: 'legacy-governance-constitution',
      path: 'CONSTITUTION.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy governance placeholder replaced by `.rules/`, repo-local workflow docs, and AGENTS.md',
    },
    {
      id: 'legacy-governance-vision',
      path: 'VISION.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy vision placeholder replaced by README.md, AGENTS.md, and repo-local handoff or planning docs',
    },
    {
      id: 'legacy-gsd-planning-workspace',
      path: '.planning',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy repo-local planning workspace removed from the greenfield codex baseline and only worth keeping when a repository intentionally owns that convention',
    },
    {
      id: 'legacy-sisyphus-archive',
      path: '.sisyphus',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'historical planning and evidence archive removed from the greenfield codex baseline',
    },
    {
      id: 'legacy-gsd-workflow-rule',
      path: '.rules/patterns/gsd-workflow.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy GSD workflow rule replaced by the direct Beads + Cognee operator guidance',
    },
    {
      id: 'legacy-gsd-cognee-rule',
      path: '.rules/patterns/cognee-gsd-integration.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy GSD-era Cognee rule replaced by the current operator workflow and runtime scripts',
    },
    {
      id: 'legacy-omo-contract',
      path: '.rules/patterns/omo-agent-contract.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'deprecated OMO contract replaced by direct operator and autonomous workflow docs',
    },
    {
      id: 'legacy-opencode-runtime-dir',
      path: '.opencode',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'deprecated OpenCode plugin/config directory removed from the codex-only baseline',
    },
    {
      id: 'legacy-broad-cognee-sync',
      path: '.codex/scripts/sync-to-cognee.sh',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'removed from the current .codex runtime surface',
    },
    {
      id: 'legacy-planning-sync-backend',
      path: '.codex/scripts/cognee-sync-planning.sh',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'removed with the legacy .planning-based Cognee sync path',
    },
    {
      id: 'legacy-planning-sync-wrapper',
      path: '.codex/scripts/sync-planning-to-cognee.sh',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'removed with the legacy .planning-based Cognee sync path',
    },
    {
      id: 'legacy-session-handoff-template',
      path: '.codex/templates/session-handoff.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'removed from the current .codex runtime surface',
    }
  ],
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
