# Implementation Plan

## Work Item
`pi-harness-84z.2` — implement TLDR guidance in role-workflow prompt assembly and SYSTEM visibility.

Acceptance criteria:
- `src/templates/pi/extensions/role-workflow.ts` appends TLDR guidance at the end of the final assembled system prompt
- dogfood and template `.pi/SYSTEM.md` files mention the TLDR expectation for visibility
- dogfood and template workflow surfaces stay aligned
- no repo-local global TLDR extension or command is introduced

## Knowledge Inputs
- Cognee brief attempted and unavailable (`DatasetNotFoundError`)
- active Beads task: `pi-harness-84z.2`
- feature contract captured in `apps/cli/features/tldr/tldr.feature` and `apps/cli/features/tldr/tldr.plan.md`

## Inputs Consumed
- `context.md`
- `wave.md`
- `apps/cli/features/tldr/tldr.feature`
- `apps/cli/features/tldr/tldr.plan.md`
- current BDD and integration verification surfaces

## Goal
Add TLDR behavior at the prompt-assembly enforcement point and visible SYSTEM guidance without expanding scope into repo-local commands or unrelated workflow changes.

## Approach
1. RED: add failing BDD and focused integration assertions in separate bounded slices.
2. GREEN: update template and dogfood prompt surfaces together.
3. REFACTOR: keep assertions semantic and leave doctor-policy expansion to `pi-harness-84z.3` unless required.

## Test Strategy
BDD-led hybrid.

## RED
- `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`

## GREEN
Implement the smallest change in these 4 files only:
- `src/templates/pi/extensions/role-workflow.ts`
- `.pi/extensions/role-workflow.ts`
- `src/templates/pi/SYSTEM.md`
- `.pi/SYSTEM.md`

## REFACTOR
- keep template/dogfood wording aligned
- keep assertions semantic instead of brittle exact-copy matching when possible
- do not mix in doctor changes unless the caller explicitly pulls `pi-harness-84z.3` forward

## Delegation Units

### Delegation Unit: red-bdd-scaffold
- Owner: `build`
- Goal: add failing BDD assertions for TLDR scaffold behavior in init and adoption flows
- Allowed Files:
  - `apps/cli/features/init/init.spec.ts`
  - `apps/cli/features/steps/init.steps.ts`
  - `apps/cli/features/adoption/adoption.spec.ts`
  - `apps/cli/features/steps/adoption.steps.ts`
  - `apps/cli/features/steps/index.ts`
- Non-Goals:
  - no production scaffold edits
  - no exact final TLDR prose decisions
  - no repo-local TLDR command surface
- Inputs:
  - `context.md`
  - `plan.md`
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
- Output:
  - BDD assertion changes and RED evidence
- RED:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
- GREEN Target:
  - none in this delegated slice; return after RED evidence
- Caller Verification:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
- Escalate If:
  - a new helper is needed outside `apps/cli/features/steps/*`
  - semantic assertions are impossible without final copy

### Delegation Unit: red-integration-scaffold
- Owner: `build`
- Goal: add failing focused integration assertions for TLDR scaffold output
- Allowed Files:
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Non-Goals:
  - no production scaffold edits
  - no doctor changes
  - no unrelated runtime assertions
- Inputs:
  - `context.md`
  - `plan.md`
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
- Output:
  - integration assertion changes and RED evidence
- RED:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`
- GREEN Target:
  - none in this delegated slice; return after RED evidence
- Caller Verification:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`
- Escalate If:
  - doctor coverage is required before the caller decides `pi-harness-84z.3`
  - semantic assertions are impossible without final copy

## Requested Follow-up
none

## Verification
- after RED + GREEN:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
  - `pnpm typecheck`

## Risks
- brittle tests if TLDR wording is over-specified too early
- template/dogfood drift if mirrored files are not changed together
- accidental scope creep into `doctor` or other prompt surfaces
