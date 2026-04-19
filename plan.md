# Implementation Plan

## Work Item
`untracked`

Acceptance criteria:
- add a bounded autonomous swarm collaboration lane on top of the current role-based workflow
- keep `AGENTS.md` as the workflow authority
- preserve the existing `plan-change` and `ship-change` lanes
- do not introduce persistent background agents or repo-persistent swarm state
- use bounded rounds plus explicit adjudication instead of free-form agent chatter
- prefer ephemeral shared-chain artifacts under `{chain_dir}` for swarm communication
- keep provider/model binding in Pi runtime configuration, not scaffold files
- note Cognee fallback because no dataset is present
- update only the narrowest docs, scaffold, and verification surfaces required for the new lane

## Knowledge Inputs
- Cognee brief: attempted and unavailable (`DatasetNotFoundError: No datasets found`); repository evidence used as fallback.
- Repo-local artifacts: `wave.md`, `context.md`, `AGENTS.md`, `README.md`, `docs/pi-subagent-workflow.md`, `docs/pi-agentic-workflow-design.md`, current `.pi/*` workflow assets, `src/generators/pi.ts`, `src/commands/doctor.ts`, and the four integration tests named in `context.md`.

## Inputs Consumed
- `/var/folders/mn/3xf3m3n930g8dwsy1s3t954w0000gn/T/pi-subagents-uid-501/chain-runs/a8cf04f5/wave.md`
- `/var/folders/mn/3xf3m3n930g8dwsy1s3t954w0000gn/T/pi-subagents-uid-501/chain-runs/a8cf04f5/context.md`
- Current saved chains: `.pi/agents/plan-change.chain.md`, `.pi/agents/ship-change.chain.md`
- Current routing prompt: `.pi/prompts/feat-change.md`
- Existing workflow contract and generator/doctor/test seams listed in `context.md`

## Execution Surface
shell fallback with reason: planning used repository files and existing chain artifacts only; no MCP-native operation was requested.

