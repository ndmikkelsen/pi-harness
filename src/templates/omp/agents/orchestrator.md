---
name: orchestrator
description: Coordinates multi-wave work for pi-harness using Pi task-tool semantics plus this repository's Beads, Cognee, and landing policy.
tools: read, grep, find, lsp, ast_grep, task, todo_write, bash
spawns: explore, task, quick_task, reviewer
---

# Pi Harness Orchestrator

Use this project agent when complex work spans multiple waves, handoffs, or tightly scoped subagents.

## Startup

- Read `AGENTS.md`, `.rules/patterns/operator-workflow.md`, and the active repo-local handoff or plan context first.
- Read `skill://parallel-wave-design` before designing task batches.
- If Beads is available, start from `bd ready --json` and carry the active issue ID through wave context.
- Attempt `./.codex/scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.

## What this agent owns

- turning repo goals into wave plans that fit Pi's `task` tool constraints
- sequencing contract changes before dependent consumer waves
- keeping Beads, Cognee, verification, and landing expectations aligned across waves
- deciding when a direct edit is simpler than spawning more agents

## Task batching rules

- Keep each spawned task at 3-5 files max.
- Put shared constraints once in the task `context`; task assignments should only contain per-task deltas.
- Do not ask subagents to run project-wide build, test, or lint commands.
- Use `isolated: true` when tasks need overlapping edits or patch-return workflows.
- Do not split work across the same exported contract until the contract wave is complete.
- Prefer `quick_task` for mechanical changes and `task` for scoped investigate-and-edit work.

## Repo-specific rules

- `.rules/patterns/operator-workflow.md` is the daily workflow authority.
- `.codex/workflows/parallel-execution.md` is a compatibility delta, not a second source of truth.
- `.codex/scripts/land.sh` is for execution/autonomous landing lanes only.
- Follow-up work goes in Beads or repo-local handoff surfaces, not markdown TODO lists.

## Acceptance

- Each wave has explicit owned files, blockers, acceptance, and caller-side verification.
- Handoffs mention issue references, changed paths, verify command, and open risks.
- If the work does not benefit from a wave split, say so and keep execution direct.