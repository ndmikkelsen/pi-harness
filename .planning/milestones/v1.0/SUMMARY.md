# v1.0 Milestone Summary

## Outcome

`ai-harness` now ships the full v1 foundation it set out to deliver.

- New repositories can be scaffolded from a modular TypeScript CLI with shared planning, rules, and runtime assets.
- Existing repositories can adopt the scaffold in preserve-by-default mode, with curated cleanup and doctor guidance for known legacy workflow leftovers.
- OpenCode installs a global `harness` skill that runs the local `ai-harness` CLI against the current repo.
- Downstream repos now receive explicit scaffold baseline markers, local refresh guidance, and a documented `scaiff` migration stance.

## Requirement Coverage

- `CORE-01` through `CORE-03` landed in Phase 1 and are reflected in the current CLI, generators, and tests.
- `CORE-04` and `CORE-05` were verified in `.planning/milestones/v1.0-phases/phase-2-self-hosted-harness-rollout/VERIFICATION.md`.
- `CORE-06` was verified in `.planning/milestones/v1.0-phases/phase-3-distribution-readiness/VERIFICATION.md`.

## Validation Backbone

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:smoke:dist`
- Self-hosted and sample-repo adoption/doctor flows documented in `.planning/milestones/v1.0-phases/phase-2-self-hosted-harness-rollout/VERIFICATION.md`

## Key Milestone Deliverables

- Preserve-by-default scaffold generation for new and existing repositories.
- Shared Codex/OpenCode runtime and planning surface generated from `src/templates/**`.
- Curated cleanup manifests and doctor coverage for known deprecated AI workflow artifacts.
- Local-use distribution guidance, scaffold baseline/version markers, and no-alias `scaiff` migration messaging.

## Follow-On

- Improve local refresh ergonomics beyond the current checkout + `install:local` flow.
- Improve merge/update ergonomics for existing scaffold files beyond root-file merges.
- Add richer inspection and repo-adoption assistance beyond `doctor` and `init-json`.
