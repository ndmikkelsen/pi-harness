# Code Context

## Work Item
`pi-harness-84z.2` — implement TLDR guidance in role-workflow prompt assembly and SYSTEM visibility.

## Knowledge Brief
Cognee attempted via `./scripts/cognee-brief.sh "Create a feature spec and task breakdown for scaffold-managed TLDR prompt enforcement in baked Pi repos"` and was unavailable: `DatasetNotFoundError: No datasets found`.

## Inputs Consumed
- `apps/cli/features/tldr/tldr.feature`
- `apps/cli/features/tldr/tldr.plan.md`
- `src/templates/pi/extensions/role-workflow.ts`
- `.pi/extensions/role-workflow.ts`
- `src/templates/pi/SYSTEM.md`
- `.pi/SYSTEM.md`
- `apps/cli/features/steps/init.steps.ts`
- `apps/cli/features/steps/adoption.steps.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`

## Key Contracts
- TLDR is a scaffold-managed behavior for baked Pi repos.
- The durable enforcement point is the final assembled system prompt in `.pi/extensions/role-workflow.ts`.
- `.pi/SYSTEM.md` repeats the TLDR expectation for visibility, but is not the sole enforcement layer.
- No repo-local TLDR extension, command, or shortcut should be introduced.
- Dogfood `.pi/*` and `src/templates/pi/*` must stay aligned.
- Doctor enforcement is a separate policy decision under `pi-harness-84z.3` unless the caller explicitly folds it into this slice.

## Files Retrieved
- Feature contract:
  - `apps/cli/features/tldr/tldr.feature`
  - `apps/cli/features/tldr/tldr.plan.md`
- Prompt assembly / visibility surfaces:
  - `src/templates/pi/extensions/role-workflow.ts`
  - `.pi/extensions/role-workflow.ts`
  - `src/templates/pi/SYSTEM.md`
  - `.pi/SYSTEM.md`
- BDD verification surfaces:
  - `apps/cli/features/init/init.spec.ts`
  - `apps/cli/features/steps/init.steps.ts`
  - `apps/cli/features/adoption/adoption.spec.ts`
  - `apps/cli/features/steps/adoption.steps.ts`
  - `apps/cli/features/steps/index.ts`
- Focused integration verification surfaces:
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
  - `tests/integration/doctor.test.ts`

## Test Surface
BDD-led hybrid.
- RED targets:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`
- Expected caller verification after GREEN:
  - `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
  - `pnpm typecheck`

## Constraints
- Keep each delegated task to about 3-5 files.
- Do not run project-wide build, test, or lint commands inside subagents.
- Keep final verification, Beads updates, and serving in the main session.
- No MCP path is required for this request; local repo evidence is sufficient.

## Decisions
- Run RED in two bounded slices: BDD assertions and focused integration assertions.
- Keep GREEN implementation serial because the production change is a tight 4-file contract cluster.
- Leave TLDR-specific doctor enforcement to `pi-harness-84z.3` unless a blocker forces that decision now.

## Open Questions
- What exact TLDR wording should be appended in the final system prompt?
- Should integration tests assert semantic tokens or exact prose?

## Requested Follow-up
- RED slices should return semantic failing assertions, not final wording decisions.

## Caller Verification
- `pnpm test:bdd -- apps/cli/features/init/init.spec.ts apps/cli/features/adoption/adoption.spec.ts`
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`

## Escalate If
- RED assertions cannot be written without first choosing exact final prompt copy.
- The implementation appears to require more than the 4 owned prompt-surface files.
