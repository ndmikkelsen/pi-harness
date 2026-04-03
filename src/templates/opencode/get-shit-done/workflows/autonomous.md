<purpose>

Drain ready Beads work and incomplete GSD phase work autonomously.

Default behavior is backlog-driven:
- claim ready Beads work first when Beads is available
- route claimed ready work through `/gsd-next` before choosing quick or phase execution
- use discuss -> plan -> execute -> verify only when `/gsd-next` or a no-backlog fallback routes into phase work
- keep going until code, validation, verification, and acceptance criteria pass
- close work only after verification passes
- land the current feature branch before moving to the next work item

Stop only for:
- true hard blockers
- human-only verification or acceptance
- missing secrets, external accounts, or other non-inferable inputs

</purpose>

<required_reading>

Always read `.rules/patterns/operator-workflow.md`, `.rules/patterns/omo-agent-contract.md`, and `.codex/workflows/autonomous-execution.md` before acting.
Treat those repo files as the source of truth for backlog priority, verification outcomes, issue closure, landing, and blocker handling.

Read all files referenced by the invoking prompt's execution_context before starting.

</required_reading>

<process>

<step name="initialize" priority="first">

## 1. Initialize

Parse `$ARGUMENTS` for `--from N`:

```bash
FROM_PHASE=""
if echo "$ARGUMENTS" | grep -qE '\-\-from\s+[0-9]'; then
  FROM_PHASE=$(echo "$ARGUMENTS" | grep -oE '\-\-from\s+[0-9]+\.?[0-9]*' | awk '{print $2}')
fi
```

Bootstrap milestone state:

```bash
INIT=$(node "$HOME/.config/opencode/get-shit-done/bin/gsd-tools.cjs" init milestone-op)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
ROADMAP=$(node "$HOME/.config/opencode/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

Detect Beads availability:

```bash
BEADS_AVAILABLE=$(test -d .beads && command -v bd >/dev/null 2>&1 && echo "true" || echo "false")
READY_JSON="[]"
if [[ "$BEADS_AVAILABLE" == "true" ]]; then
  READY_JSON=$(bd ready --json 2>/dev/null || echo "[]")
fi
```

Attempt a Cognee brief before broad planning:

```bash
COGNEE_AVAILABLE=$(./.codex/scripts/cognee-bridge.sh health >/dev/null 2>&1 && echo "true" || echo "false")
if [[ "$COGNEE_AVAILABLE" == "true" ]]; then
  COGNEE_BRIEF=$(./.codex/scripts/cognee-brief.sh "active milestone, ready work, and current repo state" 2>/dev/null || true)
else
  COGNEE_BRIEF=""
fi
```

Display startup banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTONOMOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Milestone: {milestone_version} — {milestone_name}
 Mode: backlog-driven autonomous execution
```

If `FROM_PHASE` is set, display `Phase floor: {FROM_PHASE}`.

The managed OpenCode workflow is the execution entrypoint only. Shared autonomous policy lives in `.rules/patterns/operator-workflow.md`, `.rules/patterns/omo-agent-contract.md`, and `.codex/workflows/autonomous-execution.md`.

</step>

<step name="discover_work">

## 2. Discover Work

Build the work queue in this order:

1. ready Beads issues, when Beads is available
2. incomplete roadmap phases, filtered by `--from N` when provided

For roadmap phases:

```bash
ROADMAP=$(node "$HOME/.config/opencode/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

Keep only phases where `disk_status !== "complete"` OR `roadmap_complete === false`.
Apply `--from N` if provided, then sort numerically.

If no ready issues and no incomplete phases remain:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTONOMOUS ▸ COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 No ready Beads work and no incomplete phases remain.
```

Proceed to lifecycle if the milestone is still open. Otherwise exit cleanly.

</step>

<step name="work_loop">

## 3. Work Loop

Repeat until there is no ready Beads work and no incomplete phases left.

### 3a. Pick Work

- If `BEADS_AVAILABLE=true` and `READY_JSON` contains issues, pick the first ready issue.
- Claim it immediately:

```bash
bd update <id> --claim --json
```

- Carry the issue ID through planning, execution, verification, and handoff.
- If `COGNEE_AVAILABLE=false`, continue only when the task remains locally verifiable from `.rules/`, `.planning/`, and repo state; otherwise stop via `handle_blocker`.

### 3b. Route Claimed Work

Use this routing order:

1. If a ready issue was claimed, route it through `/gsd-next` first.
2. If there is no ready issue and `.planning/STATE.md` or roadmap state already points at an active incomplete phase, use that phase.
3. Else if incomplete roadmap phases exist, use the first incomplete phase.
4. Else treat the claimed issue as quick work.

If a ready issue was claimed:

```
Skill(skill="gsd-next")
```

Let `/gsd-next` decide whether the issue is quick work or phase work. Do not skip a ready issue in favor of roadmap phase work.

