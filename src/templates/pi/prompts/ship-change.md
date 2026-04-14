---
description: Use project-local subagents to explore, plan, implement, and review a change.
---
Use the project-local `ship-change` chain if available. If not, run the equivalent `explore -> plan -> build -> review` flow for this request:

$@

Requirements:
- keep implementation scoped
- carry the active Beads issue context through every artifact or say `untracked`
- attempt or reuse the latest Cognee brief before broad planning when needed
- choose BDD, TDD, or hybrid explicitly and follow RED -> GREEN -> REFACTOR
- child subagents may run narrow scoped RED or GREEN commands, but do not ask them to run project-wide build, test, or lint commands
- use the structured handoff contract: `Inputs Consumed`, `Allowed Files`, `Non-Goals`, `Requested Follow-up`, `Caller Verification`, and `Escalate If`
- for explicit MCP requests, use the MCP adapter path first; if MCP is unavailable, record the fallback reason explicitly in artifacts and the final summary
- keep bounded collaboration explicit; ask for one scoped follow-up when needed instead of silently broadening work
- keep final verification in the main session
- return the review verdict plus the narrowest caller-side verification command

Return changed paths, plan summary, issue context, knowledge-brief status, RED/GREEN/REFACTOR evidence, requested follow-up, review risks, and the recommended final verification.
