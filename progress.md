# Progress

## Work Item
`pi-harness-edk`

## Status
Completed

## Tasks
- [x] `pi-harness-edk.2` Add RED integration coverage for a dedicated `dev` -> `main` promotion script.
- [x] `pi-harness-edk.1` Implement `scripts/promote.sh`, `.pi/prompts/promote.md`, and scaffold-template parity.
- [x] `pi-harness-edk.3` Align runtime docs, doctor checks, init coverage, and scaffold snapshots with the serve-vs-promote split.

## Files Changed
- `scripts/promote.sh` / `src/templates/pi/scripts/promote.sh` — added the new release-step script that only runs from `dev`, pushes `dev`, and creates or refreshes a PR to `main` with an explicit commit-summary body.
- `.pi/prompts/promote.md` / `src/templates/pi/prompts/promote.md` — documented the prompt-native promotion workflow.
- `.pi/prompts/serve.md` / `src/templates/pi/prompts/serve.md` — clarified that `/serve` remains feature-branch-only and that `dev` -> `main` promotion uses `/promote`.
- `AGENTS.md` / `src/templates/pi/AGENTS.md` — added promotion workflow references and release-lane authority guidance.
- `README.md` / `src/templates/root/README.md` — surfaced `/promote` and the separate `dev` release step in the scaffold guidance.
- `docs/bake-usage.md` — documented the serve/promote split in the bake usage guide.
- `src/generators/pi.ts` — added promote prompt/script scaffold entries.
- `src/commands/doctor.ts` — added promote prompt/script alignment checks.
- `tests/integration/promote-script.test.ts` — new promotion integration coverage.
- `tests/integration/doctor.test.ts`, `tests/integration/docs-alignment.test.ts`, `tests/integration/init.test.ts`, `tests/integration/scaffold-snapshots.test.ts` — aligned parity and regression coverage.

## RED -> GREEN -> REFACTOR Evidence
- RED: `pnpm test -- tests/integration/promote-script.test.ts` failed because `scripts/promote.sh` did not exist.
- GREEN: added the promotion script/prompt/runtime wiring and reran `pnpm test -- tests/integration/promote-script.test.ts` successfully.
- REFACTOR: `pnpm typecheck` plus `pnpm test -- tests/integration/serve-script.test.ts tests/integration/promote-script.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts` passed.
