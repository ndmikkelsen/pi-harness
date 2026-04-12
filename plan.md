# Implementation Plan

## Work Item
untracked — allow `pin feat/new-feature` to create a worktree from `dev` in an existing repo before `bd init`.

## Goal
Stop uninitialized Beads checkout hooks from aborting `git worktree add`, while preserving normal Beads hook behavior after initialization.

## Test Strategy
TDD.

## RED
- Add or run a focused integration case showing worktree creation fails when the Beads hook fires before initialization.
- Command: `pnpm test -- tests/integration/bootstrap-worktree.test.ts`

## GREEN
- Update the tracked Beads post-checkout hook and template copy so `bd hooks run post-checkout` only runs when Beads runtime state exists.
- Keep `scripts/bootstrap-worktree.sh` execution in place for both initialized and uninitialized repos.

## REFACTOR
- Use the same guard in the dogfood hook and template hook.
- Keep follow-on regression checks green for init/scaffold/doctor coverage.

## Files
- `.beads/hooks/post-checkout`
- `src/templates/root/beads-hooks/post-checkout`
- `tests/integration/bootstrap-worktree.test.ts`

## Caller Verification
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts tests/integration/cli-init.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts`

## Risks
- The initialization guard depends on current Beads runtime markers (`.beads/dolt` or `.beads/redirect`). If Beads changes that contract later, this hook guard must change with it.
