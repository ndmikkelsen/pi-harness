# Serve the current feature branch

Use this prompt when implementation and verification are complete and the current session is allowed to publish.

## Checklist
1. Confirm the current branch is a feature branch, not `main` or `dev`.
2. Review Beads state and make sure issue status matches the latest verification evidence.
3. Run the narrowest verification that proves the finished work is still valid if fresh evidence is needed.
4. Fill in or refresh the local `STICKYNOTE.md` before serving; it must stay untracked, differ from `STICKYNOTE.example.md`, and include a completed-work summary under `## Completed This Session`.
5. Use `/serve` as the canonical Pi-native entrypoint and let it drive `./scripts/serve.sh --commit-message "<message>"` when publish is allowed.
6. Generate or confirm the commit message before invoking `scripts/serve.sh`; if you truly need custom flags, run the script directly rather than shadowing `/serve` with a project-local extension command.
7. Confirm the explicit PR description/body that serving will create or refresh from `STICKYNOTE.md`, and make sure it includes the completed-work summary you want reviewers to see.
8. Treat plain-language requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to run the same `/serve` workflow when publishing is allowed in the current lane.
9. Let serving sync shared Pi artifacts like `context.md`, `plan.md`, `progress.md`, `review.md`, and `wave.md` to Cognee when the local bridge is available.
10. Report the pushed branch, pull request URL, refreshed PR body/completed-work summary, post-serve branch summary, verification evidence, and any follow-up issues.

## Guardrails
- Planning, research, and review lanes must hand off instead of publishing.
- Keep `/serve` prompt-native; do not shadow it with a project-local extension command.
- `scripts/serve.sh` must never merge into or push directly to `main`.
- Serving now fails unless `STICKYNOTE.md` is present, still local-only, and updated beyond the untouched template before the PR is created or refreshed.
- Serving refreshes the PR body for both new and existing PRs; do not rely on `gh pr create --fill` or a stale body.
- If serving fails, fix the cause and retry rather than stopping with unpublished local work.
