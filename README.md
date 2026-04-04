# Pi Harness

This project is scaffolded for a Pi-operated Codex workflow with Beads and Cognee.

## What was added

- Codex runtime files in `.codex/`
- Repo setup guidance in `.codex/skills/harness/`
- Beads workflow guidance using native `bd`
- Deployment templates in `config/` and `.kamal/`
- - Codex runtime files in .codex/ and AGENTS.md

## Harness baseline

- Scaffolded with `ai-harness` v0.1.0 on 2026-04-04.
- Record the `ai-harness` version and source commit in the PR or handoff note each time you refresh this scaffold.
- Supported update flow is checkout-based: pull the `ai-harness` checkout forward, rebuild `dist/`, rerun `ai-harness --mode existing <path> --assistant codex --init-json`, then customize only `createdPaths`.
- This scaffold assumes `ai-harness` is used locally to set up and refresh repos, not consumed as a registry-published package.
- Finish updates with `ai-harness doctor <path> --assistant codex`.

## If you are migrating from scaiff

- `ai-harness` is the renamed successor to `scaiff`.
- Use `ai-harness` for installs and updates; there is no separate `scaiff` binary or package alias.
- Use `--cleanup-manifest legacy-ai-frameworks-v1` only when you intentionally want curated legacy workflow leftovers removed.

## Next steps

1. Read `.rules/patterns/operator-workflow.md`.
2. Review .rules/patterns/operator-workflow.md, AGENTS.md, and .codex/README.md.
3. Copy `.env.example` to `.env` and fill in local values.
4. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
5. If `pre-commit` is installed locally, `ai-harness` already wires the worktree bootstrap hook; otherwise keep `scripts/hooks/post-checkout` available for later hook installation.
6. Run `bd init` once in the repository before using Beads.
7. Use `bd ready --json`, `bd update <id> --claim --json`, and `./.codex/scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide research.
8. Create a feature branch before your first commit.
9. Use `.codex/skills/harness/SKILL.md` when adopting or bootstrapping another repository.
10. If you are adopting a repo with legacy AI framework files, use `ai-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json`.
11. Let an execution/autonomous landing lane run `./.codex/scripts/land.sh` from your feature branch once verification passes; it publishes the branch and ensures a PR to `dev` exists.
