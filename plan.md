# Implementation Plan

## Work Item
`pi-harness-edk` — Add a separate dev-to-main promotion workflow

## Goal
Keep feature-branch `/serve` focused on PRs to `dev`, and add a separate explicit release step that pushes `dev` upstream and creates or refreshes a PR to `main`.

## Knowledge Inputs
- Active Beads issue: `pi-harness-edk`
- Child tasks: `pi-harness-edk.2`, `pi-harness-edk.1`, `pi-harness-edk.3`
- Cognee brief attempted with `./scripts/cognee-brief.sh "dev to main promotion workflow release step ensure local changes land upstream dev main"`, but it was stale and still referenced legacy `land.sh`; local repo files remained authoritative.
- Primary sources: `AGENTS.md`, `README.md`, `.pi/prompts/serve.md`, `scripts/serve.sh`, `src/generators/pi.ts`, `src/commands/doctor.ts`, and the existing integration tests under `tests/integration/`.

## Test Strategy
Hybrid, integration-led.
- RED: `pnpm test -- tests/integration/promote-script.test.ts`
- GREEN: implement `scripts/promote.sh`, `.pi/prompts/promote.md`, and matching scaffold/template wiring.
- REFACTOR safety net: `pnpm test -- tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/serve-script.test.ts`

## Tasks
1. Add failing integration coverage for a dedicated promotion script.
2. Implement the runtime/template promotion workflow for `dev` -> `main`.
3. Align docs, doctor checks, and scaffold parity around the new release-step split.

## Verification
- `pnpm typecheck`
- `pnpm test -- tests/integration/serve-script.test.ts tests/integration/promote-script.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts`
