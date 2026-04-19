# Execution Approach

## Mode
Direct

## Work Item
`untracked`

Beads status:
- `bd ready --json` returned `[]`, so no ready issue was available to claim for this workflow-scaffold change.

## Knowledge
- Cognee: attempted earlier and unavailable because no dataset is present (`DatasetNotFoundError`).
- Reused repository evidence:
  - `AGENTS.md`
  - `README.md`
  - `docs/pi-subagent-workflow.md`
  - `docs/pi-agentic-workflow-design.md`
  - `.pi/agents/lead.md`
  - `.pi/prompts/feat-change.md`
  - `.pi/skills/subagent-workflow/SKILL.md`
  - `.pi/skills/parallel-wave-design/SKILL.md`
  - `src/generators/pi.ts`
  - `src/commands/doctor.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
  - `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`

## Test Strategy
TDD.
- RED: add a failing swarm-specific doctor regression proving the new lane is missing.
- GREEN: implement the smallest additive prompt/agent/skill/doc/scaffold updates for the bounded swarm lane.
- REFACTOR: tighten mirror parity and doctor/test alignment while keeping the lane planning-first and prompt-native.

## Decision Rationale
- The design and planning work was already completed through a bounded `explore -> plan` subagent pass.
- Direct implementation in the main session was the lowest-risk way to keep the many mirrored scaffold surfaces aligned without spawning overlapping write tasks in one working tree.
- Direct mode was selected only after the repository evidence and plan were already clear; final read-only review still benefits from delegation.

## Routing Signals
Hard triggers present:
- implementation request with real code/test work
- structured artifacts are useful (`context.md`, `plan.md`, `progress.md`, `review.md`, `wave.md`)
- multiple docs, scaffold, and verification surfaces are involved

Soft triggers present:
- more than 3-5 files are relevant
- template parity and doctor allowlists couple many updates together
- the swarm lane needed one consistent contract across repo docs, dogfood assets, templates, and tests

Why direct mode was safe:
- the implementation stayed within the planned workflow scaffold boundary
- the saved `.chain.md` format is sequential, so the new swarm lane had to remain prompt-native rather than adding an inaccurate saved chain
- final verification remained narrow and local to the integration + typecheck surfaces

## Agents / Chains
- `plan-change` was used earlier to produce the concrete implementation plan.
- final read-only validation should use the project-local `review` agent.

## Delegation Units

### Delegation Unit: final-review-bounded-swarm-lane
- Owner: `review`
- Goal: validate that the bounded swarm lane stayed additive, prompt-native, and aligned with the planned mailbox/claims contract.
- Allowed Files:
  - `context.md`
  - `plan.md`
  - `progress.md`
  - `review.md`
  - changed workflow scaffold files only
- Non-Goals:
  - no code edits
  - no new routing design work
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
  - `progress.md`
- Output:
  - `review.md`
- RED:
  - already observed in the focused doctor regression for the missing swarm prompt
- Caller Verification:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`
  - `pnpm typecheck`
- Escalate If:
  - the new lane weakened existing workflow authority, introduced persistent state, or drifted from the planning-first bounded-swarm contract

## Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`
- `pnpm typecheck`

## Risks
- The swarm lane is intentionally prompt-native because saved `.chain.md` files are sequential today; if chain syntax grows parallel-step support, this lane may deserve a saved-chain revisit.
- Any future attempt to let swarm workers implement broad code directly would need a new routing and isolation review.
