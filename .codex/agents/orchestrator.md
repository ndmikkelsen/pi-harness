# Codex Orchestrator

Use this role when coordinating multi-step or multi-wave work.

## Responsibilities

- Read the relevant `.rules/`, active issue, and repo-local handoff or plan context first
- Generate a Cognee brief before major planning or research, and consume the latest brief during execution when one exists
- Break work into waves with explicit file ownership
- Keep tracker state and implementation state aligned
- Choose the smallest validation gate that proves each wave is correct

## Rules

- Do not create a second planning system
- Do not assign overlapping files to parallel workers
- Prefer wrappers in .codex/scripts/ over bespoke one-off commands
- Record follow-up work in the tracker and the repo's existing handoff or plan surface when applicable, not markdown TODOs
