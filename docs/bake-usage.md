# Using the `bake` workflow

## What it is

`pi-harness` is the local CLI that scaffolds and refreshes repositories for vanilla Pi.
The supported runtime is provider-agnostic and built around `AGENTS.md`, `.pi/*`, plain repo scripts, Beads, and optional Cognee acceleration.
Project-local subagent support is typically shared through `.pi/settings.json` with `npm:pi-subagents`, while project-local MCP support can ride through `npm:pi-mcp-adapter` plus a tracked `.pi/mcp.json` for repo-specific servers.

## Install once on your machine

From your local `pi-harness` checkout:

```bash
pnpm install
pnpm build
pnpm install:local
```

That gives you a local `pi-harness` command backed by this checkout.

## Current-state runbook

1. Scaffold or adopt with `pi-harness ... --init-json`.
2. Run `pi-harness doctor <target>`.
3. Run `bd init` once in the target repo if Beads has not been initialized yet.
4. Use `AGENTS.md` as the canonical runtime instruction file.
5. Use `.pi/agents/*.md` and `.pi/agents/*.chain.md` for the project-local role workflow, `.pi/skills/*.md` for reusable guidance, `.pi/prompts/*.md` for reusable slash workflows, and `.pi/extensions/*` for native workflow commands.
6. The active main-session role should be easy to switch with `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role`.
7. Keep shared Pi packages in `.pi/settings.json`; use package specs like `npm:pi-subagents` and `npm:pi-mcp-adapter` instead of machine-specific absolute extension paths.
8. Use `.pi/mcp.json` for tracked project-local MCP servers such as a GitHub server wired through `pi-mcp-adapter`; keep secrets in `.env`, not in the tracked config.
9. Use `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.
10. Use BDD for user-visible behavior and TDD for lower-level logic; implementation plans should carry explicit RED -> GREEN -> REFACTOR checkpoints.

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
9. When the repo changes user-visible behavior, start from `apps/cli/features/*` and keep the BDD lane runnable with `pnpm test:bdd`.

## Existing repository walkthrough

Normal adoption command:

```bash
pi-harness --mode existing . --init-json
```

Existing repos are adopted conservatively:
- missing scaffold files are created
- existing scaffold files are skipped by default
- existing user-authored files are preserved
- `createdPaths` tells you which files can be safely customized now

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
pi-harness --mode existing <path> --init-json
pi-harness doctor <path>
```

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
