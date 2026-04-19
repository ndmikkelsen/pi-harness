---
name: swarm-collaboration
description: Bounded conversational swarm guidance for prompt-native custom chains that use ephemeral mailbox artifacts under `{chain_dir}`.
---

# Swarm Collaboration

Use this skill when a task benefits from autonomous conversational multi-agent collaboration, but the repository still needs deterministic guardrails.

## Goal

Add bounded swarm behavior on top of the existing role workflow without introducing repo-root mailbox clutter or a second planning system.

## Non-negotiables

- `AGENTS.md` remains the workflow authority.
- No persistent background agents.
- Keep `plan-change`, `ship-change`, and `parallel-wave` intact; swarm is additive.
- Keep swarm state ephemeral under `{chain_dir}/swarm/`.
- Default to `roundLimit: 1`; never exceed `roundLimit: 2`.
- Workers communicate through mailbox artifacts plus adjudication, not free-form chatter.
- Every task, claim, response, and adjudication must preserve `Allowed Files`, `Non-Goals`, `Inputs Consumed`, `Output`, `Caller Verification`, and `Escalate If`.
- If post-adjudication implementation could overlap, use `worktree: true`.
- The caller owns final verification, Beads closure, and serving.

## Mailbox layout

```text
{chain_dir}/swarm/
  contract.json
  mailbox/
    round-01/
      tasks/
        <task-id>.json
      claims/
        <task-id>--<agent>.json
      responses/
        <task-id>--<agent>.md
      adjudication.md
    round-02/
      ... only when explicitly approved by adjudication
  summary.md
```

## Required schema

### `contract.json`
- `task`
- `roundLimit`
- `allowedFiles`
- `nonGoals`
- `callerVerification`
- `escalateIf`
- `createdBy`
- `createdAt`

### mailbox task
- `taskId`
- `round`
- `goal`
- `allowedFiles`
- `nonGoals`
- `Inputs Consumed`
- `output`
- `callerVerification`
- `escalateIf`
- `red`
- `greenTarget`
- `dependsOn`
- `status`

### claims
- `taskId`
- `round`
- `agent`
- `claimId`
- `claimedAt`
- `leaseSeconds`
- `filesLocked`
- `allowedFiles`
- `nonGoals`
- `Inputs Consumed`
- `output`
- `callerVerification`
- `responsePath`
- `status`
- `escalateIf`

### adjudication
- `allowedFiles`
- `nonGoals`
- `Inputs Consumed`
- `output`
- summarize findings
- resolve conflicts
- choose `approve`, `second-round-needed`, or `escalate`
- name the next lane explicitly
- `callerVerification`
- `escalateIf`

## Good swarm shape

1. `lead` writes the contract and worker tasks.
2. Parallel `swarm-worker` runs claim one task each.
3. `swarm-adjudicator` writes adjudication.
4. If needed, one final round addresses a single named gap.
5. The lane ends in an adjudicated plan or an escalation back to `lead`.

## Bad swarm shape

- persistent daemons or background agents
- repo-persistent mailbox files
- open-ended worker-to-worker back-and-forth
- overlapping file ownership without worktree isolation
- workers silently launching their own new routes

## Caller reminder

Use prompt-native custom chains when saved `.chain.md` files cannot express the needed fan-out/fan-in shape.
Bounded swarm work is for planning and synthesis first; keep broad implementation in the existing execution lanes.
