# Context

## Work Item
untracked

## Cognee
Pending refresh for this broader gap-analysis lane.

## User concern
The local harness no longer mirrors what the scaffold emits. The user specifically called out:
- duplicate `.codex/docker` vs `.docker`
- lingering Codex/OMP/OMO-era scaffolding assets even though the live repo now uses Pi-native surfaces

## Initial evidence
- Active scaffold assembly only comes from `src/generators/root.ts`, `src/generators/pi.ts`, `src/generators/config.ts`, and `src/generators/project-docs.ts` via `src/generators/index.ts`.
- `src/generators/codex.ts`, `src/generators/omp.ts`, and `src/generators/rules.ts` still exist but are not wired into `buildManagedEntries(...)`.
- `src/templates/codex/docker/Dockerfile.cognee` is byte-identical to `src/templates/pi/.docker/Dockerfile.cognee`.
- `src/templates/codex/**`, `src/templates/omp/**`, and `src/templates/rules/**` still describe legacy compatibility/runtime models based on `.rules/`, `.omp/`, and `.codex/`.
- `scripts/copy-templates.mjs` copies all of `src/templates`, so dormant compatibility templates are still shipped in `dist/` even though the active scaffold does not emit them.
- Cleanup logic in `src/core/cleanup-manifests.ts` and stale-runtime detection in `src/commands/doctor.ts` intentionally still reference `.codex`, `.rules`, and OMO-era legacy surfaces, but only as adoption cleanup / stale artifact detection.

## Likely gap categories
1. Dead compatibility scaffold source still checked into `src/templates/codex/**`, `src/templates/omp/**`, `src/templates/rules/**`, and unused generators `src/generators/{codex,omp,rules}.ts`.
2. Duplicate Dockerfile template under `src/templates/codex/docker/Dockerfile.cognee`.
3. Missing regression coverage that asserts the active scaffold source graph matches the dogfooded local harness, not just emitted outputs.
4. Need a clear decision boundary between retained cleanup support for legacy repos vs removed compatibility runtime sources for new scaffolds.

## File map
- Active scaffold entrypoint: `src/generators/index.ts`
- Active Pi-native generators: `src/generators/{root,pi,config,project-docs}.ts`
- Dormant compatibility generators: `src/generators/{codex,omp,rules}.ts`
- Active Dockerfile template: `src/templates/pi/.docker/Dockerfile.cognee`
- Duplicate compatibility Dockerfile template: `src/templates/codex/docker/Dockerfile.cognee`
- Dormant template trees: `src/templates/{codex,omp,rules}/**`
- Legacy cleanup boundary: `src/core/cleanup-manifests.ts`, `src/commands/doctor.ts`
- Dist copy path: `scripts/copy-templates.mjs`

## Next actions
- Attempt fresh Cognee brief for scaffold-vs-dogfood gap analysis.
- Create Beads issues for each confirmed actionable gap.
