# Using the `bake` workflow

## What it is

`pi-harness` is the local CLI that scaffolds and refreshes repositories for vanilla Pi.
The supported runtime is provider-agnostic and built around `AGENTS.md`, `.pi/*`, plain repo scripts, Beads, and optional Cognee acceleration.
Project-local subagent support is typically shared through `.pi/settings.json` with `npm:pi-subagents`, while project-local MCP support can ride through `npm:pi-mcp-adapter` plus a tracked `.pi/mcp.json` for repo-specific servers.

## User-global `/bake` story

The `/bake` story has one executable surface and one repo-local explanation layer:

1. **User-global execution.** Install `pi-harness` from a local checkout on your machine so any repo can use `/bake` before or after repo-local `.pi/*` files exist.
2. **Repo-local explanation after bake.** Once a repo is scaffolded, the generated `AGENTS.md`, `.pi/*`, `scripts/*`, and native Beads state become the canonical workflow authority for that repository, while `/skill:bake` explains how that repo expects setup and refresh work to happen.

The user-global layer should stay thin. It exists to route `/bake` into the right `pi-harness` flow for the target repository, not to carry repo-specific policy, provider defaults, or a second copy of scaffold rules.

## Install once on your machine

From your local `pi-harness` checkout:

```bash
pnpm install
pnpm build
pnpm install:local
```

That gives you:
- a `pi-harness` launcher in `~/.local/bin`
- a user-global Pi `/bake` extension in `~/.pi/agent/extensions/pi-harness-bake/`
- a setup/refresh entrypoint that can run in untouched or baked repos without depending on any generated local bake command

Optional user-global runtime helper: rerun `pnpm install:local:gemma4` when you want to merge the compute-hosted Gemma 4 Ollama entry into `~/.pi/agent/models.json`. That opt-in path only registers the runtime entry, does not change scaffold files, and does not auto-switch your active model; use `/model` to select it. The default entry points Pi at `http://chat.compute.lan:11434/v1` with model id `gemma4`, and you can override either value with `pnpm install:local -- --gemma4-compute-ollama --gemma4-base-url <url> --gemma4-model-id <id>`.

Keep provider and model setup in Pi runtime configuration: use `/login`, `/model`, `.pi/settings.json`, and `~/.pi/agent/models.json` instead of baking providers into scaffold files.

## First bake in an untouched repo

1. Open Pi in the target directory or repository.
2. Run `/bake` with no args for the auto-detected flow. It treats empty targets as greenfield repos and existing targets as refreshes that use `--force` plus curated legacy AI-scaffolding cleanup.
3. If your Pi session routes a plain-language setup request to bake, keep it mapped to the same `pi-harness` flow rather than inventing a second scaffold path.
4. Review the emitted JSON so you can see what was created, skipped, or preserved.
5. Run `pi-harness doctor <target>` before broader customization.

## Repo-local authority after bake

After the first bake succeeds, treat the generated repo-local files as canonical:
- `AGENTS.md` owns workflow authority
- `.pi/skills/bake/SKILL.md` explains the repo-local setup/refresh contract and points users back to the user-global `/bake` surface when they want execution
- baked repos do not scaffold any local bake prompt or shell fallback; `/skill:bake` is the local explanation path
- `.pi/prompts/adopt.md` remains the compatibility path for conservative existing-repo refreshes and older handoff notes
- `scripts/*`, Beads state, and repo docs carry the project-specific execution details

The user-global `/bake` extension remains the executable surface. Once a repo is baked, repo-local docs and `/skill:bake` should describe the contract.

## Current-state runbook

