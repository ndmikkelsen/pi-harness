# Using the `bake` workflow

## What it is

`pi-harness` is the local CLI that scaffolds and refreshes repositories for vanilla Pi.
The supported runtime is provider-agnostic and built around `AGENTS.md`, `.pi/*`, plain repo scripts, Beads, and optional Cognee acceleration.
Project-local subagent support is typically shared through `.pi/settings.json` with `npm:pi-subagents` plus repo-local agent files under `.pi/agents/*`.

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
7. Keep shared Pi packages in `.pi/settings.json`; use package specs like `npm:pi-subagents` instead of machine-specific absolute extension paths.
8. Use `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.
9. Use BDD for user-visible behavior and TDD for lower-level logic; implementation plans should carry explicit RED -> GREEN -> REFACTOR checkpoints.

## New repository walkthrough

Equivalent CLI command:

```bash
pi-harness acme-api --init-json
```

What gets created:
- `AGENTS.md`
- `.pi/*`
- `scripts/*`
- Beads config and hook wiring
- root setup files like `.gitignore`, `.env.example`, and deploy starters

What to do next:
1. Copy `.env.example` to `.env` and fill in local values.
2. Run `pi-harness doctor .`.
3. Run `bd init` once before using Beads.
4. Use `AGENTS.md`, `.pi/*`, and `scripts/*` for daily work.
5. Let Pi auto-install project packages from `.pi/settings.json`, including `npm:pi-subagents`, or run `pi install -l npm:pi-subagents` if needed.
6. Use the project-local role workflow from `.pi/agents/*`, `.pi/agents/*.chain.md`, and `.pi/extensions/role-workflow.ts` so users can switch roles quickly without leaving the main session.
7. When the repo changes user-visible behavior, start from `apps/cli/features/*` and keep the BDD lane runnable with `pnpm test:bdd`.

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
