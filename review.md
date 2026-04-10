# Review

## Verdict
Pending verification

## Scope Reviewed
- Merge-conflicted docs/prompts/templates
- Generator and doctor alignment
- Integration test expectations for the merged scaffold baseline

## Key Checks
- The merged baseline should still include bake-era naming and serve behavior.
- The merged baseline should also retain `npm:pi-mcp-adapter`, `.pi/mcp.json`, and the separate `/promote` / `scripts/promote.sh` release flow from `dev`.
- Dogfood/template parity should remain exact.

## Verification to Run
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts tests/integration/cli-init.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/promote-script.test.ts tests/integration/serve-script.test.ts tests/integration/cli-doctor.test.ts`
- `pnpm typecheck`
- `pnpm build`
