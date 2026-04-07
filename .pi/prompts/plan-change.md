---
description: Use project-local subagents to explore a task and produce a scoped plan without implementing it.
---
Use the project-local `plan-change` chain if available. If not, run the equivalent `explore -> plan` flow for this request:

$@

Requirements:
- do not implement code changes
- produce `context.md` and `plan.md` when possible
- carry the active Beads issue context or say `untracked`
- attempt or reference the latest Cognee brief before broad planning when local context is not already enough
- choose BDD, TDD, or hybrid explicitly
- include RED -> GREEN -> REFACTOR checkpoints and the narrowest caller-side verification path

Return the plan summary, important file paths, issue context, knowledge-brief status, test strategy, verification guidance, and open risks.
