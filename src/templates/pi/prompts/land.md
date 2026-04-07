# Land the current feature branch

Use this prompt when implementation and verification are complete and the current session is allowed to publish.

## Checklist
1. Confirm the current branch is a feature branch, not `main` or `dev`.
2. Review Beads state and make sure issue status matches the latest verification evidence.
3. Run the narrowest verification that proves the finished work is still valid if fresh evidence is needed.
4. Use `/land` or run `./scripts/land.sh`.
5. Let landing sync shared Pi artifacts like `context.md`, `plan.md`, `progress.md`, `review.md`, and `wave.md` to Cognee when the local bridge is available.
6. Report the pushed branch, pull request URL, verification evidence, and any follow-up issues.

## Guardrails
- Planning, research, and review lanes must hand off instead of publishing.
- `scripts/land.sh` must never merge into or push directly to `main`.
- `STICKYNOTE.md` remains a local bootstrap artifact; landing may warn if it is missing but it does not rewrite the file for you.
- If landing fails, fix the cause and retry rather than stopping with unpublished local work.
