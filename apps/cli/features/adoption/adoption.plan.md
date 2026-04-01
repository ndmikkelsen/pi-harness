# Adopt An Existing Project Implementation Plan

## Goals

- Keep existing-repo adoption preserve-by-default.
- Prove the main adoption variants through executable Gherkin scenarios.
- Keep edge-heavy cleanup and merge assertions in `tests/` while letting BDD cover the primary operator flows.

## Scenarios Covered

- Preserve existing scaffold files by default.
- Merge root scaffold entries only when explicitly requested.
- Remove curated legacy files when cleanup is enabled.
- Report prompt-required cleanup entries without deleting them.
- Add Codex-compatible files for both Codex and OpenCode targets.

## Execution Notes

- Drive the behavior through `runInit(...)` in `existing` mode.
- Reuse shared adoption helpers for root-file setup, cleanup fixtures, and assistant variants.
- Keep low-level cleanup matrix coverage in `tests/integration/init.test.ts` and `tests/integration/cli-init.test.ts`.

## Definition Of Done

- `apps/cli/features/adoption/adoption.feature` remains the behavior contract.
- `apps/cli/features/adoption/adoption.spec.ts` executes every scenario.
- `pnpm test:bdd` passes.
- Existing integration coverage in `tests/` stays green.
