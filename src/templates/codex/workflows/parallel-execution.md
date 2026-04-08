# Parallel Execution Rules

Use this doc only for repo-specific deltas when Pi-native `task` orchestration is the right fit. Native Pi task semantics remain primary, and `.rules/patterns/operator-workflow.md` still owns the day-to-day Beads, Cognee, verification, and landing policy.

## Pi-Native Task Baseline

- Keep each subtask scoped to 3-5 files max.
- Put shared constraints in task `context`, not repeated inside every task assignment.
- Do not run project-wide build, test, or lint commands inside subagents; the caller verifies the whole wave after edits return.
- Use `isolated: true` when edits overlap or when you want patch-return workflows instead of shared-tree writes.
- Sequence contract or type changes before consumer waves so downstream tasks see the new interface, not a half-migrated state.

## Wave Design

- Split by independent file families or subsystems.
- Assign one owner per file family in a wave.
- Define the validation command before starting the wave.
- Prefer `.omp/agents/orchestrator.md` and `skill://parallel-wave-design` when the split is non-trivial.
- Do not let two workers edit the same file or tightly coupled files in parallel unless isolated mode is intentional and planned.

## Safe Parallel Boundaries

- Different apps under `apps/`
- Docs vs implementation when docs do not block code decisions
- Tests that target isolated modules or services
- Work-item creation vs code exploration

## Unsafe Boundaries

- Shared root config
- Shared fixtures or step definitions
- The same deployment module or service definition
- Any change that needs ordered migrations or schema evolution
- Any wave where two tasks would need to touch the same exported contract before it is finalized

## Required Per-Wave Handshake

- Objective
- Owned files or directories
- Shared context block
- Expected blockers or dependencies
- Validation command run by the caller after the wave
- Handoff note for the next wave

Use `.codex/templates/phase-execution.md` when the split is non-trivial.