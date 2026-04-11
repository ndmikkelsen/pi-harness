# Execution Approach

## Mode
Direct closeout

## Work Item
untracked — resolve `dev` -> `main` promotion PR conflicts and refresh PR #16

## Knowledge
- `bd ready --json` returned `[]`.
- Cognee was skipped because this is a bounded release-conflict fix and repository/PR state is sufficient.
- The current release PR is `https://github.com/ndmikkelsen/pi-harness/pull/16`.
- This is a promotion lane on `dev`, so the publish step is `/promote` / `./scripts/promote.sh` rather than feature-branch `/serve`.

## Test Strategy
Merge-verification only.
- Surface conflicts locally by merging `origin/main` into `dev`.
- Resolve only the conflicting handoff artifacts.
- Re-run the release verification path and push `dev`.
- Confirm PR #16 returns to a mergeable state.

## Agents / Chains
Main session only. The task is small, overlap-heavy, and not worth splitting.

## Verification
Target path:
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:bdd`
- `pnpm test:smoke:dist`
- `gh pr view 16 --json mergeable,mergeStateStatus`

## Risks
- Accidentally changing release behavior while resolving note-file conflicts.
- Forgetting to refresh the already-open PR after pushing the merge fix.