1. Use the user-global `/bake` surface for both the first bake in untouched repos and later refreshes in baked repos; use `/skill:bake` in baked repos when you want the local explanation first.
2. Let `/bake` auto-detect `new` vs `existing`; use raw `pi-harness` commands only as an advanced fallback.
3. Run `pi-harness doctor <target>`.
4. Run `bd init` once in the target repo if Beads has not been initialized yet.
5. Use `AGENTS.md` as the canonical runtime instruction file.
6. Use `.pi/agents/*.md` and `.pi/agents/*.chain.md` for the project-local role workflow, `.pi/skills/*.md` for reusable guidance, `.pi/prompts/*.md` for reusable slash workflows, and `.pi/extensions/*` for native workflow commands.
7. The active main-session role should be easy to switch with `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role`.
8. Keep shared Pi packages in `.pi/settings.json`; use package specs like `npm:pi-subagents` and `npm:pi-mcp-adapter` instead of machine-specific absolute extension paths.
9. Use `.pi/mcp.json` for tracked project-local MCP servers such as a GitHub server wired through `pi-mcp-adapter`; keep secrets in `.env`, not in the tracked config.
10. Use `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.
11. Use BDD for user-visible behavior and TDD for lower-level logic; implementation plans should carry explicit RED -> GREEN -> REFACTOR checkpoints.

## New repository walkthrough

Equivalent CLI command:

```bash
pi-harness acme-api --init-json
```

What gets created:
- `AGENTS.md`
- `.pi/*` including `.pi/mcp.json` when the repo ships project-local MCP servers
- `scripts/*`
- Beads config and hook wiring
- root setup files like `.gitignore`, `.env.example`, and deploy starters

What to do next:
1. Copy `.env.example` to `.env` and fill in local values.
2. Run `pi-harness doctor .`.
3. Run `bd init` once before using Beads.
4. Use `AGENTS.md`, `.pi/*`, and `scripts/*` for daily work.
5. Let Pi auto-install project packages from `.pi/settings.json`, including `npm:pi-subagents` and `npm:pi-mcp-adapter`, or run `pi install -l npm:pi-subagents` and `pi install -l npm:pi-mcp-adapter` if needed.
6. Fill in `.env` with placeholders from `.env.example`, including `GITHUB_PERSONAL_ACCESS_TOKEN` when you want the preconfigured GitHub MCP server from `.pi/mcp.json`.
7. Use `/mcp` once Pi starts to inspect or reconnect the project-local GitHub MCP server.
8. Use the project-local role workflow from `.pi/agents/*`, `.pi/agents/*.chain.md`, and `.pi/extensions/role-workflow.ts` so users can switch roles quickly without leaving the main session.
9. In baked repos, keep using the user-global `/bake` surface for later refreshes, use `/skill:bake` when you want the same contract explained first, and keep `/adopt` only as the compatibility path for explicit preserve-existing work.
10. When the repo changes user-visible behavior, start from `apps/cli/features/*` and keep the BDD lane runnable with `pnpm test:bdd`.

## Existing repository walkthrough

Conservative compatibility adoption command:

```bash
pi-harness --mode existing . --init-json
```

Existing repos are still adopted conservatively when you explicitly use `/adopt` or raw fallback commands:
- missing scaffold files are created
- existing scaffold files are skipped by default
- existing user-authored files are preserved
- `createdPaths` tells you which files can be safely customized now
- `skippedPaths` tells you what `pi-harness` intentionally left alone

Optional variants:

```bash
pi-harness --mode existing . --cleanup-manifest legacy-ai-frameworks-v1 --init-json
pi-harness --mode existing . --merge-root-files --init-json
pi-harness --mode existing . --cleanup-manifest legacy-ai-frameworks-v1 --non-interactive --init-json
```

## Refreshing a scaffolded repo later

```bash
pnpm install
pnpm build
pnpm install:local
# optional: also refresh the user-global Gemma 4 Ollama runtime entry
pnpm install:local:gemma4
# then run the user-global /bake in the target repo
pi-harness doctor <path>
```

In baked repos, keep using the user-global `/bake` surface for this refresh path, use `/skill:bake` when you want the repo-local explanation first, and keep `/adopt` as the compatibility alias when older notes still reference adoption language. The optional Gemma 4 helper only updates the user-global Pi runtime entry in `~/.pi/agent/models.json`; final model selection still happens through Pi runtime tools such as `/model`.

Record the previous and new `pi-harness` versions plus the source commit in the PR or handoff note.

## Serve, promote, and STICKYNOTE contract

- `./scripts/bootstrap-worktree.sh` seeds `STICKYNOTE.md` from `STICKYNOTE.example.md` only when needed, then keeps linked worktrees pointed at the main worktree copy so local handoff context survives across worktrees.
- `STICKYNOTE.md` is intentionally local-only and must remain untracked; the scaffold only ships `STICKYNOTE.example.md`.
- `/serve` stays prompt-native, but plain-language publish requests such as `serve this branch` or `ship it` should route through the same serve workflow.
- Serving now requires a refreshed `STICKYNOTE.md` with a non-empty `## Completed This Session` section. That completed-work summary becomes the basis for the PR body.
- `scripts/serve.sh` creates or refreshes the PR body explicitly for both new and existing PRs and prints a short post-serve branch summary after pushing.
- `/promote` and `scripts/promote.sh` are the separate release step for `dev` -> `main`; they require a clean `dev` branch, push `dev` upstream, and create or refresh an explicit PR body to `main` from the commit summary.

## Muninn comparison and curated knowledge-sync decision

Muninn is a useful comparison point because its landing workflow also treats a local handoff note as mandatory before publishing and leans toward curated planning sync. For `pi-harness`, we are borrowing the workflow discipline, not widening the sync surface.

Decision for this scaffold:
- keep automatic Cognee sync limited to curated Pi artifacts such as `context.md`, `plan.md`, `progress.md`, `review.md`, and `wave.md`
- do **not** upload `STICKYNOTE.md`, raw PR bodies, or raw post-serve summaries automatically
- keep `STICKYNOTE.md` local-only even though `/serve` reuses its completed-work section for the PR description
- if future work wants broader knowledge sync, introduce a durable non-local artifact first instead of promoting ephemeral local notes directly into the knowledge garden

This preserves the useful part of the muninn comparison — stronger publish discipline — without leaking local-only scratch context into Cognee by default.

## Seeding Cognee datasets when briefs are empty

If `./scripts/cognee-brief.sh` reports missing datasets, seed the knowledge garden before treating Cognee as unavailable.

```bash
APP_SLUG=<app-slug>
./scripts/cognee-bridge.sh sync-dir docs --dataset "$APP_SLUG-knowledge"
./scripts/cognee-bridge.sh upload README.md --dataset "$APP_SLUG-knowledge"
./scripts/cognee-bridge.sh sync-dir .pi --dataset "$APP_SLUG-patterns"
./scripts/cognee-bridge.sh cognify --dataset "$APP_SLUG-knowledge"
./scripts/cognee-bridge.sh cognify --dataset "$APP_SLUG-patterns"
```

Validate with `./scripts/cognee-bridge.sh health` and a follow-up `./scripts/cognee-brief.sh "<query>"`.
