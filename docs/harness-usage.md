# Using the `harness` Workflow

## What it is

`pi-harness` is the local CLI that scaffolds and refreshes repositories.
The scaffold it produces is designed for a Pi-operated Codex workflow with Beads and Cognee.

- `pi-harness` does the actual scaffold and adoption work
- `.codex/` holds the Codex-facing runtime scripts and workflow docs
- Beads remains the backlog system through native `bd`
- Cognee remains an optional knowledge accelerator through `./.codex/scripts/cognee-brief.sh`
- the supported setup is local-only: a checkout of this repo on your machine plus `pnpm build` and `pnpm install:local`

## Install once on your machine

From your local `pi-harness` checkout:

```bash
pnpm install
pnpm build
pnpm install:local
```

That gives you:

- `pi-harness` on your `PATH`
- the built scaffold templates under `dist/`
- a local launcher backed by your checkout

## Current-state runbook

Use this as the install and adoption entrypoint, then hand daily execution to the canonical runbooks:

1. Scaffold or adopt with `pi-harness ... --assistant codex --init-json`.
2. Run `pi-harness doctor <target> --assistant codex`.
3. Run `bd init` once in the target repo if Beads has not been initialized yet.
4. Use `.rules/patterns/operator-workflow.md` for the daily Beads + Cognee loop.
5. Use `.codex/workflows/autonomous-execution.md` when you want backlog-driven autonomous execution.

## Mental model

When you use the scaffold from Pi, the flow is:

1. Decide whether the target is a new repo or an existing repo.
2. If it is an existing repo, gather context first.
3. Run `pi-harness ... --assistant codex --init-json`.
4. In existing repos, customize only files listed in `createdPaths`.
5. Finish with `pi-harness doctor <target> --assistant codex`.

## New repository walkthrough

Use this when the target directory does not exist yet or is empty.

### In Pi

Use a prompt such as:

```text
Use harness to scaffold a new repository named acme-api for Codex.
```

### Under the hood

The equivalent CLI command is:

```bash
pi-harness acme-api --assistant codex --init-json
```

### What gets created

The new repo gets the standard AI workflow foundation:

- `.rules/` for workflow and architecture guidance
- `.codex/` for the Codex runtime layer
- `AGENTS.md` and `STICKYNOTE.example.md`
- root setup files like `.gitignore`, `.env.example`, and deploy starters
- Beads config and hook wiring for native `bd`

### What to do next

1. Copy `.env.example` to `.env` and fill in local values.
2. Run `pi-harness doctor . --assistant codex`.
3. Run `bd init` once before using Beads in that repo.
4. Use `.rules/patterns/operator-workflow.md` for the daily claim-first loop.
5. Use `.codex/workflows/autonomous-execution.md` when you want backlog-driven autonomous execution.
6. Let execution/autonomous lanes own `./.codex/scripts/land.sh`; planning, research, and review lanes should hand off instead of publishing.

## Existing repository walkthrough

Use this when the repo already has files or is already a git repository.

### In Pi

Use a prompt such as:

```text
Use harness to adopt this existing repository for Codex. Preserve existing files by default.
```

### What the workflow should do first

Before changing scaffold files, gather repo context from:

- git status, branch, remotes, and recent commits
- Beads state if `bd` or `.beads/` exists
- a Cognee brief if `.codex/scripts/cognee-brief.sh` already exists
- docs like `README*`, `docs/**/*.md`, `.rules/**/*`, and `AGENTS.md`
- package or runtime manifests

This context is used to tailor only the newly created scaffold files, not to rewrite the whole repo.

### Under the hood

The normal adoption command is:

```bash
pi-harness --mode existing . --assistant codex --init-json
```

### Preserve-by-default behavior

Existing repos are adopted conservatively:

- missing scaffold files are created
- existing scaffold files are skipped by default
- existing user-authored files are preserved
- `--force` is not used unless you explicitly want managed files regenerated

The JSON output matters here:

- `createdPaths` tells you which new files can be safely customized now
- `skippedPaths` tells you which existing files were intentionally left alone
- `cleanup.actions` tells you what was removed, preserved, or still needs confirmation when cleanup is requested

### Optional existing-repo variants

Use these only when you explicitly want them.

Curated legacy cleanup:

```bash
pi-harness --mode existing . --assistant codex --cleanup-manifest legacy-ai-frameworks-v1 --init-json
```

Use this only for deprecated workflow leftovers, including legacy `.planning/`, `.sisyphus/`, and planning-sync artifacts when they are present.

Root-file merge for `.gitignore` and `.env.example`:

```bash
pi-harness --mode existing . --assistant codex --merge-root-files --init-json
```

Non-interactive cleanup in automation:

```bash
pi-harness --mode existing . --assistant codex --cleanup-manifest legacy-ai-frameworks-v1 --non-interactive --init-json
```

### What to do next

1. Customize only the files listed in `createdPaths`.
2. Leave `skippedPaths` alone unless you explicitly want to edit them.
3. Review any cleanup results before continuing.
4. Run `pi-harness doctor . --assistant codex`.
5. If the repo is using Beads and it is not initialized yet, run `bd init`.
6. Use `.rules/patterns/operator-workflow.md` for the daily loop and `.codex/workflows/autonomous-execution.md` for backlog-driven automation.

## Refreshing an already scaffolded repo later

When you want to bring a repo forward to a newer `pi-harness` version:

```bash
pnpm install
pnpm build
pnpm install:local
pi-harness --mode existing <path> --assistant codex --init-json
pi-harness doctor <path> --assistant codex
```

Record the previous and new `pi-harness` versions plus the source commit in the PR or handoff note.

## Seeding Cognee datasets when briefs are empty

If `./.codex/scripts/cognee-brief.sh` reports missing datasets, seed the knowledge garden before treating Cognee as unavailable.

- Keep the default split: `<app>-knowledge` for README/docs/rules/handoff context, `<app>-patterns` for reusable agents, skills, feature files, and workflow examples.
- Use `sync-dir` for directories containing `.md` or `.feature` files, and `upload` for standalone files such as `README.md`, `STICKYNOTE.md`, or a single handoff note.

```bash
APP_SLUG=<app-slug>

./.codex/scripts/cognee-bridge.sh sync-dir docs --dataset "$APP_SLUG-knowledge"
./.codex/scripts/cognee-bridge.sh sync-dir .rules --dataset "$APP_SLUG-knowledge"
./.codex/scripts/cognee-bridge.sh upload README.md --dataset "$APP_SLUG-knowledge"

./.codex/scripts/cognee-bridge.sh sync-dir .codex/agents --dataset "$APP_SLUG-patterns"
./.codex/scripts/cognee-bridge.sh sync-dir .codex/skills --dataset "$APP_SLUG-patterns"

./.codex/scripts/cognee-bridge.sh cognify --dataset "$APP_SLUG-knowledge"
./.codex/scripts/cognee-bridge.sh cognify --dataset "$APP_SLUG-patterns"
```

Validate the refresh with `./.codex/scripts/cognee-bridge.sh health` and a follow-up `./.codex/scripts/cognee-brief.sh "<query>"`. Cognee remains optional acceleration; local verification is still required.


## Daily workflow after setup

After setup, `.rules/patterns/operator-workflow.md` is the canonical daily runbook and `.codex/workflows/autonomous-execution.md` is the canonical autonomous variant. This guide intentionally stops at install, adoption, refresh, and audit commands so it does not become a second workflow authority.
