# Execution Approach

## Mode
Parallel wave

## Work Item
untracked

## Knowledge
Cognee attempted with `./scripts/cognee-brief.sh "make /bake global-only remove repo-local /bake command and local collisions while keeping global scaffolding workflow"` and was unavailable because datasets are not seeded. Wave shape is based on repository evidence from `README.md`, `.pi/prompts/bake.md`, `.pi/skills/bake/SKILL.md`, `.pi/extensions/repo-workflows.ts`, `src/local-launcher.ts`, `src/templates/**`, `src/commands/doctor.ts`, and the integration test suite.

## Test Strategy
Hybrid, integration-led.
- RED: focused integration failures should confirm the current scaffold still ships repo-local `/bake` surfaces and duplicate local docs/doctor expectations.
- GREEN: remove repo-local `/bake` command/backend surfaces, keep the user-global launcher authoritative, and realign docs/doctor/tests around the new global-only contract.
- REFACTOR: keep repo-local `bootstrap-worktree` and `cognee-brief` utility commands intact while simplifying baked-repo setup guidance.

## Agents / Chains
Parallel build wave with isolated worktrees after lead-level wave shaping:
1. Runtime/scaffold surface task: remove repo-local `/bake` command/backend from scaffolded repos while preserving non-bake repo utilities.
2. Docs/skills/prompts task: rewrite baked-repo guidance around global-only `/bake`, keep `/skill:bake` as guidance, and remove the local `/bake` prompt collision.
3. Doctor/tests task: update scaffold/runtime validation and focused integration expectations to match the new contract.

## Verification
Caller-side verification after the wave:
- `pnpm test -- tests/integration/global-bake-install.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-init.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`

## Risks
- Removing repo-local `/bake` touches generated scaffold surfaces, dogfood copies, and doctor assumptions at once.
- `.pi/prompts/bake.md` likely needs removal or renaming to avoid reintroducing a local `/bake` slash command.
- `scripts/bake.sh` removal may ripple through init/snapshot tests and any docs that still describe it as a supported fallback.
- The global launcher contract in `src/local-launcher.ts` and `tests/integration/global-bake-install.test.ts` must remain intact while local collisions are removed.