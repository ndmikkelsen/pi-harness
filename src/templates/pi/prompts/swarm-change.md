---
description: Shape and, when safe, launch a bounded conversational swarm planning lane using project-local subagents.
---
Use the project-local `lead` workflow to shape and, when safe, launch a bounded swarm collaboration pass for this request:

$@

Requirements:
- preserve the existing `plan-change`, `ship-change`, and `parallel-wave` lanes; this is an additive bounded swarm lane
- use a prompt-native custom chain or equivalent `subagent` chain with shared `{chain_dir}` artifacts rather than permanent repo-root swarm files
- keep swarm mailbox state under `{chain_dir}/swarm/`, including `{chain_dir}/swarm/contract.json`, `{chain_dir}/swarm/mailbox/round-01/tasks/`, `{chain_dir}/swarm/mailbox/round-01/claims/`, `{chain_dir}/swarm/mailbox/round-01/responses/`, and adjudication output
- cap the lane at `roundLimit: 2`, with a default of one worker round plus adjudication
- use `swarm-worker` for bounded claim-and-respond slices and `swarm-adjudicator` for synthesis; do not allow free-form worker-to-worker chatter outside the mailbox artifacts
- every mailbox task must carry `Allowed Files`, `Non-Goals`, `Inputs Consumed`, `Output`, `Caller Verification`, and `Escalate If`
- when implementation would overlap or require isolated patches after adjudication, use `worktree: true`
- keep the active Beads issue context or say `untracked`, and attempt or reference the latest Cognee brief before broad planning when local context is not already enough
- choose BDD, TDD, or hybrid explicitly and require a real RED command before implementation work begins
- when the request explicitly asks for MCP behavior, require an MCP adapter-first route and only permit shell fallback when MCP is unavailable and the fallback reason is explicit
- keep final verification, Beads closure, and serving in the main session

Return the bounded swarm plan, mailbox/claims schema, chosen round limit, owned file fences, adjudication path, the next lane after swarm (`plan-change`, `ship-change`, direct handoff, or `lead` escalation), the narrowest caller-side verification command, and the main risks.
