# Serve the current feature branch

Use this prompt when implementation and verification are complete and the current session is allowed to publish.

## Checklist
1. Confirm the current branch is a feature branch, not `main` or `dev`.
2. Review Beads state and make sure issue status matches the latest verification evidence.
3. Run the narrowest verification that proves the finished work is still valid if fresh evidence is needed.
4. Use `/serve` as the canonical Pi-native entrypoint and let it drive `./scripts/serve.sh --commit-message "<message>"` when publish is allowed.
5. Generate or confirm the commit message before invoking `scripts/serve.sh`; if you truly need custom flags, run the script directly rather than shadowing `/serve` with a project-local extension command.
6. Treat plain-language requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to run the same `/serve` workflow when publishing is allowed in the current lane.
7. Let serving sync shared Pi artifacts like `context.md`, `plan.md`, `progress.md`, `review.md`, and `wave.md` to Cognee when the local bridge is available.
8. Report the pushed branch, pull request URL, verification evidence, and any follow-up issues.

## Guardrails
- Planning, research, and review lanes must hand off instead of publishing.
- Keep `/serve` prompt-native; do not shadow it with a project-local extension command.
- `scripts/serve.sh` must never merge into or push directly to `main`.
- `STICKYNOTE.md` remains a local bootstrap artifact; serving may warn if it is missing but it does not rewrite the file for you.
- If serving fails, fix the cause and retry rather than stopping with unpublished local work.
