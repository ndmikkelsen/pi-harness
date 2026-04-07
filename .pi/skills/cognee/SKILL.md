---
name: cognee
description: Use this skill when planning or research should consult the repo's Cognee knowledge garden before broad exploration.
---

# Cognee Workflow

Use this skill when a task is broad enough that the repository's knowledge garden may save time or prevent repeated exploration.

## Purpose

Treat Cognee as a high-signal planning and research aid.
It is not the canonical source of truth; repository files, tests, Beads issues, and current artifacts still win when they conflict.

## Default loop

1. Attempt `./scripts/cognee-brief.sh "<query>"` before broad planning or repository-wide exploration.
2. Record whether the brief succeeded, was empty, or was unavailable.
3. Pull only the relevant takeaways into `context.md`, `plan.md`, or `wave.md`.
4. Continue only when local repository evidence remains sufficient if Cognee is unavailable.
5. When briefs are empty because datasets are missing, use the documented seeding flow in `docs/bake-usage.md` instead of inventing ad hoc sync scripts.

## Role guidance

- `lead` decides whether a Cognee attempt is needed before shaping the workflow.
- `explore` and `plan` attempt or consume the latest brief before broad codebase exploration.
- `build` consumes the latest brief when present but does not create new canonical knowledge-garden state unless the caller explicitly asks.
- `review` uses existing briefs and artifacts to evaluate assumptions; it does not expand the knowledge garden during read-only review.

## Guardrails

- Keep Cognee lane-aware and high-signal.
- Prefer the repo's current files and tests when Cognee output is stale, sparse, or contradictory.
- Record fallback explicitly when Cognee is unavailable.
- Do not turn Cognee into a duplicate planning system.
