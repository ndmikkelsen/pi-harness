---
name: red-green-refactor
description: Use this skill when a change should follow explicit BDD or TDD with a real RED -> GREEN -> REFACTOR loop.
---

# Red Green Refactor

Use this skill when planning, implementing, or reviewing work that should follow test-first development.

## Decision rule

- User-visible workflow or CLI behavior should start in the BDD lane.
- Lower-level logic, edge cases, and internal contracts can start in the TDD lane.
- Hybrid work may use both, but the plan should say which lane leads.

## Repo-specific guidance

- Keep behavior contracts under `apps/cli/features/` when the work changes user-visible CLI behavior.
- Prefer `apps/cli/features/<domain>/<feature>.feature`, an optional colocated `.plan.md`, and an executable `.spec.ts` for BDD work.
- Keep deeper regression and lower-level assertions in `tests/`.
- Use `pnpm test:bdd` for the BDD lane when the work changes user-visible CLI behavior.

## The loop

1. RED: run a failing BDD or unit test before production code changes and confirm it fails for the right reason.
2. GREEN: implement the smallest change that makes the targeted scenario or test pass.
3. REFACTOR: improve the code while keeping both the behavior lane and the regression lane green.

## Planning expectations

Plans should state:
- whether the work is BDD, TDD, or hybrid
- the exact RED command
- the smallest GREEN implementation target
- the caller-side verification command that proves REFACTOR stayed safe

## Execution guardrails

- Child subagents may run narrow scoped RED or GREEN commands for their assigned slice.
- Child subagents must not run project-wide build, test, or lint commands.
- The caller owns the full verification sweep after delegated work returns.
