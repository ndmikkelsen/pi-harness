# {{APP_TITLE}}

This project is scaffolded for a Pi-operated {{ASSISTANT_LABEL}} workflow with Beads, Cognee, and Pi-native orchestration assets.

## What was added

- Pi-native orchestration assets in `.omp/`
- Codex compatibility files in `.codex/`
- Repo setup guidance in `.codex/skills/harness/`
- Beads workflow guidance using native `bd`
- Deployment templates in `config/` and `.kamal/`
- {{CODEx_BULLET}}

## Harness baseline

- Scaffolded with `pi-harness` v{{HARNESS_VERSION}} on {{GENERATED_ON}}.
- Record the `pi-harness` version and source commit in the PR or handoff note each time you refresh this scaffold.
- Supported update flow is checkout-based: pull the `pi-harness` checkout forward, rebuild `dist/`, rerun `pi-harness --mode existing <path> --assistant codex --init-json`, then customize only `createdPaths`.
- This scaffold assumes `pi-harness` is used locally to set up and refresh repos, not consumed as a registry-published package.
- Finish updates with `pi-harness doctor <path> --assistant codex`.

## If you are migrating from scaiff

- `pi-harness` is the renamed successor to `scaiff`.
- Use `pi-harness` for installs and updates; there is no separate `scaiff` binary or package alias.
- Use `--cleanup-manifest legacy-ai-frameworks-v1` only when you intentionally want curated legacy workflow leftovers removed.

## Next steps

1. Read `.rules/patterns/operator-workflow.md`.
2. {{WORKFLOW_GUIDE_LINE}}
3. Copy `.env.example` to `.env` and fill in local values.
4. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
5. If `pre-commit` is installed locally, `pi-harness` already wires the worktree bootstrap hook; otherwise keep `scripts/hooks/post-checkout` available for later hook installation.
6. Run `bd init` once in the repository before using Beads.
7. Use `.rules/patterns/operator-workflow.md` for the daily Beads + Cognee loop, `.omp/agents/*.md` plus `.omp/skills/*/SKILL.md` for Pi-native orchestration help, and `.codex/workflows/autonomous-execution.md` when you want backlog-driven automation.
8. Create a feature branch before your first commit.
9. Use `.codex/skills/harness/SKILL.md` when adopting or bootstrapping another repository.
10. If you are adopting a repo with legacy AI framework files, use `pi-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json`.
11. Let an execution/autonomous landing lane run `./.codex/scripts/land.sh` from your feature branch once verification passes; it publishes the branch and ensures a PR to `dev` exists.