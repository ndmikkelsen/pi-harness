# Implementation Plan

## Work Item
untracked — make `/bake` global-only.

## Knowledge Inputs
- Cognee brief attempted and unavailable because datasets are not seeded.
- Local evidence from `README.md`, `docs/bake-usage.md`, `.pi/extensions/repo-workflows.ts`, `.pi/prompts/bake.md`, `.pi/skills/bake/SKILL.md`, `src/local-launcher.ts`, `src/templates/**`, `src/commands/doctor.ts`, and integration tests.

## Goal
Keep the Pi-native `/bake` entrypoint global-only while removing baked-repo-local `/bake` command collisions and duplicated backend assumptions.

## Approach
1. Preserve the user-global launcher installed by `pnpm install:local` as the only `/bake` slash-command implementation.
2. Remove baked-repo-local `/bake` surfaces that currently collide: repo extension registration, local `/bake` prompt, and duplicated backend script.
3. Keep repo-local `/skill:bake` guidance, but rewrite it to explain the global `/bake` contract instead of advertising a local slash command.
4. Update scaffold generation, doctor validation, and focused integration tests to match the new global-only contract.

## Test Strategy
Hybrid, integration-led.

## RED
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts`
  - Current failures should demonstrate that the scaffold still expects repo-local `/bake` surfaces.

## GREEN
- Remove repo-local `/bake` command/backend generation and local prompt collision.
- Update docs/skills and doctor expectations to describe `/bake` as user-global-only while preserving `/skill:bake` guidance.

## REFACTOR
- Simplify repo-local `repo-workflows.ts` so it only exposes non-bake utility commands.
- Remove now-dead bake script references and keep template parity clean.

## Tasks
1. Runtime/scaffold surface: remove repo-local `/bake` registration and `scripts/bake.sh` generation while preserving other repo-local utility commands.
2. Docs/skills/prompts: rewrite repo docs and baked-repo guidance for global-only `/bake`; remove the local `.pi/prompts/bake.md` slash collision; keep `/skill:bake` guidance coherent.
3. Doctor/tests: update doctor rules and focused integration expectations so baked repos no longer require local `/bake` surfaces.

## Dependencies
- Decide the contract first: global `/bake` remains canonical, baked repos no longer ship a local `/bake` command or local `/bake` prompt.
- If `.pi/prompts/bake.md` is removed, all generator, doctor, and scaffold tests that require it must be updated in the same change wave.

## Verification
- `pnpm test -- tests/integration/global-bake-install.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-init.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`

## Risks
- Docs/tests may still imply `scripts/bake.sh` remains a supported fallback; that wording must be made consistent.
- The scaffold may still want to ship `/skill:bake` guidance, so prompt removal must not accidentally remove the explain-first path.
- Doctor should ideally fail on repo-local `/bake` shadowing once the new contract is in place.