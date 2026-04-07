# Implementation Plan

## Work Item
untracked — analyze remaining scaffold-vs-dogfood gaps after the `.docker` / `.config` move and create tracked follow-up tasks.

Acceptance criteria:
- explain what lives under `.codex/docker` and whether it is duplicate or active
- identify the concrete gaps between the dogfooded local harness and the active scaffold source
- separate intentional legacy-cleanup support from unintended scaffold/runtime duplication
- create backlog tasks for the gaps that should be resolved

## Knowledge Inputs
- Cognee brief: pending retry for this broader gap-analysis lane; local repository evidence is currently sufficient if it remains unavailable.
- Repo docs: `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/pi-harness-premise.md`, `docs/harness-usage.md`
- Recon artifact: `context.md`
- Current handoff: `STICKYNOTE.md`

## Goal
Produce a verified gap analysis and tracked follow-up issues so the scaffold source, dogfooded repo, and cleanup boundaries are explicit.

## Approach
1. Inspect the active scaffold composition path to see what is actually emitted today.
2. Inspect dormant compatibility generators and templates to determine whether they are dead code, duplicate assets, or intentionally retained migration aids.
3. Compare those findings against the current dogfooded local harness surfaces.
4. Turn each actionable mismatch into a scoped Beads task, keeping cleanup-support retention as an explicit non-goal unless proven otherwise.

## Test Strategy
TDD for any future implementation follow-up. For this planning task, use repository inspection and issue creation as evidence.

## RED
Not applicable for the planning-only step. For follow-up implementation work, the first RED should be a narrow regression that proves a legacy compatibility source or duplicate artifact is still present when it should not be.

## GREEN
Planning GREEN is reached when the gap list is concrete, scoped, and represented as backlog tasks.

## REFACTOR
After follow-up implementation work lands, add or tighten regression coverage so future scaffold changes fail fast when dormant compatibility sources diverge from the active Pi-native baseline.

## Tasks
1. Confirm the status of `.codex/docker/Dockerfile.cognee` by comparing it to the active Pi-native Dockerfile template and checking whether any active scaffold path still consumes it.
2. Map active scaffold assembly from `src/generators/index.ts` to the currently emitted surfaces and note which source trees are actually part of the live scaffold.
3. Inventory dormant compatibility source still present under `src/templates/codex/**`, `src/templates/omp/**`, `src/templates/rules/**`, and `src/generators/{codex,omp,rules}.ts`.
4. Separate intentional legacy cleanup support in `src/core/cleanup-manifests.ts` and `src/commands/doctor.ts` from removable compatibility scaffold source.
5. Create scoped backlog tasks for each confirmed gap, including one regression-oriented task that prevents source-vs-dogfood drift from recurring.

## Dependencies
- Attempt the Cognee brief first for this broader planning lane.
- Confirm Beads availability before creating issues.
- Do not schedule removal of cleanup support until the retention boundary is explicit.

## Verification
- repository evidence in `context.md`
- created Beads tasks for confirmed gaps
- optional caller check: `rg -n "buildCodexEntries|buildOmpEntries|buildRuleEntries|codex/docker/Dockerfile.cognee|templates/codex|templates/omp|templates/rules" src tests docs`

## Risks
- Removing compatibility sources too aggressively could erase intentional adoption knowledge.
- Dist output may still contain legacy copies after source cleanup unless build/test tasks are part of the implementation follow-up.
- Cleanup-manifest and stale-artifact tests may need to stay even if dormant compatibility scaffold sources are removed.
