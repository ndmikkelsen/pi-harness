# Land the current feature branch

Use this prompt when implementation and verification are complete and the current session is allowed to publish.

## Checklist
1. Confirm the current branch is a feature branch, not `main` or `dev`.
2. Review Beads state and make sure issue status matches the latest verification evidence.
3. Run the narrowest verification that proves the finished work is still valid if fresh evidence is needed.
4. Use `/land` or run `./scripts/land.sh`.
5. Report the pushed branch, pull request URL, verification evidence, and any follow-up issues.

## Guardrails
- Planning, research, and review lanes must hand off instead of publishing.
- `scripts/land.sh` must never merge into or push directly to `main`.
- If landing fails, fix the cause and retry rather than stopping with unpublished local work.
