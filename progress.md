# Progress

## Work Item
untracked

## Status
Completed

## Test Strategy
Hybrid, integration-led. Reused the latest Cognee brief already captured in `context.md`/`plan.md`; local repo files remained authoritative.

## Tasks
- [x] Tightened the serve contract so publish flows require a usable local `STICKYNOTE.md`, create or refresh an explicit PR body from `## Completed This Session`, and print a short post-serve branch summary.
- [x] Kept `/serve` prompt-native while aligning prompt/template guidance with the stricter serve contract and plain-language serve intent.
- [x] Switched linked worktrees to a main-worktree-canonical `STICKYNOTE.md` while preserving local-only/untracked behavior and first-run seeding from `STICKYNOTE.example.md`.
- [x] Strengthened the scaffolded `STICKYNOTE.example.md` handoff template for serve-ready summaries.
- [x] Documented the muninn comparison and the decision to keep automatic Cognee sync limited to curated Pi artifacts rather than `STICKYNOTE.md` or raw PR metadata.
- [x] Extended parity/doctor coverage so the serve prompt and runtime enforce the new completed-work, PR-refresh, and post-serve-summary contract.

## Files Changed
- `scripts/serve.sh` - requires a usable local `STICKYNOTE.md`, builds/refreshes explicit PR bodies, and prints a post-serve branch summary.
- `src/templates/pi/scripts/serve.sh` - mirrored the serve runtime changes in the scaffold template.
- `.pi/prompts/serve.md` - documented the prompt-native `/serve` contract, STICKYNOTE requirements, PR body refresh, and post-serve reporting.
- `src/templates/pi/prompts/serve.md` - kept template parity with the runtime serve prompt.
- `scripts/bootstrap-worktree.sh` - links linked worktrees back to the main-worktree canonical `STICKYNOTE.md` and preserves initial seeding behavior.
- `src/templates/pi/scripts/bootstrap-worktree.sh` - mirrored the bootstrap/STICKYNOTE behavior in the scaffold template.
- `STICKYNOTE.example.md` - strengthened the local-only handoff template with serve-ready completed-work fields.
- `src/templates/project-docs/STICKYNOTE.md` - kept scaffold parity with the stronger STICKYNOTE template.
- `docs/bake-usage.md` - recorded the muninn comparison and the curated knowledge-sync decision.
- `src/commands/doctor.ts` - tightened prompt/runtime contract checks for STICKYNOTE guidance, explicit PR refresh, and post-serve summary output.
- `tests/integration/serve-script.test.ts` - added coverage for explicit PR bodies, existing PR refresh, STICKYNOTE gating, and post-serve summaries.
- `tests/integration/bootstrap-worktree.test.ts` - added coverage for canonical main-worktree STICKYNOTE linking and persistence across linked worktrees.
- `tests/integration/init.test.ts` - aligned scaffold expectations with the stronger STICKYNOTE template and serve contract.
- `tests/integration/scaffold-snapshots.test.ts` - aligned scaffold snapshots with explicit PR-body refresh and post-serve summary behavior.
- `tests/integration/docs-alignment.test.ts` - tightened serve prompt parity expectations for STICKYNOTE and explicit PR-body refresh guidance.
- `tests/integration/doctor.test.ts` - added regression coverage for missing serve prompt guidance and missing explicit PR refresh behavior.

## Verification Evidence
- RED: `pnpm test -- tests/integration/serve-script.test.ts` failed before the serve-script changes because the old flow still used `gh pr create --fill`, lacked post-serve summary output, and only warned when `STICKYNOTE.md` was missing or untouched.
- GREEN: `pnpm test -- tests/integration/serve-script.test.ts` passed after implementing explicit PR body creation/update, STICKYNOTE gating, and post-serve summary output.
- RED: `pnpm test -- tests/integration/bootstrap-worktree.test.ts` failed before the bootstrap changes because linked worktrees still received copied `STICKYNOTE.md` files instead of a main-worktree canonical note.
- GREEN: `pnpm test -- tests/integration/bootstrap-worktree.test.ts` passed after linking linked worktrees back to the main-worktree `STICKYNOTE.md`.
- RED: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts` failed before parity updates because they still expected the old STICKYNOTE template wording and `gh pr create --fill` behavior.
- GREEN: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts` passed after aligning scaffold expectations.
- REFACTOR: `pnpm test -- tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts` passed after tightening prompt/runtime contract coverage.
- Caller verification: `pnpm test -- tests/integration/serve-script.test.ts tests/integration/bootstrap-worktree.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts` passed.

## Notes
- `bd ready --json` returned `[]`, so this work remains `untracked`.
- Automatic Cognee sync remains intentionally limited to curated Pi artifacts (`context.md`, `plan.md`, `progress.md`, `review.md`, `wave.md`); this change does not upload `STICKYNOTE.md`, raw PR bodies, or raw post-serve summaries.
