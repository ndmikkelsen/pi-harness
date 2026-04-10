# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee was skipped because this is a bounded merge-conflict resolution and local repository evidence was sufficient. `bd ready --json` returned `[]`.

## Test Strategy
Verification-led merge resolution.
- Preserve the existing bake/serve changes from the feature branch.
- Preserve the newer GitHub MCP and promote-workflow changes from `dev`.
- Prove the merged baseline with targeted integration coverage plus `typecheck` and `build`.

## Agents / Chains
Main session only. The conflicted files overlap heavily across docs, templates, generator wiring, and tests, so splitting this into subagents would have increased merge risk.

## Verification
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts tests/integration/cli-init.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/promote-script.test.ts tests/integration/serve-script.test.ts tests/integration/cli-doctor.test.ts`
- `pnpm typecheck`
- `pnpm build`

## Risks
- The biggest risk is losing one side of the merged scaffold contract during conflict resolution.
- Template/runtime parity must stay exact or future scaffold refreshes will drift.
