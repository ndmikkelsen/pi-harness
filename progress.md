# Progress

## Closed issues
- `pi-harness-lz2.1` Closed
- `pi-harness-lz2.2` Closed
- `pi-harness-lz2.3` Closed

## Completed work
- Removed dormant scaffold generators:
  - `src/generators/codex.ts`
  - `src/generators/omp.ts`
  - `src/generators/rules.ts`
- Removed dormant template trees:
  - `src/templates/codex/**`
  - `src/templates/omp/**`
  - `src/templates/rules/**`
- Kept active Pi-native template roots only:
  - `src/templates/.config/**`
  - `src/templates/pi/**`
  - `src/templates/project-docs/**`
  - `src/templates/root/**`
- Added regression coverage:
  - `tests/unit/scaffold-source-graph.test.ts`
- Updated BDD/runtime docs to match the Pi-native baseline:
  - `apps/cli/features/init/*`
  - `apps/cli/features/adoption/*`
  - `apps/cli/features/steps/{init,adoption}.steps.ts`
- Documented the adoption cleanup boundary:
  - `src/core/cleanup-manifests.ts`
  - `src/commands/doctor.ts`
- Strengthened cleanup/doctor tests:
  - `tests/unit/cleanup.test.ts`
  - `tests/integration/doctor.test.ts`

## Verification
- `pnpm test -- tests/unit/scaffold-source-graph.test.ts tests/unit/cleanup.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/cli-doctor.test.ts tests/integration/beads-wrapper.test.ts tests/integration/cli-init.test.ts tests/integration/land-script.test.ts`
- `pnpm test:bdd`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:smoke:dist`

## Notes
- Parallel pi-subagents were used for recon/review on the three issues before implementation.
- Cognee remained unavailable during planning/recon, so repository evidence was used directly.
