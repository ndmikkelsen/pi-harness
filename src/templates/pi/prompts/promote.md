# Promote `dev` to `main`

Use this prompt when the current `dev` branch is verified and ready for a release PR to `main`.

## Checklist
1. Confirm the current branch is `dev`; use `/serve` instead when you are still on a feature branch.
2. Review Beads state and make sure the release work or parent issue reflects the latest verification evidence.
3. Run or confirm the freshest verification evidence that proves `dev` is ready for `main`.
4. Use `/promote` as the canonical Pi-native entrypoint and let it drive `./scripts/promote.sh` when the current lane is allowed to publish a release PR.
5. Confirm the explicit PR description/body that promotion will create or refresh from the `dev` vs `main` commit summary.
6. Report the pushed `dev` branch state, pull request URL to `main`, refreshed PR body summary, post-promotion summary, verification evidence, and any follow-up issues.

## Guardrails
- `scripts/promote.sh` is the separate `dev` -> `main` release step; do not overload `/serve` with main-promotion work.
- Promotion requires a clean `dev` worktree, ignoring only the local-only untracked `STICKYNOTE.md` handoff note.
- Promotion refreshes the PR body for both new and existing PRs; do not rely on a stale release PR description.
- `scripts/promote.sh` must never merge into or push directly to `main`; it only pushes `dev` and manages the PR to `main`.
- Planning, research, and review lanes must hand off instead of publishing.
