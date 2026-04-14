---
name: parallel-wave-design
description: Repo-local guidance for shaping safe Pi subagent batches in pi-harness without duplicating workflow authority.
---

# Parallel Wave Design

Use this skill when you need to split feature or refactor work into Pi subagent batches for repositories scaffolded by `pi-harness`.

## Goal

Keep Pi-native parallel work aligned with repo policy while avoiding a second orchestration system.

## Non-negotiables

- `AGENTS.md` stays the canonical runtime instruction file.
- Each delegated task owns at most 3-5 files.
- Shared constraints go in the parent request or once in the delegated task text.
- Prefer project-local workflow roles first. Use helper subagents like `code-scout`, `task-planner`, `implementer`, `web-researcher`, and `context-mapper` for narrow delegation before reaching for builtins like `reviewer`.
- Subagents do not run project-wide build, test, or lint commands.
- Use `worktree: true` when parallel tasks would otherwise overlap or need isolated patches.
- Sequence type, schema, or contract changes before consumer tasks.
- Every delegated slice must include `Allowed Files`, `Non-Goals`, `Inputs`, `Output`, `Caller Verification`, and `Escalate If`.
- The caller verifies the whole wave and handles serving after edits return.

## Repo-specific reminders

- Carry the active Beads issue ID through context when Beads is available.
- Attempt a Cognee brief before broad planning or repo-wide exploration.
- Keep follow-up work in Beads or repo-local handoff notes, not ad hoc TODO files.
- Prefer explicit compare/adjudicate steps when two parallel views need synthesis.

## Recommended batch shape

```md
## Goal
One sentence wave objective.

## Non-goals
What this batch must not touch.

## Constraints
- Active Beads issue: bd-...
- No project-wide verification inside subagents
- Verification command run by caller after the wave: `...`

## Delegation Units
- Owner: <role/helper>
- Allowed Files: path/a, path/b
- Non-Goals: ...
- Inputs: context.md, plan.md
- Output: progress.md
- Caller Verification: `...`
- Escalate If: ...

## Acceptance
Caller can verify the whole wave with one scoped command.
```

## Good splits

- docs vs implementation when docs do not change code decisions
- isolated modules or services
- one contract wave followed by consumer waves
- compare/adjudicate patterns where two bounded scouts feed one reviewer or lead synthesis step

## Bad splits

- shared root config edited by multiple tasks
- overlapping exported contracts
- migrations or schema changes mixed with dependents in the same wave
- open-ended agent back-and-forth without file fences or escalation rules
