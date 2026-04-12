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
      reason: 'legacy assistant runtime directory replaced by the Pi-native `AGENTS.md` + `.pi/*` baseline',
    },
    {
      id: 'legacy-role-briefs-dir',
      path: '.agents',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy role-brief directory replaced by `.pi/skills/*` and `.pi/prompts/*`',
    },
    {
      id: 'legacy-runtime-guide',
      path: LEGACY_RUNTIME_GUIDE,
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy assistant root guide replaced by `AGENTS.md` and `.pi/SYSTEM.md`',
    },
    {
      id: 'legacy-governance-constitution',
      path: 'CONSTITUTION.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy governance placeholder replaced by `AGENTS.md`, `.pi/*`, and repo-local workflow docs',
    },
    {
      id: 'legacy-governance-vision',
      path: 'VISION.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'legacy vision placeholder replaced by README.md, `AGENTS.md`, and repo-local handoff or planning docs',
    },
    {
      id: 'legacy-gsd-planning-workspace',
      path: '.planning',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy repo-local planning workspace removed from the greenfield pi-native baseline and only worth keeping when a repository intentionally owns that convention',
    },
    {
      id: 'legacy-sisyphus-archive',
      path: '.sisyphus',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'historical planning and evidence archive removed from the greenfield pi-native baseline',
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
      reason: 'legacy GSD-era Cognee rule replaced by the current Beads + Cognee workflow guidance',
    },
    {
      id: 'legacy-omp-runtime-dir',
      path: '.omp',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy OMP runtime directory replaced by `.pi/skills/*` and `.pi/extensions/*`',
    },
    {
      id: 'legacy-taskplane-marker',
      path: '.pi/taskplane.json',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'deprecated taskplane marker replaced by the pi-subagents package and `.pi/agents/*`',
    },
    {
      id: 'legacy-mythic-role-lead',
      path: '.pi/agents/sisyphus.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'deprecated mythological workflow role replaced by `.pi/agents/lead.md`',
    },
    {
      id: 'legacy-mythic-role-plan',
      path: '.pi/agents/prometheus.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'deprecated mythological workflow role replaced by `.pi/agents/plan.md`',
    },
    {
      id: 'legacy-mythic-role-build',
      path: '.pi/agents/hephaestus.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'deprecated mythological workflow role replaced by `.pi/agents/build.md`',
    },
    {
      id: 'legacy-mythic-role-review',
      path: '.pi/agents/oracle.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'deprecated mythological workflow role replaced by `.pi/agents/review.md`',
    },
    {
      id: 'legacy-repo-local-bake-prompt',
      path: '.pi/prompts/bake.md',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'stale repo-local `/bake` prompt shadowed by the user-global `/bake` surface; use `/skill:bake` for baked repos',
    },
    {
      id: 'legacy-repo-local-bake-script',
      path: 'scripts/bake.sh',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'stale repo-local bake shell fallback replaced by the user-global `/bake` surface',
    },
    {
      id: 'legacy-codex-runtime-dir',
      path: '.codex',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy Codex compatibility/runtime directory replaced by `.pi/*`, `AGENTS.md`, and `scripts/*`',
    },
    {
      id: 'legacy-rules-runtime-dir',
      path: '.rules',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'legacy rules runtime directory replaced by `AGENTS.md`, `.pi/*`, and repo docs',
    },
    {
      id: 'legacy-omo-contract',
      path: '.rules/patterns/omo-agent-contract.md',
      kind: 'file',
      disposition: 'prompt-before-delete',
      reason: 'deprecated OMO contract replaced by direct Pi-native workflow instructions',
    },
    {
      id: 'legacy-opencode-runtime-dir',
      path: '.opencode',
      kind: 'directory',
      disposition: 'prompt-before-delete',
      reason: 'deprecated extra-assistant plugin/config directory removed from the vanilla Pi baseline',
    },
    {
      id: 'legacy-broad-cognee-sync',
      path: '.codex/scripts/sync-to-cognee.sh',
      kind: 'file',
      disposition: 'safe-delete',
      reason: 'removed from the current pi-native baseline',
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
      reason: 'removed from the current pi-native baseline',
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
