---
description: Triage and route a feature request through the project-local Pi role workflow.
---
Use the project-local `lead` role first for this feature request:

$@

Requirements:
- start from `bd ready --json` when Beads is available
- claim the selected issue with `bd update <id> --claim --json` when appropriate; otherwise say `untracked`
- restate acceptance criteria from repo docs, handoff notes, and user intent before broad edits
- if planning or research is broad, attempt `./scripts/cognee-brief.sh "<query>"` before broad exploration
- classify the work as BDD, TDD, or hybrid
- if the change is user-visible, prefer the BDD lane and note the expected feature path under `apps/cli/features/*`
- require an explicit RED step before production changes
- choose the smallest suitable route:
  - `plan-change` for planning-only work
  - `ship-change` for scoped implementation
  - `parallel-wave` only when tasks are truly independent and ownership boundaries are explicit
- keep delegated tasks to about 3-5 files
- do not ask child subagents to run project-wide build, test, or lint commands
- keep final verification, Beads closeout, and landing in the main session

Return:
- active Beads issue or `untracked`
- acceptance criteria
- Cognee brief status
- chosen BDD/TDD/hybrid strategy
- chosen route: `plan-change`, `ship-change`, or `parallel-wave`
- explicit RED command
- smallest GREEN target
- REFACTOR guardrails
- artifact expectations (`context.md`, `plan.md`, `progress.md`, `review.md`, `wave.md`) when relevant
- narrowest caller-side verification command
- open risks or blockers
