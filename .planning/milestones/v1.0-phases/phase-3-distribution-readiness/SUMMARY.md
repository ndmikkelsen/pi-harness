---
phase: phase-3-distribution-readiness
plan: PLAN
subsystem: distribution
tags: [distribution, upgrades, templates, docs, opencode]
requires:
  - phase: phase-2-self-hosted-harness-rollout
    provides: self-hosted scaffold baseline and global harness skill flow
provides:
  - explicit downstream scaffold baseline markers in generated repos
  - documented local checkout upgrade path and install guidance
  - explicit scaiff migration and no-alias compatibility stance
affects: [README, templates, migration-docs, downstream-repos]
tech-stack:
  added: []
  patterns: [local-use distribution, versioned scaffold baseline, preserve-by-default upgrades]
key-files:
  created: [.planning/milestones/v1.0-phases/phase-3-distribution-readiness/SUMMARY.md, src/core/harness-release.ts]
  modified: [README.md, docs/migration-plan.md, src/templates/root/README.md, src/templates/planning/STATE.md, src/templates/codex/skills/harness/references/ai-harness-command-matrix.md, src/commands/init.ts]
key-decisions:
  - "Generated repos now record an ai-harness baseline version and generation date in .planning/STATE.md."
  - "Downstream updates stay local and preserve-by-default; ai-harness has no registry or package-publication path."
  - "scaiff remains documentation-only history; ai-harness ships no compatibility binary or alias."
patterns-established:
  - "Generated docs should state the scaffold baseline and expected refresh flow."
  - "Migration messaging should point old scaiff users to ai-harness and harness directly."
requirements-completed: [CORE-06]
duration: 10 min
completed: 2026-03-29
---

# Phase 3 Plan Summary

**Local-source distribution guidance now ships with explicit scaffold baseline markers, preserve-by-default upgrade instructions, and scaiff migration messaging.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-29T18:12:00-05:00
- **Completed:** 2026-03-29T18:22:00-05:00
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Generated repos now seed `.planning/STATE.md` and scaffolded `README.md` with `ai-harness` baseline and refresh guidance.
- Operator-facing docs now explain the supported local install/update path and how to record upgrade provenance.
- Compatibility messaging now makes the `scaiff` rename explicit and documents that no alias binary or package is supported.

## Task Commits

Each task was committed atomically:

1. **Task 1: downstream versioning and migration markers** - `9cbeeb0` (feat)
2. **Task 2: install, update, and compatibility guidance** - `66ee0e2` (docs)

## Files Created/Modified
- `src/core/harness-release.ts` - exposes the current `ai-harness` version to generators.
- `src/templates/planning/STATE.md` - records the generated scaffold baseline for downstream repos.
- `src/templates/root/README.md` - adds update flow and scaiff migration guidance to scaffolded repos.
- `src/templates/codex/skills/harness/references/ai-harness-command-matrix.md` - documents install, refresh, and compatibility commands for the shipped skill.
- `README.md` - documents the local-use distribution model, downstream upgrade expectations, and compatibility stance.
- `docs/migration-plan.md` - captures the settled migration and alias policy.

## Decisions Made
- Generated repositories should start with an explicit `ai-harness` baseline so downstream operators know which scaffold version created the repo.
- The supported upgrade story remains local and review-driven: rebuild, rerun existing-mode adoption, customize only `createdPaths`, then run `doctor`.
- Older `scaiff` references should migrate to `ai-harness` and `harness`; no compatibility alias is shipped.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- An initial targeted test run used an unsupported Vitest flag; reran the suite with the correct invocation and continued.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CORE-06 is now documented and validated across repo docs, scaffold templates, and shipped skill references.
- Future follow-up can focus on better local refresh ergonomics and review tooling.

## Verification Run

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:smoke:dist`

## Self-Check: PASSED

- Confirmed `.planning/milestones/v1.0-phases/phase-3-distribution-readiness/SUMMARY.md` exists on disk.
- Confirmed task commits `9cbeeb0` and `66ee0e2` exist in git history.
