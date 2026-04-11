# Progress

## Work Item
pi-harness-cw9

## Completed
- Added `--cleanup-confirm-all` plumbing from CLI -> init -> cleanup so Pi-native bake flows can auto-confirm curated legacy AI-scaffolding cleanup without changing conservative fallback CLI behavior.
- Upgraded the installed global Pi `/bake` extension in `src/local-launcher.ts` to auto-detect new vs existing targets and apply existing-repo defaults (`--mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --init-json`).
- Added repo-local native `/bake` support through `.pi/extensions/repo-workflows.ts` and new `scripts/bake.sh` template/dogfood copies.
- Updated bake prompt/skill/docs to make `/bake` and `/skill:bake` the canonical setup path while leaving `/adopt` as the conservative compatibility path.
- Extended doctor/tests/BDD coverage for cleanup auto-confirm, native bake script behavior, scaffold outputs, and docs alignment.

## Changed Files
- `src/core/types.ts`
- `src/core/cleanup.ts`
- `src/cli.ts`
- `src/commands/init.ts`
- `src/local-launcher.ts`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `src/templates/pi/extensions/repo-workflows.ts`
- `src/templates/pi/scripts/bake.sh`
- `src/templates/pi/prompts/bake.md`
- `src/templates/pi/skills/bake/SKILL.md`
- `src/templates/root/README.md`
- `docs/bake-usage.md`
- `docs/pi-harness-map.md`
- dogfood copies under `.pi/`, `scripts/`, and `README.md`
- tests under `tests/**` and adoption steps under `apps/cli/features/steps/adoption.steps.ts`

## Verification
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- `pnpm test:smoke:dist`

## Beads / Cognee
- Active Beads issue: `pi-harness-cw9`
- Cognee brief attempted and unavailable because datasets are not seeded (`DatasetNotFoundError`).

## Notes
- Conservative raw CLI fallback remains available via `/adopt` and explicit `pi-harness --mode existing . --init-json`.
- Native `/bake` paths now drive the cleanup-confirming refresh behavior the user requested.
