# Execution Approach

## Mode
Custom chain with a gated parallel wave

## Work Item
Active Beads issue: `pi-harness-84z.2`

Related context:
- parent feature: `pi-harness-84z` — scaffold TLDR response guidance for baked Pi repos
- follow-up verification/policy task: `pi-harness-84z.3` — regression coverage and doctor-enforcement decision

## Knowledge
- Cognee status: reused latest brief attempt from this slice; `./scripts/cognee-brief.sh "Create a feature spec and task breakdown for scaffold-managed TLDR prompt enforcement in baked Pi repos"` returned `DatasetNotFoundError`.
- Local repository evidence is already sufficient from:
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
  - `src/templates/pi/extensions/role-workflow.ts`
  - `src/templates/pi/SYSTEM.md`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
  - `tests/integration/doctor.test.ts`

## Test Strategy
BDD-led hybrid.

RED first:
- add failing scaffold assertions for TLDR behavior in the BDD lane and focused integration lane
- keep assertions semantic and file-scoped so parallel RED work does not depend on exact final copy

GREEN next:
- implement the smallest prompt-assembly and SYSTEM-surface changes in dogfood and template mirrors

REFACTOR last:
- decide whether TLDR drift belongs in `doctor` now or should remain covered by tests only
- avoid adding any repo-local TLDR extension or slash command

## Should Parallel Execution Actually Happen?
Yes, but only for the RED verification wave.

Do **not** split the implementation first. The production change is a tight 4-file contract cluster and should stay serial. After the contract boundaries below are fixed, run the RED test slices in parallel with `worktree: true`, then return to the main session for the GREEN implementation and final verification.

## Dependency Order
1. Main session: freeze the semantic TLDR contract for assertions
   - `role-workflow.ts` is the enforcement point
   - `.pi/SYSTEM.md` is visibility only
   - no repo-local TLDR extension/command
2. Parallel RED wave (`worktree: true`)
   - BDD scaffold assertions slice
   - focused integration assertions slice
3. Main session GREEN implementation
   - update dogfood + template prompt surfaces together
4. Main session adjudication
   - decide whether `doctor` should enforce TLDR drift now under `pi-harness-84z.3`
5. Main session final verification, Beads updates, and serving decisions

## Agents / Chains
- main session `lead`: owns routing, contract freeze, adjudication, final verification, and Beads updates
- delegated `build` slices: add failing RED assertions in isolated worktrees
- no MCP path is required for this request; local repository files are the execution surface

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
  - do not edit production scaffold files
  - do not decide final TLDR prose beyond semantic assertions
  - do not add a new repo-local TLDR extension command
- Inputs:
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
  - `wave.md`
- Output:
  - failing BDD assertions proving the TLDR contract is not implemented yet
- RED:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
- Caller Verification:
  - rerun `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
- Escalate If:
  - the BDD lane needs a brand-new shared helper file outside `apps/cli/features/steps/*`
  - assertions require exact final TLDR wording instead of semantic contract checks

### Delegation Unit: red-integration-scaffold
- Owner: `build`
- Goal: add failing focused integration assertions for TLDR scaffold output and template/dogfood alignment expectations
- Allowed Files:
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Non-Goals:
  - do not edit production scaffold files
  - do not add `doctor` enforcement yet
  - do not broaden into unrelated runtime checks
- Inputs:
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
  - `wave.md`
- Output:
  - failing integration assertions proving generated scaffold outputs lack the TLDR contract
- RED:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`
- Caller Verification:
  - rerun `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`
- Escalate If:
  - assertions cannot stay semantic without first choosing exact TLDR prompt copy
  - the slice needs to touch `tests/integration/doctor.test.ts` before the caller decides doctor policy

### Delegation Unit: green-prompt-surfaces
- Owner: main session `lead` or delegated `build` only after RED lands
- Goal: implement the TLDR contract in the scaffold enforcement surfaces and mirror dogfood/template files together
- Allowed Files:
  - `src/templates/pi/extensions/role-workflow.ts`
  - `.pi/extensions/role-workflow.ts`
  - `src/templates/pi/SYSTEM.md`
  - `.pi/SYSTEM.md`
- Non-Goals:
  - do not add any repo-local TLDR extension, command, or shortcut
  - do not expand into unrelated workflow prompt changes
  - do not modify doctor in the same slice
- Inputs:
  - failing RED output from `red-bdd-scaffold`
  - failing RED output from `red-integration-scaffold`
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
- Output:
  - passing implementation of the TLDR prompt-assembly contract in dogfood and templates
- RED:
  - consume the failing commands from both RED slices before editing production files
- Caller Verification:
  - rerun the BDD and focused integration commands, then `pnpm typecheck`
- Escalate If:
  - the implementation requires changing additional generated surfaces beyond these 4 files
  - the TLDR contract appears to belong in a different assembly layer than `role-workflow.ts`

## Verification
Recommended caller-side verification after the wave:

```bash
pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts \
  && pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts \
  && pnpm typecheck
```

If `pi-harness-84z.3` explicitly defers doctor enforcement, keep the same command; `doctor.test.ts` should remain green without requiring new TLDR-specific checks.

## Risks
- The biggest coupling risk is wording churn: if tests assert exact TLDR prose too early, both RED slices will become brittle.
- `src/templates/pi/*` and dogfood `.pi/*` must change together or docs-alignment will fail immediately.
- Doctor enforcement is still a policy choice under `pi-harness-84z.3`; folding it into the GREEN slice would mix two decisions and enlarge scope.
- Parallel work is only safe in isolated worktrees before production edits; broad parallel implementation would create avoidable merge pressure on the same 4-file contract cluster.
