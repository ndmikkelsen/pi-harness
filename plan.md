# Implementation Plan

## Work Item
untracked — resolve merge conflicts between `feat/bake` and `origin/dev`

## Goal
Keep the `feat/bake` PR mergeable into `dev` by reconciling the bake/serve changes with the newer GitHub MCP and promote workflow updates already on `dev`.

## Knowledge Inputs
- `bd ready --json` returned `[]`, so there is no active Beads issue.
- Cognee was skipped for this pass because the task is a bounded merge-conflict resolution and local git/doc/test context is sufficient.
- Primary sources: `AGENTS.md`, `README.md`, `docs/bake-usage.md`, `src/generators/pi.ts`, `src/commands/doctor.ts`, and the conflicted integration tests.

## Test Strategy
Verification-led merge resolution.
- No new user-facing behavior is being designed here; the goal is to preserve both already-tested changesets.
- Reconcile conflicted files to keep the `feat/bake` surfaces plus `dev` additions for `.pi/mcp.json`, `npm:pi-mcp-adapter`, and `/promote`.
- Run the narrow integration/typecheck/build suite that covers scaffold parity, doctor alignment, and init behavior after conflicts are resolved.

## Tasks
1. Resolve conflicted runtime docs/prompts/templates in favor of the combined bake + MCP + promote baseline.
2. Resolve conflicted generator/doctor logic so scaffolded projects keep both the bake rename and the newer MCP/promote wiring.
3. Resolve conflicted integration tests so they assert the merged baseline rather than either side independently.
4. Refresh repo-local handoff artifacts for this merge-resolution session.
5. Verify with targeted test, typecheck, and build commands.

## Verification
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts tests/integration/cli-init.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/promote-script.test.ts tests/integration/serve-script.test.ts tests/integration/cli-doctor.test.ts`
- `pnpm typecheck`
- `pnpm build`

## Risks
- The main risk is silently dropping either the bake rename/serve contract or the newer MCP/promote additions during conflict resolution.
- Dogfood/template parity must stay exact or the docs-alignment and snapshot tests will drift.
