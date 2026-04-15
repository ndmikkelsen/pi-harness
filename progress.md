# Progress

## Work Item
`pi-harness-84z.3`

## Status
Completed

## Test Strategy
BDD-led hybrid
- Cognee brief status: unavailable (`DatasetNotFoundError`), so local repository evidence drove the work.
- RED: add failing doctor regression checks for missing TLDR guidance in `.pi/SYSTEM.md` and `.pi/extensions/role-workflow.ts`.
- GREEN: add narrowly scoped doctor enforcement for the scaffold-managed TLDR contract.
- REFACTOR: keep doctor checks semantic and limited to the two canonical TLDR surfaces.

## Inputs Consumed
- `context.md`
- `plan.md`
- `wave.md`
- `progress.md`
- `apps/cli/features/tldr/tldr.feature`
- `apps/cli/features/tldr/tldr.plan.md`
- `src/commands/doctor.ts`
- `tests/integration/doctor.test.ts`
- existing TLDR BDD/integration coverage from `.2`

## Allowed Files
- `src/commands/doctor.ts`
- `tests/integration/doctor.test.ts`
- `progress.md`

## Non-Goals
- no new repo-local TLDR extension, prompt, command, or shortcut
- no unrelated doctor broadening beyond TLDR scaffold enforcement
- no changes to provider/model runtime policy

## Tasks
- [x] Add failing doctor tests for missing TLDR runtime visibility in `.pi/SYSTEM.md`
- [x] Add failing doctor tests for missing TLDR prompt-assembly wiring in `.pi/extensions/role-workflow.ts`
- [x] Reproduce RED for the intended missing-doctor-check reason
- [x] Add narrow doctor enforcement for TLDR scaffold drift
- [x] Re-run full caller verification lane
- [x] Close the remaining Beads task

## Files Changed
- `src/commands/doctor.ts` - now fails when `.pi/SYSTEM.md` loses TLDR visibility guidance or when `.pi/extensions/role-workflow.ts` loses TLDR prompt-assembly wiring
- `tests/integration/doctor.test.ts` - added regression tests for TLDR-specific doctor enforcement
- `progress.md` - recorded final execution evidence and policy decision

## Decisions
- TLDR drift should now be a hard `doctor` failure, not test coverage only.
- The doctor contract stays narrowly scoped to the scaffold-managed TLDR surfaces:
  - `.pi/SYSTEM.md` must retain `TLDR-style responses`
  - `.pi/extensions/role-workflow.ts` must retain `${TLDR_GUIDANCE}` wiring
- Focused BDD/integration coverage from `.2` remains in place; doctor adds a fast audit path rather than replacing those tests.

## Open Questions
- none

## Requested Follow-up
- close parent feature `pi-harness-84z` once the verified child completion is recorded

## Verification Evidence
- RED doctor: `pnpm test -- tests/integration/doctor.test.ts`
  - failed for the right reason: doctor did not yet flag missing TLDR guidance in `.pi/SYSTEM.md` or missing TLDR prompt-assembly wiring in `.pi/extensions/role-workflow.ts`.
- GREEN doctor: `pnpm test -- tests/integration/doctor.test.ts`
- Full caller verification:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
  - `pnpm typecheck`

## Caller Verification
```bash
pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts \
  && pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts \
  && pnpm typecheck
```

## Escalate If
- TLDR guidance moves out of `.pi/SYSTEM.md` or `.pi/extensions/role-workflow.ts` and the doctor contract needs to be reshaped.
- Future TLDR requirements demand broader prompt-surface auditing beyond this narrow scaffold contract.
