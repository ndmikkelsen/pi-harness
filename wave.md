# Execution Approach

## Mode
Direct

## Work Item
`untracked`
- Beads: `bd ready --json` returned `[]`; no active ready issue was claimed for this slice.

## Knowledge
- Cognee: skipped; local repository evidence was sufficient.
- `lead` now has direct GitHub MCP support in both the scaffold/runtime contract and live role activation.
- A fresh live Pi startup probe confirmed `activeGithubToolCount: 26` for `lead`.
- Serve was attempted and verification passed; publish retry work is only about branch synchronization with `origin/feat/paralell-agents`.

## Test Strategy
TDD-first for the activation bug, then serve-lane verification.
- Focused regression for role activation.
- Targeted integration/typecheck proof for the scaffold/runtime contract.
- Full serve-lane verification through `./scripts/serve.sh`.

## Decision Rationale
- The branch is now technically ready to publish.
- The remaining blocker is operational: local branch history needed to be rebased onto the newer remote feature-branch tip before push/PR refresh can complete.
- `wave.md` is being refreshed here only to resolve the rebase conflict with the latest accurate status.

## Routing Signals
Hard triggers present:
- publish/serve intent
- branch synchronization required after a failed push

Soft triggers present:
- tracked workflow artifact conflict during rebase

Why direct mode is safe:
- no new design/planning split is needed
- the remaining work is operational branch synchronization plus retrying serve

## Agents / Chains
- none; direct publish retry path

## Inputs Consumed
- latest focused Vitest verification
- latest targeted integration verification
- latest live `lead` startup probe
- serve retry failure output showing remote branch divergence

## Decisions
- Keep the GitHub MCP fix.
- Rebase onto `origin/feat/paralell-agents`, resolve `wave.md`, and continue the publish retry.
- Retry serving after branch sync instead of abandoning unpublished local work.

## Caller Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/role-workflow.test.ts`
- `pnpm typecheck`
- live Pi probe showing `activeGithubToolCount: 26` for `lead`

## Execution Surface
- shell fallback for repo publish mechanics via `./scripts/serve.sh`
- no shell fallback for GitHub MCP repository operations was needed for the feature itself

## Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/role-workflow.test.ts` ✅
- `pnpm typecheck` ✅
- live Pi startup probe for `lead` GitHub MCP activation ✅
- `./scripts/serve.sh` verification lane ✅ before push retry

## Risks
- If remote branch history changes again before retry, another sync may be required.
- The activation matcher still depends on current GitHub MCP direct-tool naming/catalog and may need refresh if upstream naming changes.
