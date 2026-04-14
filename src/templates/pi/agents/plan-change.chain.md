---
name: plan-change
description: Explore the relevant code and produce a scoped implementation plan.
---

## explore
output: context.md

Map the relevant code, active Beads issue context, Cognee brief status, likely BDD or TDD test surface, and a bounded file fence for: {task}. Include `Inputs Consumed`, `Allowed Files`, `Non-Goals`, `Open Questions`, and `Requested Follow-up`.

## plan
reads: context.md
output: plan.md
progress: true

Create the implementation plan, including RED -> GREEN -> REFACTOR checkpoints and explicit delegation units, for: {task}. Every delegated slice must name owner, allowed files, non-goals, inputs, output, caller verification, and escalate-if rules.
