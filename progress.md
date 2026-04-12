# Progress

## Work Item
untracked — make `/bake` global-only.

## Status
Completed

## Test Strategy
Hybrid, integration-led.
- Cognee brief attempted with `./scripts/cognee-brief.sh "make /bake global-only remove repo-local /bake command and local collisions while keeping global scaffolding workflow"` and was unavailable because datasets are not seeded.
- RED (environment): an initial focused run failed before implementation because local deps were not installed: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts` -> `vitest: command not found` / missing `node_modules`.
- RED (behavior/contract): focused subagent runs then updated failing seams for scaffold, doctor, cleanup, and global-launcher expectations before code/doc changes were completed.

## Tasks
- [x] Remove baked-repo-local `/bake` command surfaces from repo-local extensions and scaffold generation.
- [x] Remove the baked-repo-local `/bake` prompt collision and keep `/skill:bake` as the local explanation surface.
- [x] Rewrite repo docs and baked-repo guidance so `/bake` is user-global-only.
- [x] Update doctor to stop requiring local `/bake` surfaces and fail on stale/shadowing local bake artifacts.
- [x] Add cleanup coverage so existing-repo refresh removes stale `.pi/prompts/bake.md` and `scripts/bake.sh`.
- [x] Add launcher coverage proving the authoritative global `/bake` surface still auto-detects new vs existing targets and injects cleanup defaults.
- [x] Align focused tests and dogfood/template parity with the new contract.

## Files Changed
- `.pi/extensions/repo-workflows.ts` - removed repo-local `/bake`; kept only repo-local utility commands.
- `.pi/prompts/adopt.md` - updated baked-repo adoption guidance to point at user-global `/bake` and `/skill:bake`.
- `.pi/prompts/bake.md` - removed local `/bake` prompt surface.
- `.pi/skills/bake/SKILL.md` - reframed bake guidance around user-global `/bake` and local `/skill:bake`.
- `README.md` - documented `/bake` as global-only and removed local fallback language.
- `docs/bake-usage.md` - rewrote the bake runbook around global execution plus repo-local explanation.
- `docs/pi-harness-map.md` - updated mapping language to remove the generated repo-local `/bake` command assumption.
- `scripts/bake.sh` - removed the obsolete baked-repo-local bake backend.
- `src/commands/doctor.ts` - removed local `/bake` requirements and added shadowing/stale-artifact failures.
- `src/core/cleanup-manifests.ts` - added stale local bake artifacts to curated cleanup.
- `src/generators/pi.ts` - stopped scaffolding `.pi/prompts/bake.md` and `scripts/bake.sh`.
- `src/templates/pi/extensions/repo-workflows.ts` - mirrored repo-local extension cleanup.
- `src/templates/pi/prompts/adopt.md` - aligned template adopt guidance.
- `src/templates/pi/prompts/bake.md` - removed template local `/bake` prompt surface.
- `src/templates/pi/scripts/bake.sh` - removed template local bake backend.
- `src/templates/pi/skills/bake/SKILL.md` - aligned template bake guidance to global-only `/bake`.
- `src/templates/root/README.md` - aligned scaffold README text to the global-only `/bake` contract.
- `tests/unit/cleanup.test.ts` - covers stale bake artifact cleanup.
- `tests/unit/local-launcher.test.ts` - covers global `/bake` argument shaping for new/existing targets.
- `tests/integration/beads-wrapper.test.ts` - aligned README/skill expectations.
- `tests/integration/cli-doctor.test.ts` - aligned doctor CLI expectations and shadowing failures.
- `tests/integration/cli-init.test.ts` - covers existing-repo cleanup removing stale local bake artifacts.
- `tests/integration/docs-alignment.test.ts` - aligned repo/template parity assertions.
- `tests/integration/doctor.test.ts` - covers stale local bake surfaces as failures.
- `tests/integration/global-bake-install.test.ts` - covers installed global `/bake` dispatch for new and existing targets.
- `tests/integration/init.test.ts` - aligned scaffold baseline expectations.
- `tests/integration/scaffold-snapshots.test.ts` - aligned snapshot expectations.
- `tests/integration/bake-script.test.ts` - removed because the local bake backend is no longer part of the contract.
- `wave.md`, `plan.md`, `review.md`, `progress.md` - captured routing, plan, review, and execution evidence for this session.

## Verification Evidence
- RED: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts`
  - failed initially because local dependencies were not installed (`vitest: command not found`).
- GREEN:
  - `pnpm install`
  - `pnpm test -- tests/unit/cleanup.test.ts tests/unit/local-launcher.test.ts tests/integration/global-bake-install.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-init.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/beads-wrapper.test.ts`
- REFACTOR safety:
  - `pnpm typecheck`
  - `pnpm build`
  - review follow-up in `review.md` now says the main earlier blockers are resolved and the branch is ready for caller-side verification.

## Notes
- `bd ready --json` returned `[]`, so this work stayed `untracked`.
- Parallel subagent waves were used where file ownership was explicit:
  - runtime/scaffold removal
  - prompt/skill cleanup
  - README/docs cleanup
  - doctor/tests alignment
  - cleanup/launcher hardening
- Remaining caveat from review: there is still no single installed-extension end-to-end test that both injects existing-repo cleanup args and then proves a clean post-refresh doctor result in one scenario, though the behavior is covered in focused pieces.