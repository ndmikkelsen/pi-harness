# Implementation Plan

## Work Item
untracked — make `/serve` work the Pi-native way by removing the colliding extension command and keeping serving as a prompt-driven workflow.

## Knowledge Inputs
Cognee skipped because the scope is narrow and local repo evidence is sufficient. `bd ready --json` returned no ready Beads issues.

## Goal
Ensure local Pi repos use `/serve` as a prompt-native workflow entrypoint while `scripts/serve.sh` remains the publishing backend.

## Approach
1. Remove the `serve` registration from the repo workflow extension in both dogfood and scaffold templates.
2. Update the serve prompt in both dogfood and scaffold templates so `/serve` explicitly instructs the agent to gather readiness context and invoke `./scripts/serve.sh --commit-message "..."` when publish is allowed.
3. Relax doctor/runtime test expectations so the repo workflow extension only needs the non-colliding command glue while `scripts/serve.sh` and `.pi/prompts/serve.md` remain the serving surfaces.

## Test Strategy
Hybrid, prompt-led.

## RED
Update the narrow integration/doctor assertions to stop expecting `registerCommand('serve')` in `.pi/extensions/repo-workflows.ts`, then run the narrow test set and confirm failure against the current implementation.

## GREEN
Remove the extension command, refresh the serve prompt guidance, and align doctor/runtime expectations.

## REFACTOR
Keep template/dogfood parity intact and rerun the same narrow verification set.

## Verification
`pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- `pnpm test -- tests/integration/cli-doctor.test.ts`

## Risks
- Existing Pi sessions may need a restart after scaffold refresh so prompt routing wins over any previously loaded extension command.
