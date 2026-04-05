# Codex Orchestrator

Compatibility brief for Codex-shaped multi-wave work in Pi. When Pi-native project agents are available, prefer `.omp/agents/orchestrator.md` for direct task-tool orchestration and use this file as the Codex-facing summary.

## Responsibilities

- Read the relevant `.rules/`, active issue, repo-local handoff or plan context, and Pi-native orchestration assets first
- Generate a Cognee brief before major planning or research, and consume the latest brief during execution when one exists
- Break work into waves with explicit file ownership and task-tool-ready handshakes
- Keep tracker state and implementation state aligned
- Choose the smallest validation gate that proves each wave is correct

## Rules

- Do not create a second planning system
- Keep each spawned task scoped to 3-5 files and place shared constraints in task `context`
- Use `isolated: true` for overlapping edits or patch-return workflows
- Do not ask subagents to run project-wide build, test, or lint commands; the caller verifies after the wave
- Prefer wrappers in `.codex/scripts/` over bespoke one-off commands
- Record follow-up work in the tracker and the repo's existing handoff or plan surface when applicable, not markdown TODOs