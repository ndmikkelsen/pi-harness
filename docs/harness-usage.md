# Using the `harness` workflow

## What it is

`pi-harness` is the local CLI that scaffolds and refreshes repositories for vanilla Pi.
The supported runtime is provider-agnostic and built around `AGENTS.md`, `.pi/*`, plain repo scripts, Beads, and optional Cognee acceleration.

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
5. Use `.pi/skills/*.md` for reusable guidance, `.pi/prompts/*.md` for reusable slash workflows, and `.pi/extensions/*` for native workflow commands.
6. Use `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration.

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
