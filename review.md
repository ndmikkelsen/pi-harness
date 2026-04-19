# Review Verdict

## Work Item
`untracked`

## Summary
Ship, with caller-side verification still required.

What looks solid:
- The bounded swarm lane is additive, not a replacement. `plan-change`, `ship-change`, and `parallel-wave` remain present and unchanged as the canonical existing lanes.
- The new lane stays prompt-native via `.pi/prompts/swarm-change.md` instead of inventing extension glue or a misleading saved chain.
- Mailbox state is documented under `{chain_dir}/swarm/`, with worker/adjudicator helpers and a dedicated swarm skill added in both dogfood and template mirrors.
- Generator registration, doctor allowlists, and scaffold/tests were updated together, which reduces drift risk.
- Non-goals appear honored: no `.pi/settings.json` changes, no `.pi/extensions/*.ts` changes, no product-code changes, and no persistent repo-root swarm state.

What is less solid:
- This review could not independently rerun the claimed passing tests; verification success is reported in `progress.md`, not re-executed here.
- Automated coverage proves presence/parity and some key swarm tokens, but it does not specifically lock down every exact mailbox-path token (`adjudication.md`, `summary.md`) or every normalized contract field beyond the targeted checks.

## Inputs Consumed
- `wave.md`
- `plan.md`
- `progress.md`
- `context.md`
- `.pi/prompts/swarm-change.md`
- `.pi/agents/swarm-worker.md`
- `.pi/agents/swarm-adjudicator.md`
- `.pi/skills/swarm-collaboration/SKILL.md`
- `AGENTS.md`
- `README.md`
- `docs/pi-subagent-workflow.md`
- `docs/pi-agentic-workflow-design.md`
- `.pi/agents/lead.md`
- `.pi/prompts/feat-change.md`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`
- `git status --short`
- `git diff --stat`
- `git diff --check`
- `git diff -- <targeted workflow/doc/test files>`
- `bd ready --json`

## Routing Alignment
- `wave.md` present: yes
- Alignment: aligned
- Notes: The implementation honored the active routing contract by keeping the swarm lane prompt-native and additive, preserving existing lanes, and leaving final review as a separate read-only step. I did not find evidence that the work silently rerouted into a second orchestration system or broadened into persistent swarm behavior.

## Execution Surface
shell fallback with reason — read-only git/file inspection only; no MCP-native review path was requested.

## Handoff Compliance
Mostly compliant.
- Stayed inside the planned workflow-scaffold/doc/test surface.
- Preserved stated non-goals: no settings changes, no extension changes, no provider/model pinning, no product-code edits, no persistent background-agent or repo-root mailbox state.
- Added only the expected swarm prompt/helper/skill surfaces plus their template mirrors, generator registration, doctor checks, and scoped integration coverage.
- Artifact updates (`wave.md`, `plan.md`, `progress.md`, `review.md`) match the repo workflow contract.

## Test-First Trace
A scoped TDD loop is evident from the handoff and diff.
- RED is documented in `progress.md` and reflected in new doctor regressions, especially the swarm prompt/worker/skill checks in `tests/integration/doctor.test.ts`.
- GREEN is evident in the additive implementation of `.pi/prompts/swarm-change.md`, swarm helper agents, the swarm skill, generator registration, and doctor allowlist updates.
- REFACTOR is also evident: the implementation tightened wording around mailbox contract fields and mirrored the same surfaces into templates, then updated parity tests.

Caveat: the RED -> GREEN -> REFACTOR story is documented and supported by the changed tests, but this review did not independently rerun those commands.

## Decisions
The caller can treat these points as validated:
- The swarm lane is additive bounded collaboration on top of the existing workflow, not a replacement.
- The chosen implementation preserves `AGENTS.md` authority.
- The lane is prompt-native and centered on `{chain_dir}/swarm/` guidance rather than repo-persistent state.
- Existing `plan-change`, `ship-change`, and `parallel-wave` lanes remain intact.
- Dogfood/template parity, generator registration, doctor allowlists, and scoped integration coverage were updated together.
- Cognee fallback assumptions were handled consistently and explicitly across artifacts.

## Open Questions
- The claimed passing verification commands were not independently rerun in this review.
- Future contract drift on exact adjudication/summary path wording is only partially covered by automation today.

## Requested Follow-up
none

## Risks
- `src/commands/doctor.ts` and the tests currently validate key swarm tokens, but not every exact mailbox-path string. Future edits could preserve `{chain_dir}` and `roundLimit` while still drifting on `adjudication.md` or `summary.md` wording.
- The mailbox schema intentionally mixes human-readable contract labels and machine-style field names; that is acceptable as documented, but any future push toward stricter machine-readable schemas should revisit casing and naming consistency explicitly.
- Final ship confidence still depends on the caller rerunning the named scoped test suite and typecheck.

## Gaps
- No raw test/typecheck output was attached to the handoff; only the commands and claimed outcomes are present in `progress.md`.
- There is no dedicated regression that pins the exact adjudication/summary artifact path strings in the swarm docs/agents/skill.
- There is no separate automated assertion for the normalized `Inputs Consumed` vocabulary inside every swarm surface beyond the targeted token checks and manual contract inspection.

## Caller Verification
Run exactly:
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`
- `pnpm typecheck`

## Escalate If
- The caller reruns the scoped suite or typecheck and any swarm-related check fails.
- Stakeholders require a stricter machine-readable mailbox schema than the current mixed human/documentation contract.
- The swarm lane is later asked to perform broad implementation directly instead of ending in adjudicated planning or handoff.
- Any follow-up proposes persistent repo state, extension glue, or new main-session roles for swarm behavior.