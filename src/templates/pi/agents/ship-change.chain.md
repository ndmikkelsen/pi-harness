---
name: ship-change
description: Explore, plan, implement, and review a change using the repository's project-local roles.
---

## explore
output: context.md

Gather the relevant code context, Beads issue context, Cognee brief status, acceptance clues, and bounded file fence for: {task}. Include `Inputs Consumed`, `Allowed Files`, `Non-Goals`, `Open Questions`, and `Requested Follow-up`.

## plan
reads: context.md
output: plan.md
progress: true

Create the implementation plan, including BDD or TDD strategy plus RED -> GREEN -> REFACTOR checkpoints, for: {task}. Every task must include owner, allowed files, non-goals, inputs, output, caller verification, and escalate-if rules.

## build
reads: context.md, plan.md
progress: true

Implement the planned change for: {task}. Observe scoped RED -> GREEN -> REFACTOR steps, stay inside the plan's `Allowed Files` and `Non-Goals`, and record the evidence in `progress.md`.

## review
reads: context.md, plan.md, progress.md
output: review.md
progress: false

Review the implementation against the task, issue acceptance, plan, and handoff compliance. Do not edit code. Return risks, gaps, any bounded read-only follow-up needed, and the caller-side verification you recommend.
