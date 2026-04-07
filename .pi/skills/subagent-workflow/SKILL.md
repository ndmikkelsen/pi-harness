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

## Shared operating loop

- Start from the active Beads issue when Beads is available and carry the issue ID through every handoff.
- Attempt a Cognee brief before broad planning or repository-wide exploration; record fallback clearly when Cognee is unavailable.
- Choose a test-first strategy early: BDD for user-visible behavior, TDD for lower-level logic, or hybrid when both are required.
- Observe a real RED -> GREEN -> REFACTOR loop for implementation work.

## Artifact contract

Use these artifact names unless the caller gives better ones:

- `context.md` - recon notes and file map
- `plan.md` - implementation plan
- `progress.md` - execution notes and changed files
- `review.md` - review verdict, risks, and caller-side checks
- `wave.md` - routing decision or parallel wave plan

## Guardrails

- Reuse existing artifacts instead of repeating recon.
- Keep each delegated task to about 3-5 files.
- Do not run project-wide build, test, or lint commands inside child subagents.
- Use `worktree: true` for parallel work when tasks could overlap or need isolated patches.
- Sequence contract, schema, or type changes before consumer work.
- The caller owns final verification, Beads updates, and landing.

## Output expectations

Every role should leave the next role with:

1. clear changed or inspected file paths
2. explicit assumptions and blockers
3. the narrowest caller-side verification command that proves the work
4. active Beads issue context or an explicit `untracked` note
5. Cognee brief status and the chosen BDD/TDD strategy when either affected the work
