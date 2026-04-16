# Code Context

## Work Item
`untracked` — fix existing-repo bake refresh so `.env.example` does not duplicate scaffold entries that are already present.

## Knowledge Brief
- Beads: `bd ready --json` returned `[]`; no ready issue was available to claim.
- Cognee: skipped because targeted repository reads were already sufficient.
- Execution Surface: shell fallback with reason — no MCP-backed system was requested; this change is local repository code and tests.

## Inputs Consumed
- `README.md`
- `.pi/skills/bake/SKILL.md`
- `src/generators/root.ts`
- `src/templates/root/env.example`
- `src/templates/root/env.example-append.md`
- `tests/integration/cli-init.test.ts`
- `tests/integration/init.test.ts`
- `apps/cli/features/adoption/adoption.feature`
- `apps/cli/features/adoption/adoption.spec.ts`
- `apps/cli/features/steps/adoption.steps.ts`
- user-provided `.env.example` duplicate output
- `wave.md`

## Key Contracts
- New repos should still get the full scaffolded `.env.example`.
- Existing repos in merge mode should keep custom entries and add only missing scaffold keys.
- Existing keys like `APP_ENV` or `LLM_API_KEY` must not be duplicated by the scaffold append block.
- The append contract should stay aligned with the main `.env.example` template, including `GITHUB_PERSONAL_ACCESS_TOKEN`.

## Allowed Files
- `src/generators/root.ts`
- `src/templates/root/env.example-append.md`
- `tests/integration/cli-init.test.ts`
- `tests/integration/init.test.ts`
- `apps/cli/features/adoption/adoption.feature`
- `apps/cli/features/adoption/adoption.spec.ts`
- `apps/cli/features/steps/adoption.steps.ts`

## Non-Goals
- do not change provider/model runtime policy
- do not broaden into unrelated bake cleanup or doctor rules
- do not normalize or reorder user-managed `.env.example` content beyond the append block

## Decisions
- Treat this as hybrid verification: focused integration tests plus adoption BDD coverage.
- Fix the merge behavior in `src/generators/root.ts` by deduping on env-variable key, not raw appended block presence.
- Keep the append template current with the full scaffold contract by including `GITHUB_PERSONAL_ACCESS_TOKEN`.

## Open Questions
- none

## Requested Follow-up
- none

## Caller Verification
- `pnpm test -- tests/integration/cli-init.test.ts tests/integration/init.test.ts`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- `pnpm typecheck`

## Escalate If
- future bake refreshes need to reconcile values for existing keys instead of just avoiding duplicates
- `.env.example` merging needs to support more complex env syntaxes than simple `KEY=value` lines
