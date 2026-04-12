# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee skipped. The failure was already narrow and locally diagnosable from the Beads post-checkout hook, bootstrap script, and worktree integration tests.

## Test Strategy
TDD.
- RED: reproduce the worktree failure as an integration case where the Beads hook fires in an uninitialized existing repo during `git worktree add`.
- GREEN: make the Beads hook run only when Beads local runtime state exists for the current checkout or the canonical main worktree.
- REFACTOR: keep initialized-hook behavior intact, including propagated hook failures and worktree bootstrap after hook execution.

## Agents / Chains
None. This was a small direct change touching the tracked Beads hook template, the dogfood hook copy, and focused integration coverage.

## Verification
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts tests/integration/cli-init.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts`

## Risks
- The hook now treats Beads local runtime markers (`.beads/dolt` or `.beads/redirect`) as the initialization signal. If a future `bd` version changes that contract, the guard and tests will need to move with it.
- Existing repos with already-tracked older hook content need this updated hook file to pick up the no-`bd init` safeguard.
