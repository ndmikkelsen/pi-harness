# Progress

## Work Item
`untracked`

## Status
Completed

## Test Strategy
TDD, with a real RED -> GREEN -> REFACTOR loop for the scaffold/runtime/docs lane.
- Cognee brief status: unavailable (`DatasetNotFoundError`), so repository evidence drove the change.

## Inputs Consumed
- `wave.md`
- `context.md`
- `plan.md`
- current `.pi/*` workflow assets
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`

## Routing Alignment
- `wave.md` present: yes
- Alignment: aligned
- Notes: implemented the planning-first bounded swarm lane as an additive prompt-native path, preserved `plan-change` / `ship-change`, and used ephemeral `{chain_dir}` mailbox guidance instead of repo-root swarm state.

## Execution Surface
shell fallback with reason — repository-local implementation and verification only; no MCP-native operation was requested.

## Allowed Files
- `AGENTS.md`
- `README.md`
- `docs/pi-subagent-workflow.md`
- `docs/pi-agentic-workflow-design.md`
- `.pi/agents/lead.md`
- `.pi/agents/swarm-worker.md`
- `.pi/agents/swarm-adjudicator.md`
- `.pi/prompts/feat-change.md`
- `.pi/prompts/swarm-change.md`
- `.pi/skills/swarm-collaboration/SKILL.md`
- `src/templates/pi/AGENTS.md`
- `src/templates/root/README.md`
- `src/templates/pi/agents/lead.md`
- `src/templates/pi/prompts/feat-change.md`
- `src/templates/pi/agents/swarm-worker.md`
- `src/templates/pi/agents/swarm-adjudicator.md`
- `src/templates/pi/prompts/swarm-change.md`
- `src/templates/pi/skills/swarm-collaboration/SKILL.md`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`

## Non-Goals
- no persistent background agents
- no repo-root swarm mailbox state
- no `.pi/settings.json` changes
- no `.pi/extensions/*.ts` changes
- no provider/model pinning in scaffold files
- no product code or release workflow changes

## Tasks
- [x] Added a prompt-native `/swarm-change` lane with `{chain_dir}` mailbox guidance
- [x] Added `swarm-worker` and `swarm-adjudicator` helper agents
- [x] Added `swarm-collaboration` skill guidance
- [x] Updated `lead`, `feat-change`, `AGENTS.md`, `README.md`, and workflow docs for the new bounded swarm lane
- [x] Mirrored new dogfood assets into `src/templates/pi/*`
- [x] Registered new scaffold files in `src/generators/pi.ts`
- [x] Extended doctor validation and integration coverage
- [x] Tightened the swarm mailbox contract so worker/adjudicator formats match the skill requirements
- [x] Verified the focused integration suite and typecheck

## Files Changed
- `AGENTS.md` - added swarm skill/prompt references and bounded swarm collaboration guidance
- `README.md` - added `/swarm-change` to common workflow entrypoints
- `docs/pi-subagent-workflow.md` - documented the prompt-native swarm lane, helpers, and mailbox pattern
- `docs/pi-agentic-workflow-design.md` - recorded the bounded swarm lane decision
- `.pi/agents/lead.md` - taught lead routing about `swarm-change` and swarm helpers
- `.pi/prompts/feat-change.md` - added `swarm-change` as a routing option
- `.pi/prompts/swarm-change.md` - new bounded swarm entrypoint prompt
- `.pi/agents/swarm-worker.md` - new mailbox-driven swarm helper
- `.pi/agents/swarm-adjudicator.md` - new read-only synthesis helper
- `.pi/skills/swarm-collaboration/SKILL.md` - new swarm mailbox/claims/round-limit guidance
- `src/templates/pi/AGENTS.md` - mirrored AGENTS changes
- `src/templates/root/README.md` - mirrored README changes
- `src/templates/pi/agents/lead.md` - mirrored lead changes
- `src/templates/pi/prompts/feat-change.md` - mirrored feat-change changes
- `src/templates/pi/prompts/swarm-change.md` - mirrored new prompt
- `src/templates/pi/agents/swarm-worker.md` - mirrored new helper agent
- `src/templates/pi/agents/swarm-adjudicator.md` - mirrored new helper agent
- `src/templates/pi/skills/swarm-collaboration/SKILL.md` - mirrored new skill
- `src/generators/pi.ts` - registered new swarm files and skill directory
- `src/commands/doctor.ts` - validated new swarm assets and tightened swarm worker/adjudicator guidance checks
- `tests/integration/init.test.ts` - asserted new runtime baseline surfaces and swarm guidance
- `tests/integration/scaffold-snapshots.test.ts` - asserted new scaffold files and swarm content
- `tests/integration/docs-alignment.test.ts` - enforced template/runtime parity for swarm assets
- `tests/integration/doctor.test.ts` - added swarm prompt guidance regression
- `tests/integration/beads-wrapper.test.ts` - updated Beads-facing doc expectations for the new skill

## Decisions
- Implemented the swarm lane as prompt-native because the current saved `.chain.md` parser is sequential and cannot encode parallel steps.
- Tightened the worker/adjudicator contract so the documented mailbox schemas and response formats consistently carry the required handoff fields.
- Kept swarm work planning-first and adjudication-first rather than creating a second full shipping lane.
- Reused existing capability profiles instead of changing `.pi/settings.json`.
- Preserved `plan-change`, `ship-change`, and `parallel-wave` as existing primary lanes.

## Open Questions
- none

## Requested Follow-up
none

## Verification Evidence
- RED: `pnpm test -- tests/integration/doctor.test.ts -t "swarm-change prompt loses chain-dir guidance"` failed before implementation because `.pi/prompts/swarm-change.md` did not exist.
- GREEN: `pnpm test -- tests/integration/doctor.test.ts -t "swarm-change prompt loses chain-dir guidance" tests/integration/beads-wrapper.test.ts` passed after the new swarm assets and doc updates landed.
- GREEN+: `pnpm test -- tests/integration/doctor.test.ts -t "swarm-worker agent loses Output guidance"` passed after tightening the swarm worker/adjudicator contract and doctor coverage.
- REFACTOR: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts` and `pnpm typecheck` both passed after tightening mirror/doctor/test parity.

## Caller Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`
- `pnpm typecheck`

## Escalate If
- a future swarm lane must perform broad implementation directly instead of ending in adjudicated planning
- saved `.chain.md` files gain true parallel-step support and the prompt-native custom chain should be revisited
- the swarm lane ever requires persistent runtime state, extension glue, or new capability profiles
