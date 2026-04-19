# Execution Approach

## Mode
Direct

## Work Item
`untracked`
- PR: `#44` (`dev` -> `main`)
- Beads: `bd ready --json` returned `[]`; no active ready issue was claimed for this slice.

## Knowledge
- GitHub MCP was used for PR inspection.
- Shell fallback was required for conflict resolution because the merge itself had to be resolved in git, not through a GitHub-side update action.
- The conflicting surfaces were workflow artifacts plus one test expectation.

## Test Strategy
Hybrid.
- Keep the merge resolution minimal and preserve both landed feature sets.
- Verify the merged workflow scaffold/test surfaces with targeted commands.
- Squash merge only after the PR returns to a clean mergeable state.

## Decision Rationale
- This task is operational and bounded: resolve the PR conflict, keep both change sets, verify, and merge.
- Direct mode is better than delegation because the conflict scope is small, the affected files are already known, and adding a subagent handoff would add overhead without reducing risk.
- The safe resolution is to keep both the swarm-lane changes from `main` and the direct GitHub MCP support for `lead` from `dev`.

## Routing Signals
- Hard triggers present:
  - explicit PR conflict resolution
  - explicit squash-merge request
  - GitHub-native repository operation
- Soft triggers present:
  - workflow artifact drift after branch divergence
  - targeted verification needed after auto-merge updates
- Why the split stays safe:
  - only four files needed manual conflict resolution
  - the functional code/test changes auto-merged cleanly

## Agents / Chains
- none; direct merge-unblock path

## Delegation Units
- none

## Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts tests/integration/role-workflow.test.ts`
- `pnpm typecheck`
- PR #44 must show mergeable before squash merge.

## Risks
- The repo-root workflow artifacts are hand-maintained and can drift during branch merges.
- If branch protection or GitHub mergeability metadata lags, the merge step may need a short retry after push.
