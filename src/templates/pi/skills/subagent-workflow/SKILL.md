---
name: subagent-workflow
description: Shared role, artifact, and delegation contract for this repository's Pi subagent workflow.
---

# Subagent Workflow

Use this skill when a project-local role participates in the repository's Pi subagent workflow.

## Roles

- `lead` owns workflow coordination, routing, and wave shaping.
- `explore` owns codebase recon and constraint mapping.
- `plan` owns planning and task breakdown.
- `build` owns scoped implementation.
- `review` owns read-only review, architecture scrutiny, and verification guidance.

## Preferred execution paths

- Planning only: `explore -> plan`
- Full implementation: `explore -> plan -> build -> review`
- Parallel work: let `lead` design the wave first, then launch parallel work only when ownership boundaries are explicit.
- Bounded follow-up: allow a single middle-tier follow-up hop only when the caller names the missing evidence and the next agent's scope stays explicit.

## Shared operating loop

- Start from the active Beads issue when Beads is available and carry the issue ID through every handoff.
- Attempt a Cognee brief before broad planning or repository-wide exploration; record fallback clearly when Cognee is unavailable.
- Choose a test-first strategy early: BDD for user-visible behavior, TDD for lower-level logic, or hybrid when both are required.
- Observe a real RED -> GREEN -> REFACTOR loop for implementation work.
- Keep provider and model choice in Pi runtime. Use logical capability profiles in repo files, then map them to real models in Pi runtime.
- For explicit MCP requests, prefer MCP-backed execution first; if shell fallback is required, record that MCP was unavailable and why.

## Artifact contract

Use these artifact names unless the caller gives better ones:

- `context.md` - recon notes and file map
- `plan.md` - implementation plan
- `progress.md` - execution notes and changed files
- `review.md` - review verdict, risks, and caller-side checks
- `wave.md` - routing decision or parallel wave plan

Every artifact should carry:
- active Beads issue context or an explicit `untracked` note
- Cognee brief status when planning or research used it
- the chosen BDD/TDD strategy when it affects the work
- `Inputs Consumed`
- `Allowed Files`
- `Non-Goals`
- `Decisions`
- `Open Questions`
- `Requested Follow-up`
- `Caller Verification`
- `Escalate If`
- `Execution Surface` when MCP policy matters (`MCP adapter used` or `shell fallback with reason`)

## Delegation envelope

Use this minimum contract for every delegated slice:

```md
## Delegation Unit: <short-id>
- Owner: <role/helper>
- Goal: <one sentence>
- Allowed Files:
  - path/one
  - path/two
- Non-Goals:
  - explicit exclusions
- Inputs:
  - context.md
  - plan.md
- Output:
  - artifact to update
- RED:
  - narrow failing check
- GREEN Target:
  - smallest passing change
- Caller Verification:
  - final narrow proof
- Escalate If:
  - conditions that require returning to the caller
```

## Guardrails

- Reuse existing artifacts instead of repeating recon.
- Keep each delegated task to about 3-5 files.
- Do not run project-wide build, test, or lint commands inside child subagents.
- Use `worktree: true` for parallel work when tasks could overlap or need isolated patches.
- Sequence contract, schema, or type changes before consumer work.
- Keep middle-tier delegation bounded to one explicit follow-up hop unless the caller says otherwise.
- The caller owns final verification, Beads updates, and serving.

## Output expectations

Every role should leave the next role with:

1. clear changed or inspected file paths
2. explicit assumptions and blockers
3. the narrowest caller-side verification command that proves the work
4. active Beads issue context or an explicit `untracked` note
5. Cognee brief status and the chosen BDD/TDD strategy when either affected the work
6. `Inputs Consumed`, `Allowed Files`, and `Non-Goals`
7. any `Requested Follow-up` or an explicit `none`
8. an `Escalate If` condition when the next role must stop instead of expanding scope
