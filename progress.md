# Progress

## Work Item
untracked — merge `origin/main` back into `dev`, refresh the release PR to `main`, and complete the promotion.

## Completed
- Fast-forwarded local `dev` to `origin/dev`.
- Merged `origin/main` into `dev` and reconciled conflicts by keeping the current `/bake` runtime, template, docs, and test contract from `dev`.
- Replaced conflicting tracked handoff artifacts with current-session promotion notes.
- Ready for release verification and PR refresh to `main`.

## Changed Files
- merge-resolution updates across `.pi/*`, `src/*`, `docs/*`, `README.md`, and `tests/*`
- `progress.md`
- `review.md`
- `wave.md`

## Verification
Pending after merge resolution:
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:bdd`
- `pnpm test:smoke:dist`
- `gitleaks detect --source . --config .gitleaks.toml`

## Notes
- Promotion must continue from `dev` through `./scripts/promote.sh`.
- If the refreshed PR to `main` is mergeable, finish by merging it through GitHub rather than pushing directly to `main`.
