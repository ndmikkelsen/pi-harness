---
name: parallel-wave-design
description: Repo-local guidance for shaping safe Pi task batches in pi-harness without duplicating workflow authority.
---

# Parallel Wave Design

Use this skill when you need to split feature or refactor work into Pi `task` batches for repositories scaffolded by `pi-harness`.

## Goal

Keep Pi-native parallel work aligned with repo policy while avoiding a second orchestration system.

## Non-negotiables

- `.rules/patterns/operator-workflow.md` stays the canonical daily runbook.
- Each task owns at most 3-5 files.
- Shared constraints go in the task `context`.
- Subagents do not run project-wide build, test, or lint commands.
- Use `isolated: true` when tasks would otherwise touch overlapping files.
- Sequence type, schema, or contract changes before consumer tasks.
- The caller verifies the whole wave and handles serving after edits return.

## Repo-specific reminders

- Carry the active Beads issue ID through context when Beads is available.
- Attempt a Cognee brief before broad planning or repo-wide exploration.
- Use `.codex/workflows/parallel-execution.md` for repo-specific delta language when you need a human-readable wave handoff.
- Keep follow-up work in Beads or repo-local handoff notes, not ad hoc TODO files.

## Recommended batch shape

```md
## Goal
One sentence wave objective.

## Non-goals
What this batch must not touch.

## Constraints
- Active Beads issue: bd-...
- No project-wide verification inside subtasks
- Verification command run by caller after merge: `...`

## Acceptance
Caller can verify the whole wave with one scoped command.
```

## Good splits

- docs vs implementation when docs do not change code decisions
- isolated modules or services
- one contract wave followed by consumer waves

## Bad splits

- shared root config edited by multiple tasks
- overlapping exported contracts
- migrations or schema changes mixed with dependents in the same wave