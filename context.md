# Code Context

## Work Item
untracked

## Request
From `dev`, running `pin feat/new-feature` in an existing repository should create the worktree, bootstrap it, and leave Pi able to start working in the new branch without failing on Beads.

## Knowledge
Cognee skipped. The failure was narrow and directly traceable from the checked-in Beads post-checkout hook, the worktree bootstrap script, and focused integration tests.

## Root Cause
`git worktree add` triggers `.beads/hooks/post-checkout`.
The hook always ran `bd hooks run post-checkout "$@"` whenever `bd` was installed.
In existing repos that had scaffolded `.beads/` files but had not yet run `bd init`, `bd` exited with:

- `Error: no beads database found`

That non-zero hook exit aborted worktree creation before Pi could continue.

## Files Inspected
- `.beads/hooks/post-checkout`
- `src/templates/root/beads-hooks/post-checkout`
- `scripts/bootstrap-worktree.sh`
- `tests/integration/bootstrap-worktree.test.ts`
- `tests/integration/cli-init.test.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/doctor.test.ts`

## Behavior Contract
- Before `bd init`: skip the Beads post-checkout call, but still run worktree bootstrap.
- After Beads is actually initialized: continue running `bd hooks run post-checkout`.
- If an initialized Beads hook fails: preserve that failure and return non-zero after bootstrap.

## Initialization Signal Used
The hook now treats Beads as initialized only when local runtime markers exist:
- `.beads/dolt`
- or `.beads/redirect`

The hook checks both the current checkout and the canonical main worktree so linked worktrees still honor initialized Beads state.

## Narrow Verification Clues
- Repro seam: `pnpm test -- tests/integration/bootstrap-worktree.test.ts`
- Regression seams: `pnpm test -- tests/integration/cli-init.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts`
