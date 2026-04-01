# Initialize A New AI Workflow Project Implementation Plan

## Goals

- Keep the greenfield scaffold flow behavior-first and executable.
- Prove that new-project setup still creates the expected runtime, planning, and assistant compatibility files.
- Keep the executable BDD layer focused on user-visible setup behavior while leaving deep regression coverage in `tests/`.

## Scenarios Covered

- Create a new project scaffold into a new directory.
- Show a dry run without writing files.
- Prepare a new project for Codex.
- Prepare a new project for OpenCode.

## Execution Notes

- Drive the behavior through `runInit(...)` plus `formatInitReport(...)`.
- Keep Codex and OpenCode compatibility assertions at the scenario level.
- Leave deep file-count and migration edge cases in `tests/integration/init.test.ts`.

## Definition Of Done

- `apps/cli/features/init/init.feature` remains the behavior contract.
- `apps/cli/features/init/init.spec.ts` executes every scenario.
- `pnpm test:bdd` passes.
- Existing integration coverage in `tests/` stays green.
