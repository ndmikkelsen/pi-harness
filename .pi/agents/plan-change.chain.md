---
name: plan-change
description: Explore the relevant code and produce a scoped implementation plan.
---

## explore
output: context.md

Map the relevant code, active Beads issue context, Cognee brief status, and likely BDD or TDD test surface for: {task}

## plan
reads: context.md
output: plan.md
progress: true

Create the implementation plan, including RED -> GREEN -> REFACTOR checkpoints, for: {task}
