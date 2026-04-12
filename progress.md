# Progress

## Work Item
untracked

## Status
Completed

## Test Strategy
TDD
- Cognee skipped because the failure was already narrow and locally diagnosable.
- RED: reproduce the worktree failure before `bd init` in `tests/integration/bootstrap-worktree.test.ts`.
- GREEN: gate the Beads hook on real local initialization state.
- REFACTOR: keep initialized-hook failure propagation and broader scaffold regressions intact.

## Tasks
- [x] Identify why `git worktree add` fails during `pin feat/new-feature` in an existing repo.
- [x] Update the Beads post-checkout hook to skip `bd hooks run post-checkout` before Beads initialization.
- [x] Mirror the same guard in the scaffold template.
- [x] Add focused integration coverage for the uninitialized-repo path.
- [x] Preserve failure propagation once Beads is actually initialized.

## Files Changed
- `.beads/hooks/post-checkout` - now checks current and canonical `.beads` runtime markers before invoking `bd hooks run post-checkout`.
- `src/templates/root/beads-hooks/post-checkout` - mirrors the same initialization guard for generated/adopted repos.
- `tests/integration/bootstrap-worktree.test.ts` - covers both the pre-`bd init` success path and the initialized-hook failure path.
- `context.md`, `plan.md`, `progress.md`, `review.md`, `wave.md` - refreshed to describe this work accurately before serving.

## Verification Evidence
- Focused TDD seam:
  - `pnpm test -- tests/integration/bootstrap-worktree.test.ts`
- Caller-side regression sweep:
  - `pnpm test -- tests/integration/bootstrap-worktree.test.ts tests/integration/cli-init.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts`

## Notes
- `bd ready --json` returned `[]`, so this work remained `untracked`.
- Real initialization is detected from `.beads/dolt` or `.beads/redirect`, not just tracked metadata.
- Verified by direct reproduction: with no Beads runtime state, `git worktree add` now succeeds; with runtime state present and a failing `bd hooks run post-checkout`, the hook still returns non-zero after bootstrap.
