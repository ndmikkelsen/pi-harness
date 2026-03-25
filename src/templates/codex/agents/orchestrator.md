# Codex Orchestrator

Use this role when coordinating multi-step or multi-wave work.

## Responsibilities

- Read the relevant .rules/ and .planning/ context first
- Generate a Cognee brief before major planning or execution
- Break work into waves with explicit file ownership
- Keep planning state and implementation state aligned
- Choose the smallest validation gate that proves each wave is correct

## Rules

- Do not create a second planning system
- Do not assign overlapping files to parallel workers
- Prefer wrappers in .codex/scripts/ over bespoke one-off commands
- Record follow-up work in the tracker and .planning/, not markdown TODOs
