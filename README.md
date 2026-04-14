# Pi Harness

This project is scaffolded for vanilla Pi with Beads, Cognee, and plain repo scripts.
Provider and model choice stay inside Pi runtime configuration, not in the scaffold identity.
Shared subagent support comes from the `pi-subagents` Pi package declared in `.pi/settings.json`, while project-local role switching comes from `.pi/extensions/role-workflow.ts`.
This scaffold also declares `npm:pi-mcp-adapter` and `npm:pi-web-access` in `.pi/settings.json`, preconfigures a project-local GitHub MCP server in `.pi/mcp.json`, and documents workflow capability profiles in `.pi/settings.json`.

## Runtime surfaces

The canonical workflow surfaces are:
- `AGENTS.md`
- `.pi/settings.json`
- `.pi/mcp.json`
- `.pi/SYSTEM.md`
- `.pi/agents/*`
- `.pi/extensions/*`
- `.pi/prompts/*`
- `.pi/skills/*`
- `scripts/*`
- native `bd` with `.beads/**`
- deployment templates in `config/` and `.kamal/`

## Bake baseline

- Scaffolded with `pi-harness` v0.1.0 on 2026-04-14.
- Record the `pi-harness` version and source commit in the PR or handoff note each time you refresh this scaffold.
- Supported update flow is checkout-based: pull the `pi-harness` checkout forward, rebuild `dist/`, rerun the user-global `/bake` surface for the target repo, then customize only the resulting managed outputs you intentionally want to tailor.
- Finish updates with `pi-harness doctor <path>`.
- This scaffold assumes `pi-harness` is used locally to set up and refresh repos, not consumed as a registry-published package.

## Global-only `/bake` story

1. Keep a local `pi-harness` checkout on your machine and install the launcher once:

   ```bash
   pnpm install
   pnpm build
   pnpm install:local
   ```

2. `pnpm install:local` installs the `pi-harness` launcher in `~/.local/bin` and a thin user-global Pi `/bake` extension in `~/.pi/agent/extensions/pi-harness-bake/`.
3. That user-global `/bake` surface is the setup and refresh entrypoint for repos at every stage: it auto-detects `new` vs `existing`, delegates into `pi-harness`, and refreshes existing repos with curated legacy AI-scaffolding cleanup.
4. After a repo is baked, repo-local authority lives in `AGENTS.md`, `.pi/*`, `scripts/*`, and native Beads state. Keep using the user-global `/bake` surface when you want Pi to run setup or refresh flows, use `/skill:bake` when you want the same contract explained from inside the repo, do not expect any scaffolded local prompt or shell fallback for bake, and keep `/adopt` only as the conservative compatibility path.

## If you are migrating from scaiff

- `pi-harness` is the renamed successor to `scaiff`.
- Use `pi-harness` for installs and updates; there is no separate `scaiff` binary or package alias.
- Use `--cleanup-manifest legacy-ai-frameworks-v1` only when you intentionally want curated legacy workflow leftovers removed.

## Pi setup

1. Install Pi locally: `npm install -g @mariozechner/pi-coding-agent`
2. Install the global `/bake` surface from your local `pi-harness` checkout with `pnpm install && pnpm build && pnpm install:local`.
3. Start Pi in the repository so it can install any project packages declared in `.pi/settings.json`.
4. Run `/login` to configure the provider credentials you want Pi to use.
5. Run `/model` to select the current model.
6. This scaffold declares `npm:pi-subagents`, `npm:pi-mcp-adapter`, and `npm:pi-web-access` in `.pi/settings.json`; if Pi does not auto-install them on startup, run `pi install -l npm:pi-subagents`, `pi install -l npm:pi-mcp-adapter`, and `pi install -l npm:pi-web-access`.
7. Use `.pi/settings.json` for project-local overrides, package sources, and workflow capability profiles, `.pi/mcp.json` for project-local MCP servers, and `~/.pi/agent/models.json` for global model/provider definitions when needed.

## Next steps

1. Read `AGENTS.md`.
2. Review `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, and `.pi/skills/*` for native workflow guidance.
3. In untouched or baked repos, use the user-global `/bake` surface when you want Pi to run setup or refresh flows; use `/skill:bake` in baked repos when you want the local explanation first.
4. Keep `/adopt` available as the compatibility path for conservative existing-repo refreshes and older handoff notes.
5. Use `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role` to switch the active main-session workflow role.
6. Use `/agents`, `/run`, `/chain`, or `/parallel` once pi-subagents loads if the task benefits from delegation.
7. Use `/feat-change`, `/plan-change`, `/ship-change`, `/parallel-wave`, `/review-change`, or `/promote` for common role-based flows.
8. Use `/mcp` to inspect, reconnect, or toggle the project-local GitHub MCP server after Pi starts.
9. Use the `github-operator` helper when the task explicitly requests GitHub MCP-backed repository operations.
10. Copy `.env.example` to `.env` and fill in local values, including `GITHUB_PERSONAL_ACCESS_TOKEN` if you want the preconfigured GitHub MCP server.
11. On a fresh checkout or worktree, run `./scripts/bootstrap-worktree.sh`.
12. If `pre-commit` is installed locally, `pi-harness` already wires the worktree bootstrap hook; otherwise keep `scripts/hooks/post-checkout` available for later hook installation.
13. Run `bd init` once in the repository before using Beads.
14. Use `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.
15. For user-visible behavior, start with `apps/cli/features/*` and the BDD lane through `pnpm test:bdd`; keep lower-level regression coverage in `tests/*`.
16. Use the user-global `/bake` surface for native setup and refreshes, and use `.pi/skills/bake/SKILL.md` or `/skill:bake` when you want the same contract explained before execution.
17. Existing-repo `/bake` runs already apply curated legacy AI-scaffolding cleanup; keep raw `pi-harness` cleanup flags for advanced or manual fallback cases only.
18. Let an execution or autonomous serving lane run `./scripts/serve.sh` from your feature branch once verification passes; it publishes the branch and ensures a PR to `dev` exists.
19. When `dev` is ready for release, run `/promote` or `./scripts/promote.sh` from `dev`; it pushes `dev` upstream and ensures a PR to `main` exists or is refreshed.
