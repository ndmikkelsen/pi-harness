# Progress

## Work Item
`untracked`

## Status
Completed

## Test Strategy
Hybrid
- Beads: unavailable for this slice (`bd ready --json` returned `[]`)
- Cognee: skipped because local repository evidence was already sufficient
- Execution Surface: shell fallback with reason — no MCP-backed system was requested; work stayed within local files and focused test commands
- RED: expand merge-mode regressions so duplicate env keys fail
- GREEN: dedupe merge entries by env key and align the append template with the full scaffold env contract
- REFACTOR: keep assertions focused on key counts and preserved custom content

## Inputs Consumed
- `context.md`
- `plan.md`
- `wave.md`
- `src/generators/root.ts`
- `src/templates/root/env.example-append.md`
- `tests/integration/cli-init.test.ts`
- `tests/integration/init.test.ts`
- `apps/cli/features/adoption/adoption.feature`
- `apps/cli/features/adoption/adoption.spec.ts`
- `apps/cli/features/steps/adoption.steps.ts`

## Allowed Files
- `src/generators/root.ts`
- `src/templates/root/env.example-append.md`
- `tests/integration/cli-init.test.ts`
- `tests/integration/init.test.ts`
- `apps/cli/features/adoption/adoption.feature`
- `apps/cli/features/adoption/adoption.spec.ts`
- `apps/cli/features/steps/adoption.steps.ts`
- `progress.md`

## Non-Goals
- no unrelated bake cleanup changes
- no provider/model runtime changes
- no doctor contract changes

## Files Changed
- `src/generators/root.ts`
  - added env-key extraction and `.env.example` merge logic that appends only missing keys
- `src/templates/root/env.example-append.md`
  - added `GITHUB_PERSONAL_ACCESS_TOKEN` so merged existing repos receive the full current scaffold env contract
- `tests/integration/cli-init.test.ts`
  - added regression assertions for preserved custom entries, unique key counts, and merged GitHub token presence
- `tests/integration/init.test.ts`
  - mirrored integration coverage for non-CLI init path
- `apps/cli/features/adoption/adoption.feature`
  - clarified the merge scenario to require only missing `.env.example` keys
- `apps/cli/features/adoption/adoption.spec.ts`
  - matched the updated BDD step text
- `apps/cli/features/steps/adoption.steps.ts`
  - made the adoption fixture realistic and asserted no duplicate env keys after merge

## Decisions
- Deduplicate `.env.example` merge content by env variable key instead of blindly appending the entire block.
- Preserve existing custom values like `APP_ENV=production` and `LLM_API_KEY=EXISTING_KEY`.
- Keep the scaffold marker block for newly added keys only.
- Align the append template with the main `.env.example` template by including `GITHUB_PERSONAL_ACCESS_TOKEN`.

## Open Questions
- none

## Requested Follow-up
- none

## Verification Evidence
- `pnpm test -- tests/integration/cli-init.test.ts tests/integration/init.test.ts`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- `pnpm typecheck`

## Caller Verification
```bash
pnpm test -- tests/integration/cli-init.test.ts tests/integration/init.test.ts \
  && pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts \
  && pnpm typecheck
```

## Escalate If
- existing merged files with a pre-existing scaffold marker also need automatic cleanup or deduplication
- env files must support syntax beyond the current one-assignment-per-line merge assumptions
