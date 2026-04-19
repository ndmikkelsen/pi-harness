# Execution Approach

## Mode
Custom chain

## Work Item
untracked (`bd ready --json` returned `[]`)

## Knowledge
Cognee skipped. Local scaffold/runtime evidence was sufficient.

## Test Strategy
BDD-leading hybrid.
- RED: tighten scaffold assertions so the old TLDR wording fails.
- GREEN: update mirrored prompt files to require `main answer -> Summary -> TLDR` with `TLDR` last.
- REFACTOR: harden alignment/doctor checks for the ordered contract without claiming runtime post-processing.

## Decision Rationale
- This was an implementation request spanning prompt files plus verification surfaces, so a short `explore -> plan -> build -> review` chain was appropriate.
- Parallel work was not justified because prompt wording and test drift checks are coupled.

## Routing Signals
- Hard triggers: implementation, structured artifacts, verification/review.
- Soft triggers: multiple scaffold and test surfaces.
- Safe file fence: TLDR prompt files, BDD assertions, and narrow integration/doctor checks.

## Agents / Chains
- `explore`: mapped the current TLDR contract and gaps.
- `plan`: converted the requirement into a BDD-first implementation plan.
- `build`: implemented the stronger always-on Summary/TLDR contract.
- `review`: validated scope and verification sufficiency.

## Delegation Units

### Delegation Unit: tldr-contract
- Owner: build
- Goal: require responses to follow `main answer -> Summary -> TLDR`, with `TLDR` always last.
- Allowed Files:
  - `.pi/extensions/role-workflow.ts`
  - `.pi/SYSTEM.md`
  - `src/templates/pi/extensions/role-workflow.ts`
  - `src/templates/pi/SYSTEM.md`
  - `apps/cli/features/steps/init.steps.ts`
  - `apps/cli/features/steps/adoption.steps.ts`
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
  - `src/commands/doctor.ts`
  - `tests/integration/doctor.test.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/docs-alignment.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
- Non-Goals:
  - no new `/tldr` command or `.pi/extensions/tldr.ts`
  - no runtime output post-processing
  - no model/provider policy changes
- Inputs:
  - `AGENTS.md`
  - `README.md`
  - repo TLDR scaffold files
- Output:
  - updated scaffold contract plus passing scoped verification
- RED:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts`
- Caller Verification:
  - `pnpm vitest run tests/integration/docs-alignment.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts && pnpm test:bdd -- apps/cli/features/init/init.spec.ts && pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- Escalate If:
  - a literal runtime guarantee is required beyond prompt guidance and text-drift checks

## Verification
Passed:
- `pnpm vitest run tests/integration/docs-alignment.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts`
- `pnpm test:bdd -- apps/cli/features/init/init.spec.ts`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`

## Risks
- The repo now encodes the ordered contract strongly in prompts and tests, but it is still prompt guidance rather than runtime output post-processing.
