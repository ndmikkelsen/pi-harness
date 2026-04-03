# {{APP_TITLE}}

This project is scaffolded for the local AI workflow used across {{ASSISTANT_LABEL}}, GSD, Beads, and Cognee.

## What was added

- Planning artifacts in .planning/
- Codex/OpenCode runtime files in .codex/
- Repo setup skill in .codex/skills/harness/
- Beads workflow guidance using native `bd`
- Deployment templates in config/ and .kamal/
{{CODEx_BULLET}}

## Harness baseline

- Scaffolded with `ai-harness` v{{HARNESS_VERSION}} on {{GENERATED_ON}}
- Record the `ai-harness` version and source commit in the PR or handoff note each time you refresh this scaffold
- Supported update flow today is checkout-based: pull the `ai-harness` checkout forward, rebuild `dist/`, rerun `ai-harness --mode existing <path> --assistant <codex|opencode> --init-json`, then customize only `createdPaths`
- This scaffold assumes `ai-harness` is used locally to set up and refresh repos, not consumed as a registry-published package
- Finish updates with `ai-harness doctor <path> --assistant <codex|opencode>`

## If you are migrating from scaiff

- `ai-harness` is the renamed successor to `scaiff`
- use `ai-harness` for installs and updates; there is no separate `scaiff` binary or package alias
- the old global OpenCode skill name `scaiff-repo-setup` is replaced by `harness`
- use `--cleanup-manifest legacy-ai-frameworks-v1` only when you intentionally want curated legacy workflow leftovers removed

## Next steps

1. Update .planning/PROJECT.md with the real product definition.
2. {{WORKFLOW_GUIDE_LINE}}
3. Copy .env.example to .env and fill in local values.
4. If you use OpenCode worktrees, install `kdco/worktree` with `ocx add kdco/worktree --from https://registry.kdco.dev`; this scaffold includes `.opencode/worktree.jsonc` and reuses `./.codex/scripts/bootstrap-worktree.sh` as the post-create hook.
5. If `pre-commit` is installed locally, ai-harness already wires the worktree bootstrap hook; otherwise keep `scripts/hooks/post-checkout` available for later hook installation.
6. Run `bd init` once in the repository before using Beads.
7. Use `bd ready --json`, `bd update <id> --claim --json`, and `/gsd-next` as the default work loop.
8. Create a feature branch before your first commit.
9. If you use OpenCode, rerun `ai-harness install-skill --assistant opencode` after harness updates to refresh the managed `harness` skill, `~/.config/opencode/oh-my-opencode.json`, `~/.config/opencode/get-shit-done/workflows/autonomous.md`, and `~/.gsd/defaults.json`.
10. Use `.codex/skills/harness/SKILL.md` when adopting or bootstrapping another repository.
11. If you are adopting a repo with legacy AI framework files, use `ai-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json`.
12. Let an execution/autonomous landing lane run `./.codex/scripts/land.sh` from your feature branch once verification passes; it publishes the branch and ensures a PR to `dev` exists.
