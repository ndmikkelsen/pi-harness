---
description: Design and, when safe, launch a parallel wave using project-local subagents.
---
Use the project-local `lead` workflow to shape a safe parallel wave for this request:

$@

Requirements:
- do not split work until file ownership and dependencies are explicit
- keep each delegated task to about 3-5 files
- carry the active Beads issue context and shared test strategy into the wave plan
- attempt or reference the latest Cognee brief before broad planning when local context is not already enough
- use `worktree: true` when parallel work should be isolated
- every delegated slice must include `Allowed Files`, `Non-Goals`, `Inputs`, `Output`, `Caller Verification`, and `Escalate If`
- if two parallel views need synthesis, prefer an explicit compare/adjudicate step instead of open-ended agent chatter
- keep final verification, Beads updates, and serving in the main session

Return the wave plan, owned files per task, test strategy, whether parallel execution should actually happen, the caller-side verification command, and the main risks.