## Allowed Files
- `AGENTS.md`
- `README.md`
- `docs/pi-subagent-workflow.md`
- `docs/pi-agentic-workflow-design.md`
- `.pi/agents/lead.md`
- new additive swarm assets under `.pi/agents/*`
- `.pi/prompts/feat-change.md`
- new additive swarm prompt(s) under `.pi/prompts/*`
- new additive swarm skill(s) under `.pi/skills/*`
- `src/templates/pi/AGENTS.md`
- `src/templates/root/README.md`
- new additive template mirrors under `src/templates/pi/agents/*`, `src/templates/pi/prompts/*`, `src/templates/pi/skills/*`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`

## Non-Goals
- no changes to `ROLE_ORDER` or promotion of swarm helpers into main-session roles
- no persistent mailbox files in the repo root
- no provider/model pinning in prompts, agents, skills, or docs
- no changes to `.pi/mcp.json`, `scripts/serve.sh`, `scripts/promote.sh`, `src/core/template-loader.ts`, or `scripts/copy-templates.mjs` unless a concrete blocker appears
- no product/application code edits outside the workflow scaffold
- no broad extension expansion; `.pi/extensions/*.ts` and `.pi/settings.json` stay unchanged unless the saved-chain follow-up proves a hard requirement

## Routing Baseline
Inherited mode from `wave.md`: `Direct`.

Inherited `Decision Rationale`:
- the prior step was repository recon plus artifact handoff, not implementation
- direct mode was chosen only because delegation was blocked at the current nesting depth
- the work needed a single structured artifact (`context.md`) rather than a broader wave

Inherited `Routing Signals`:
- hard triggers were present for planning/design and structured artifacts
- soft triggers were present for multi-file, multi-surface workflow changes
- direct mode was accepted only as a depth-limited fallback, not because parallel or chained implementation was preferred

Inherited `Agents / Chains`:
- no child run launched in recon because of max-depth limits
- downstream planning should stay aligned with the current routing contract rather than widening into a new wave

## Goal
Add a prompt-native, bounded swarm collaboration lane that uses ephemeral shared-chain mailbox artifacts and adjudication to strengthen planning/orchestration without replacing the existing role workflow.

## Approach
Implement the lane as an additive planning/orchestration surface, not as a new top-level role system:

1. **Public contract first**
   - document `/swarm-change` as a bounded collaboration entrypoint
   - state that it supplements `plan-change` and `ship-change`
   - define that swarm state lives only under `{chain_dir}` and expires with the chain run

2. **Runtime lane shape**
   - add `.pi/prompts/swarm-change.md` as the public entrypoint
   - add `.pi/agents/swarm-change.chain.md` if saved-chain syntax supports a bounded `parallel` step plus `{chain_dir}` references; otherwise keep the same step graph as a prompt-launched custom chain and document the fallback explicitly
   - add two helper agents:
     - `.pi/agents/swarm-worker.md` for bounded claim/response work
     - `.pi/agents/swarm-adjudicator.md` for read-only synthesis and next-step selection
   - add `.pi/skills/swarm-collaboration/SKILL.md` for mailbox rules, claim discipline, round caps, and escalation conditions
   - update `.pi/agents/lead.md` and `.pi/prompts/feat-change.md` so routing can choose the swarm lane deliberately

3. **Saved-chain or equivalent shape**
   - preferred v1 shape is planning-first so it composes with existing lanes instead of replacing them:

```md
---
name: swarm-change
description: Run a bounded swarm compare/adjudicate pass, then turn the adjudicated result into an implementation plan.
---

## lead
output: wave.md
progress: true

Define goal, max rounds (default 1, max 2), mailbox paths under {chain_dir}/swarm/, Allowed Files, Non-Goals, and worker task seeds for: {task}. Stop and escalate if the work is too small, too coupled, or unsafe for swarm use.

## parallel
- swarm-worker x2
- optional swarm-worker x1 for test-surface counterpoint

Each worker reads wave.md, claims exactly one mailbox item from {chain_dir}/swarm/mailbox/round-01/tasks/, writes a claim JSON, and emits one bounded response under {chain_dir}/swarm/mailbox/round-01/responses/.

## swarm-adjudicator
progress: true

Read round artifacts from {chain_dir}/swarm/, synthesize them into {chain_dir}/swarm/adjudication/round-01.md, and either:
- approve a final direction for `plan`, or
- create a second and final round of mailbox tasks, or
- escalate back to `lead`.

## plan
reads: wave.md
output: plan.md
progress: true

Turn the adjudicated swarm result into a RED -> GREEN -> REFACTOR implementation plan for: {task}.
```

   - if saved-chain parser support is missing, keep the same step graph in `.pi/prompts/swarm-change.md` as the documented custom-chain path; do **not** add extension glue just to force it

4. **Mailbox and claims schema**
   - use ephemeral artifacts only under `{chain_dir}/swarm/`
   - proposed layout:

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
    round-02/   # optional and final round only
  summary.md
```

   - `contract.json` fields:
     - `task`
     - `roundLimit` (default `1`, max `2`)
     - `allowedFiles`
     - `nonGoals`
     - `callerVerification`
     - `escalateIf`
     - `createdBy`
     - `createdAt`
   - mailbox task schema (`tasks/<task-id>.json`):
     - `taskId`
     - `round`
     - `goal`
     - `allowedFiles`
     - `nonGoals`
     - `inputs`
     - `outputPath`
     - `red`
     - `greenTarget`
     - `dependsOn`
     - `status` (`open|claimed|completed|escalated`)
   - claim schema (`claims/<task-id>--<agent>.json`):
     - `taskId`
     - `round`
     - `agent`
     - `claimId`
     - `claimedAt`
     - `leaseSeconds`
     - `filesLocked`
     - `responsePath`
     - `status` (`claimed|completed|released|escalated`)
     - `escalateIf`
   - worker response frontmatter in markdown should include:
     - `taskId`
     - `claimId`
     - `agent`
     - `recommendedAction`
     - `risks`
     - `callerVerification`
   - no direct worker-to-worker chat; coordination happens only through mailbox artifacts plus adjudication

5. **Agent responsibilities / prompt direction**
   - `swarm-worker`
     - claim exactly one mailbox item
     - stay inside the task's `Allowed Files` and `Non-Goals`
     - produce one bounded response artifact and release/escalate explicitly
     - do not create new rounds, reroute the workflow, or write persistent repo-root state
   - `swarm-adjudicator`
     - read claims and responses only
     - compare proposals, select or merge the safest direction, and write adjudication
     - either authorize one final round or escalate back to `lead`
     - do not implement product code or silently broaden scope
   - `lead` remains the only coordinator; no `swarm-coordinator` helper is needed in v1

6. **Exact files to add**
   - `.pi/prompts/swarm-change.md`
   - `.pi/agents/swarm-change.chain.md` *(or omit only if the bounded follow-up proves saved chains cannot express the required step graph)*
   - `.pi/agents/swarm-worker.md`
   - `.pi/agents/swarm-adjudicator.md`
   - `.pi/skills/swarm-collaboration/SKILL.md`
   - `src/templates/pi/prompts/swarm-change.md`
   - `src/templates/pi/agents/swarm-change.chain.md`
   - `src/templates/pi/agents/swarm-worker.md`
   - `src/templates/pi/agents/swarm-adjudicator.md`
   - `src/templates/pi/skills/swarm-collaboration/SKILL.md`

7. **Exact files to update**
   - `AGENTS.md`
   - `README.md`
   - `docs/pi-subagent-workflow.md`
   - `docs/pi-agentic-workflow-design.md`
   - `.pi/agents/lead.md`
   - `.pi/prompts/feat-change.md`
   - `src/templates/pi/AGENTS.md`
   - `src/templates/root/README.md`
   - `src/generators/pi.ts`
   - `src/commands/doctor.ts`
   - `tests/integration/init.test.ts`
   - `tests/integration/scaffold-snapshots.test.ts`
   - `tests/integration/docs-alignment.test.ts`
   - `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`

8. **Files expected to stay unchanged in v1**
   - `.pi/settings.json`
   - `.pi/extensions/repo-workflows.ts`
   - `.pi/extensions/role-workflow.ts`
   - `.pi/prompts/plan-change.md`
   - `.pi/prompts/ship-change.md`
   - `.pi/prompts/parallel-wave.md`
   - `.pi/agents/review.md`
   - `.pi/skills/subagent-workflow/SKILL.md`
   - `.pi/skills/parallel-wave-design/SKILL.md`

## Decision Carry-Forward
This plan stays aligned with `wave.md` by preserving the current routing contract and keeping the repository change itself sequential and narrow. It does **not** widen the present session into a new parallel implementation wave.

The only intentional narrowing is functional: the new swarm lane should end in an adjudicated `plan.md` rather than becoming a second full implementation lane. That preserves `plan-change` and `ship-change` as the canonical planning and shipping paths while still adding a bounded swarm collaboration capability in front of them.

If the bounded follow-up shows that saved-chain markdown cannot represent `parallel` plus `{chain_dir}` safely, implementation should fall back to the equivalent prompt-launched custom chain and record that as a direct escalation to `lead` rather than inventing extension glue.

## Test Strategy
TDD.

Proof surfaces:
- RED: `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`
- Narrow contract/docs parity: `pnpm test -- tests/integration/docs-alignment.test.ts`
- Final caller verification: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`

## RED
Introduce a focused failing integration expectation for the new swarm lane before adding any runtime assets. The narrowest starting point is a new swarm-specific assertion in `tests/integration/doctor.test.ts` that expects the new prompt/chain/helper/skill/doc tokens and fails because those surfaces do not exist yet.

Command:
- `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`

## GREEN
Implement the smallest additive scaffold to satisfy the RED step:
- docs advertise `/swarm-change` and the bounded mailbox contract
- dogfood `.pi/*` contains the new prompt, helper agents, skill, and saved-chain-or-equivalent lane
- templates mirror the dogfood files
- generator registers the new template-backed files
- doctor allowlists and tests recognize the new managed surfaces

## REFACTOR
Once GREEN is reached:
- tighten duplicated wording between dogfood docs and template mirrors
- keep mailbox schema examples consistent across docs, prompt, and skill
- remove any unnecessary overlap between `swarm-change` wording and existing `parallel-wave` wording
- confirm `.pi/settings.json` and extensions remain untouched because existing capability profiles were sufficient

## Delegation Units

### 1. Verification RED seed
- Owner: build
- Goal: Add the smallest failing integration coverage for the new swarm lane surfaces before production/scaffold edits.
- Allowed Files:
  - `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Non-Goals:
  - no docs or `.pi/*` changes
  - no `doctor.ts` changes yet
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
- Output:
  - `progress.md`
- Dependency:
  - none
- RED:
  - `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`
- GREEN Target:
  - focused failing expectations exist for the new swarm prompt/chain/helper/skill/docs surfaces
- Caller Verification:
  - same RED command fails for missing swarm assets, not for unrelated errors
- Escalate If:
  - current tests cannot express the new lane without first changing shared test helpers or proving saved-chain syntax support

### 2. Publish the workflow contract
- Owner: build
- Goal: Document the new lane, its bounded-round rules, and its relationship to existing workflows.
- Allowed Files:
  - `AGENTS.md`
  - `README.md`
  - `docs/pi-subagent-workflow.md`
  - `docs/pi-agentic-workflow-design.md`
- Non-Goals:
  - no template mirrors yet
  - no generator or doctor changes
  - no extension/settings changes
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
- Output:
  - `progress.md`
- Dependency:
  - 1
- RED:
  - `pnpm test -- tests/integration/docs-alignment.test.ts`
- GREEN Target:
  - docs describe `/swarm-change`, bounded mailbox use under `{chain_dir}`, adjudication, and preservation of `plan-change` / `ship-change`
- Caller Verification:
  - docs-alignment expectations point only to missing mirror/runtime updates, not missing contract language
- Escalate If:
  - documenting the lane forces persistent state, main-session role changes, or extension-first routing

### 3. Add dogfood swarm runtime assets
- Owner: build
- Goal: Add the new prompt, saved-chain-or-equivalent lane, helper agents, and skill under `.pi/*`.
- Allowed Files:
  - `.pi/prompts/swarm-change.md`
  - `.pi/agents/swarm-change.chain.md`
  - `.pi/agents/swarm-worker.md`
  - `.pi/agents/swarm-adjudicator.md`
  - `.pi/skills/swarm-collaboration/SKILL.md`
- Non-Goals:
  - no `ROLE_ORDER` changes
  - no `.pi/settings.json` or `.pi/extensions/*.ts` edits
  - no implementation outside workflow assets
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
- Output:
  - `progress.md`
- Dependency:
  - 2
- RED:
  - `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`
- GREEN Target:
  - runtime assets express the bounded swarm lane, mailbox schema, claim discipline, round cap, and escalation rules
- Caller Verification:
  - the doctor-focused swarm test fails only on missing registration/allowlist work after these files exist
- Escalate If:
  - saved-chain markdown cannot support `{chain_dir}` and bounded parallelism, or the helper prompts require new capability profiles rather than existing ones

### 4. Route the lane and register scaffold generation
- Owner: build
- Goal: Make the new lane discoverable and include it in generated repos.
- Allowed Files:
  - `.pi/agents/lead.md`
  - `.pi/prompts/feat-change.md`
  - `src/generators/pi.ts`
  - `src/templates/pi/agents/swarm-change.chain.md`
  - `src/templates/pi/prompts/swarm-change.md`
- Non-Goals:
  - no template docs yet
  - no doctor/test allowlist updates yet
  - no extension command glue
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
- Output:
  - `progress.md`
- Dependency:
  - 3
- RED:
  - `pnpm test -- tests/integration/init.test.ts`
- GREEN Target:
  - lead routing can select the swarm lane deliberately, feat routing names it, and generator emits the new saved chain/prompt assets
- Caller Verification:
  - init/scaffold expectations now fail only on remaining mirrors and doctor validations
- Escalate If:
  - making the lane discoverable requires changes to `.pi/extensions/repo-workflows.ts` instead of prompt-native routing

### 5. Mirror templates for parity
- Owner: build
- Goal: Keep generated repos aligned with the dogfood runtime/docs surfaces.
- Allowed Files:
  - `src/templates/pi/agents/swarm-worker.md`
  - `src/templates/pi/agents/swarm-adjudicator.md`
  - `src/templates/pi/skills/swarm-collaboration/SKILL.md`
  - `src/templates/pi/AGENTS.md`
  - `src/templates/root/README.md`
- Non-Goals:
  - no new runtime behavior
  - no doctor implementation
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
- Output:
  - `progress.md`
- Dependency:
  - 2
  - 3
  - 4
- RED:
  - `pnpm test -- tests/integration/docs-alignment.test.ts`
- GREEN Target:
  - template mirrors cover the new lane entrypoint and helper/skill surfaces without drift
- Caller Verification:
  - docs-alignment failures, if any, are limited to doctor/init snapshot registration
- Escalate If:
  - template mirrors reveal missing dogfood content or undocumented lane behavior that changes the contract

### 6. Close doctor and integration alignment
- Owner: build
- Goal: Update explicit allowlists, token checks, and integration expectations so the new lane is scaffolded and validated end-to-end.
- Allowed Files:
  - `src/commands/doctor.ts`
  - `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Non-Goals:
  - no new workflow features beyond validation and registration
  - no broad test/build/lint expansion
- Inputs:
  - `wave.md`
  - `context.md`
  - `plan.md`
- Output:
  - `progress.md`
- Dependency:
  - 1
  - 4
  - 5
- RED:
  - `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`
- GREEN Target:
  - explicit managed-path lists, stale-scan lists, and integration assertions all recognize the new lane and pass
- Caller Verification:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`
- Escalate If:
  - doctor requires settings, extensions, or runtime package changes that were not part of the approved lane shape

## Requested Follow-up
One bounded helper follow-up: confirm whether the saved-chain markdown implementation used by this repo supports a `parallel` step with `{chain_dir}` interpolation inside task text. If not, keep `.pi/prompts/swarm-change.md` as the public entrypoint and implement the same step graph as a prompt-launched custom chain instead of adding extension glue.

## Verification
Narrowest caller-side verification:
- RED: `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`
- Final: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`

## Risks
- The main implementation risk is saved-chain syntax support for bounded parallelism plus `{chain_dir}` references.
- `src/commands/doctor.ts` is an explicit allowlist validator, so omissions will surface late unless registration and validation are updated together.
- Template parity is enforced; every dogfood swarm asset must have a mirror or tests will fail.
- Adding too much swarm-specific routing text to `lead` or `feat-change` could blur the distinction between `parallel-wave` and the new planning-first swarm lane.

## Decisions
- v1 should be prompt-native and scaffold-native, not extension-driven.
- v1 should reuse existing capability profiles; no `.pi/settings.json` change is planned.
- v1 should use exactly two new helper agents (`swarm-worker`, `swarm-adjudicator`) and no new main-session role.
- v1 should keep all inter-agent communication ephemeral under `{chain_dir}`.
- v1 should terminate in an adjudicated `plan.md`, leaving implementation to existing lanes.

## Open Questions
- Does saved-chain markdown support the required `parallel` + `{chain_dir}` step shape, or must the public prompt launch an equivalent custom chain?

## Caller Verification
- `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`
- then `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`

## Escalate If
- the lane requires persistent background agents or repo-persistent mailbox state
- the lane cannot be expressed as a saved-chain-or-custom-chain prompt-native flow and would require a second orchestration system
- swarm helpers must become first-class main-session roles
- new runtime packages, extension glue, or capability-profile additions become mandatory rather than optional
- the planning-first swarm lane proves insufficient and stakeholders actually want a second full implementation lane that overlaps `ship-change`
