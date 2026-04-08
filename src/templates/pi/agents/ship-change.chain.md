---
name: ship-change
description: Explore, plan, implement, and review a change using the repository's project-local roles.
---

## explore
output: context.md

Gather the relevant code context, Beads issue context, Cognee brief status, and acceptance clues for: {task}

## plan
reads: context.md
output: plan.md
progress: true

Create the implementation plan, including BDD or TDD strategy plus RED -> GREEN -> REFACTOR checkpoints, for: {task}

## build
reads: context.md, plan.md
progress: true

Implement the planned change for: {task}. Observe scoped RED -> GREEN -> REFACTOR steps and record the evidence in `progress.md`.

## review
reads: context.md, plan.md, progress.md
output: review.md
progress: false

Review the implementation against the task, issue acceptance, and plan. Do not edit code. Return risks, gaps, and the caller-side verification you recommend.
