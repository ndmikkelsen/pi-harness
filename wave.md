# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee skipped. `bd ready --json` returned no actionable work, and the task is narrow local Pi workflow behavior.

## Test Strategy
Hybrid, prompt-led. RED: remove extension-backed `/serve` expectations from the narrow scaffold and doctor tests so they fail against the current implementation. GREEN: keep `/serve` prompt-native by removing the colliding extension command, teach the serve prompt to drive `scripts/serve.sh --commit-message ...`, and update doctor/runtime expectations accordingly. REFACTOR: keep dogfood/template alignment and rerun the narrow verification set.

## Agents / Chains
Main session only. The change is small but cross-cuts dogfooded Pi runtime files, templates, and integration tests.

## Verification
`pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- `pnpm test -- tests/integration/cli-doctor.test.ts`

## Risks
- Pi prompt execution semantics are runtime-driven, so the scaffold can document and shape `/serve`, but cannot force upstream Pi UX beyond prompt/extension surfaces.
- Existing repos that already loaded the old extension command may need a Pi restart after refresh to pick up the prompt-only `/serve` behavior.
