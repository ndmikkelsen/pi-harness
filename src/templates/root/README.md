# {{APP_TITLE}}

This project is scaffolded for vanilla Pi with Beads, Cognee, and plain repo scripts.
Provider and model choice stay inside Pi runtime configuration, not in the scaffold identity.
Shared subagent support comes from the `pi-subagents` Pi package declared in `.pi/settings.json`, while project-local role switching comes from `.pi/extensions/role-workflow.ts`.

## Runtime surfaces

The canonical workflow surfaces are:
- `AGENTS.md`
- `.pi/settings.json`
- `.pi/SYSTEM.md`
- `.pi/agents/*`
- `.pi/extensions/*`
- `.pi/prompts/*`
- `.pi/skills/*`
- `scripts/*`
- native `bd` with `.beads/**`
- deployment templates in `.config/`, `.docker/`, and `.kamal/`

## Harness baseline

- Scaffolded with `pi-harness` v{{HARNESS_VERSION}} on {{GENERATED_ON}}.
- Record the `pi-harness` version and source commit in the PR or handoff note each time you refresh this scaffold.
- Supported update flow is checkout-based: pull the `pi-harness` checkout forward, rebuild `dist/`, rerun `pi-harness --mode existing <path> --init-json`, then customize only `createdPaths`.
- Finish updates with `pi-harness doctor <path>`.
- This scaffold assumes `pi-harness` is used locally to set up and refresh repos, not consumed as a registry-published package.

## If you are migrating from scaiff

- `pi-harness` is the renamed successor to `scaiff`.
- Use `pi-harness` for installs and updates; there is no separate `scaiff` binary or package alias.
- Use `--cleanup-manifest legacy-ai-frameworks-v1` only when you intentionally want curated legacy workflow leftovers removed.

## Pi setup

1. Install Pi locally: `npm install -g @mariozechner/pi-coding-agent`
2. Start Pi in the repository so it can install any project packages declared in `.pi/settings.json`.
3. Run `/login` to configure the provider credentials you want Pi to use.
4. Run `/model` to select the current model.
5. This scaffold declares `npm:pi-subagents` in `.pi/settings.json`; if Pi does not auto-install it on startup, run `pi install -l npm:pi-subagents`.
6. Use `.pi/settings.json` for project-local overrides and package sources, and `~/.pi/agent/models.json` for global model/provider definitions when needed.

## Next steps

1. Read `AGENTS.md`.
2. Review `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, and `.pi/skills/*` for native workflow guidance.
3. Use `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role` to switch the active main-session workflow role.
4. Use `/agents`, `/run`, `/chain`, or `/parallel` once pi-subagents loads if the task benefits from delegation.
5. Use `/feat-change`, `/plan-change`, `/ship-change`, `/parallel-wave`, or `/review-change` for common role-based flows.
6. Copy `.env.example` to `.env` and fill in local values.
7. On a fresh checkout or worktree, run `./scripts/bootstrap-worktree.sh`.
8. If `pre-commit` is installed locally, `pi-harness` already wires the worktree bootstrap hook; otherwise keep `scripts/hooks/post-checkout` available for later hook installation.
9. Run `bd init` once in the repository before using Beads.
10. Use `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.
11. For user-visible behavior, start with `apps/cli/features/*` and the BDD lane through `pnpm test:bdd`; keep lower-level regression coverage in `tests/*`.
12. Use `.pi/skills/harness/SKILL.md` when adopting or bootstrapping another repository.
13. If you are adopting a repo with legacy AI framework files, use `pi-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json`.
14. Let an execution or autonomous landing lane run `./scripts/land.sh` from your feature branch once verification passes; it publishes the branch and ensures a PR to `dev` exists.