### 3c. Execute Quick Work

If `/gsd-next` routes the item to quick work:

```
Skill(skill="gsd:quick", args="--full")
```

After quick work completes:
- run the repo quality gates appropriate to the change
- close the Beads issue only if the work is verified and acceptance is satisfied
- invoke the repo landing flow if it exists

If verification is unclear, route to `handle_blocker` instead of guessing success.

### 3d. Execute Phase Work

For phase work, whether selected by `/gsd-next` or by the no-ready-work phase fallback, always preserve this order:

1. Discuss if context is missing
2. Plan if plans are missing
3. Execute
4. Verify

Use `init phase-op` to inspect the phase state:

```bash
PHASE_STATE=$(node "$HOME/.config/opencode/get-shit-done/bin/gsd-tools.cjs" init phase-op ${PHASE_NUM})
```

If context is missing:

```
Skill(skill="gsd:discuss-phase", args="${PHASE_NUM}")
```

If plans are missing:

```
Skill(skill="gsd:plan-phase", args="${PHASE_NUM}")
```

Execute:

```
Skill(skill="gsd:execute-phase", args="${PHASE_NUM} --no-transition")
```

Verify:

```
Skill(skill="gsd:verify-work", args="${PHASE_NUM}")
```

### 3e. Route On Verification

Read verification status from the latest phase verification artifact.

Possible statuses and actions:

- `passed`
  - close the active Beads issue with a reason that references the verification artifact
  - run the landing flow
  - continue to the next work item

- `gaps_found`
  - run one automatic gap-closure cycle:

    ```
    Skill(skill="gsd:plan-phase", args="${PHASE_NUM} --gaps")
    Skill(skill="gsd:execute-phase", args="${PHASE_NUM} --no-transition")
    Skill(skill="gsd:verify-work", args="${PHASE_NUM}")
    ```

  - if verification still reports gaps after that retry, stop via `handle_blocker`

- `human_needed`
  - stop via `handle_blocker`
  - include the manual validation steps, URLs, or checks from the verification artifact in the handoff

- empty or malformed verification result
  - stop via `handle_blocker`

Never close work, defer gaps silently, or continue past manual validation as if the work passed.

</step>

<step name="landing">

## 4. Landing

After any verified pass, land the current branch before moving to the next work item.

If the repo provides a landing script:

```bash
test -x ./.codex/scripts/land.sh && echo "true" || echo "false"
```

If true:

```bash
./.codex/scripts/land.sh
```

The repo landing flow is the source of truth for branch policy. Do not invent a second release flow inside this workflow.

If no landing script exists:
- stop and hand off a concise summary of what is verified and what remains to publish

</step>

<step name="iterate">

## 5. Iterate

After each landed or blocked work item:

```bash
ROADMAP=$(node "$HOME/.config/opencode/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
READY_JSON=$(if [[ "$BEADS_AVAILABLE" == "true" ]]; then bd ready --json 2>/dev/null || echo "[]"; else echo "[]"; fi)
```

If ready issues remain, continue the loop.
If no ready issues remain but incomplete phases still exist, continue the loop using roadmap phase order.
If neither remain, proceed to lifecycle.

</step>

<step name="lifecycle">

## 6. Lifecycle

When no work remains, run the milestone closeout sequence if the milestone is not already complete:

```
Skill(skill="gsd:audit-milestone")
Skill(skill="gsd:complete-milestone")
Skill(skill="gsd:cleanup")
```

If audit or cleanup reports a blocker, route to `handle_blocker`.

Display final completion banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTONOMOUS ▸ COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Backlog drained, verified work landed, lifecycle complete.
```

</step>

<step name="handle_blocker">

## 7. Handle Blocker

Stop autonomous mode when any of these occur:

- hard technical blocker
- repeated verification gaps after one automatic retry
- human-only validation or acceptance
- missing credentials, accounts, or irreversible decision inputs

When stopping:

1. leave the active Beads issue open unless the state clearly requires a different status
2. create a follow-up Beads issue when the blocker reveals new work
3. summarize:
   - completed and landed work
   - active issue and branch
   - exact blocker
   - exact next command or validation action

Display a stop banner and exit cleanly.

</step>

</process>

<success_criteria>
- [ ] Ready Beads work is the first routing priority when Beads is available
- [ ] Incomplete roadmap phases are still completed when no ready Beads work exists
- [ ] Quick work and phase work both route through verification before closure
- [ ] `gaps_found` triggers one automatic retry, not a user prompt loop
- [ ] `human_needed` stops with a validation handoff instead of pretending success
- [ ] Work closes only after verification and acceptance are satisfied
- [ ] Landing happens after each verified pass via the repo landing flow
- [ ] The workflow exits only when the backlog is drained or a true blocker requires human intervention
</success_criteria>
