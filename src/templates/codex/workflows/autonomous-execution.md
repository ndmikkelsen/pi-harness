# Autonomous Execution Rules

Use this workflow when one agent is driving ready backlog work end to end instead of splitting work across parallel waves.

The shared policy is backlog-driven: drain ready Beads work first, fall back to in-flight repo-local context when no ready issues remain, verify every path, and land each verified pass before moving on.

## Startup Checks

1. Review `.rules/patterns/operator-workflow.md` and the active repo-local handoff or plan context.
2. Detect Beads once at startup and degrade gracefully when it is unavailable.

```bash
BEADS_AVAILABLE=$(test -d .beads && command -v bd >/dev/null 2>&1 && echo "true" || echo "false")
```

3. If `BEADS_AVAILABLE=true`, load ready work with `bd ready --json` before planning anything else.
4. Inspect current repo-local context so in-flight work can be resumed when the backlog is empty.
5. Attempt a Cognee brief before broad planning or backlog interpretation.

```bash
COGNEE_AVAILABLE=$(./.codex/scripts/cognee-bridge.sh health >/dev/null 2>&1 && echo "true" || echo "false")
```

- if `BEADS_AVAILABLE` is `false`, continue with repo-local workflow guidance without blocking on issue tracking
- if `BEADS_AVAILABLE` is `true`, carry the active issue ID through execution, verification, landing, and handoff
- if `COGNEE_AVAILABLE` is `false`, continue only when the work remains locally verifiable under `.rules/`, repo-local context, and repository evidence; otherwise stop with a blocked handoff

## Work Selection Order

Always choose work in this order:

1. ready Beads issues
2. active in-flight work already in motion
3. next repo-local planned task when no ready issues remain

Do not skip ready backlog work just because repo-local plan items still exist.

## Execution Loop

1. If `BEADS_AVAILABLE=true` and ready work exists, claim the selected issue with `bd update <id> --claim --json`.
2. Refresh the repo-local acceptance criteria and verification target before broad edits.
3. Execute the smallest coherent slice of work and keep evidence current as you go.
4. After each verified pass, run the repo landing flow before moving to the next issue or queued task.

## Verification Outcomes

- on `passed`: close the active Beads issue with a reason that references the verification artifact or scoped work outcome, then land the branch
- on `gaps_found`: run one automatic gap-closure cycle, then stop and create or update follow-up issues if gaps remain
- on `human_needed`: stop with a precise validation handoff instead of pretending the work passed
- on hard blockers, malformed verification output, or missing non-inferable inputs: stop and leave the backlog state explicit
- on skip or abort: update or close the active Beads issue with a clear reason so the backlog matches reality

Never close work, defer gaps silently, or continue past manual validation as if the work passed.

## Work Tracking Shape

- use one Beads epic or task for the current scoped unit of work
- create child tasks only when the work naturally splits into meaningful tracked units
- do not create RED/GREEN/REFACTOR child issues here; leave that to more specialized BDD workflows when needed
- keep Beads dependencies aligned with work ordering when the backlog already models blockers

## Config Policy

- do not hard-code `.beads/config.yaml` keys in this workflow unless they are validated against the installed `bd` version
- if JSONL or event export is needed for automation, verify the current Beads config surface first rather than assuming keys like `export_to_jsonl`

## Handoff And Landing

- record the active or closed Beads issue ID in handoff notes when work used Beads
- mention whether verification passed, failed, or produced follow-up issues
- include `source_lane`, `target_lane`, `scope_summary`, `changed_paths`, `verify_command`, `evidence_path`, `issue_ref`, `planning_ref`, `status`, and `open_risks` in autonomous handoff notes
- only execution/autonomous landing lanes may run `./.codex/scripts/land.sh`
- planning, research, or review lanes must stop with a handoff instead of publishing
- if a repo uses `.codex/scripts/land.sh`, make sure issue state already reflects the latest verification result before landing
- landing only publishes the feature branch and manages the PR to `dev`; it never promotes into `main`
- stop autonomous mode only for true blockers, repeated verification gaps after one retry, human-only validation, or missing secrets/accounts/decisions
