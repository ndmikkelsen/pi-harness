# Parallel Execution Rules

Use parallel work only when the work can be validated and merged safely.

## Wave Design

- Split by independent file families or subsystems.
- Assign one owner per file family in a wave.
- Define the validation command before starting the wave.
- Do not let two workers edit the same file or tightly coupled files in parallel.

## Safe Parallel Boundaries

- Different apps under apps/
- Docs vs implementation when docs do not block code decisions
- Tests that target isolated modules or services
- Work-item creation vs code exploration

## Unsafe Boundaries

- Shared root config
- Shared fixtures or step definitions
- The same deployment module or service definition
- Any change that needs ordered migrations or schema evolution

## Required Per-Wave Handshake

- Objective
- Owned files or directories
- Expected blockers or dependencies
- Validation command
- Handoff note for the next wave

Use .codex/templates/phase-execution.md when the split is non-trivial.
