# Scaiff Premise

## Working name

This project is named `scaiff`.

## What this project is

`scaiff` is a modular TypeScript CLI for bootstrapping an AI-assisted repository workflow.

It supports:
- new project scaffolding
- existing repository adoption
- GSD planning artifacts
- Beads task tracking
- Cognee integration hooks
- Codex/OpenCode runtime support through `.codex/`

## Core design

The scaffold keeps one canonical project workflow and layers assistant-specific entrypoints on top of it.

Canonical systems:
- `.planning/` for GSD planning and execution state
- `.rules/` for workflow and architecture guidance
- `.codex/` for Codex/OpenCode runtime scripts, guidance, and adapters
- native `bd` for Beads task tracking after `bd init`

## Current cleanup goal

Keep only the systems needed for:
- GSD
- Beads
- Cognee
- Codex via OpenCode

Remove or simplify anything unused, duplicated, or misleading.

## Component review status

| Component | Decision | Notes |
| --- | --- | --- |
| Beads integration | Keep native `bd` only | Remove the legacy wrapper, remove unused Beads templates, keep docs aligned with upstream Beads |
| GSD planning | Keep official GSD core | Align scaffold with `PROJECT`, `REQUIREMENTS`, `ROADMAP`, `STATE`, `config`, research, phases, quick tasks, milestones, and codebase mapping |
| Cognee integration | Keep planning-focused core | Keep bridge, brief, planning sync, and deploy pieces; remove the broad repo sync helper |
| OpenCode overlay | Keep lean runtime docs | Keep `AGENTS.md`, `.codex/README.md`, `.codex/agents/*`, `.codex/workflows/parallel-execution.md`, and `.codex/templates/phase-execution.md`; remove dead template files |
| Codex/OpenCode runtime | Keep `.codex/` only | Use `.codex/` as the only assistant runtime surface |
| Deploy templates | Keep with infra assumptions | Keep `.kamal/secrets.example`, `config/deploy.yml`, and `config/deploy.cognee.yml`; treat `deploy.yml` as a starter and `deploy.cognee.yml` as the concrete service template |
| Governance docs | Keep lean docs only | Remove root governance placeholders, keep `STICKYNOTE.example.md`, and use `AGENTS.md` + `.planning/` + `.rules/` as the main guidance surface |

## Beads decision

Approved direction:
- use upstream default Beads install mode
- run `bd init` inside each project repo
- use native `bd` commands directly
- do not maintain a repo-local wrapper that only proxies to `bd`

## GSD decision

Approved direction:
- align the scaffold to the official GSD planning shape
- keep `.planning/config.json`, `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md`
- keep `.planning/research/`, `.planning/phases/`, `.planning/quick/`, `.planning/milestones/`, and `.planning/codebase/`
- remove the standalone `TRACEABILITY.md` placeholder and keep traceability inside `REQUIREMENTS.md`
- replace shallow placeholders with starter docs that match the real GSD workflow

## Governance docs decision

Approved direction:
- keep root governance lean and avoid extra placeholder policy documents
- keep `STICKYNOTE.example.md` as the reusable local handoff template
- do not scaffold `STICKYNOTE.md`; let worktree bootstrap or landing flows create it locally
- treat `AGENTS.md`, `.codex/README.md`, `.rules/`, and `.planning/` as the active documentation surface for this harness

## Runtime decision

Approved direction:
- remove the legacy assistant-specific backend directories and keep one `.codex/` runtime surface
- migrate shared backend scripts, bootstrap helpers, and Cognee assets into `.codex/`
- use one Codex/OpenCode-friendly runtime surface for both supported assistants
- keep deploy templates pointed at `.codex/docker/Dockerfile.cognee`

## Cleanup decision

Approved direction:
- support opt-in cleanup through the curated `legacy-ai-frameworks-v1` manifest during existing-repo adoption
- never infer deletions heuristically; only exact curated manifest entries are eligible
- require confirmation for prompt-before-delete entries and report `prompt-required` in non-interactive runs
- report cleanup actions alongside scaffold creation through `--init-json`

## Cognee decision

Approved direction:
- keep `.codex/scripts/cognee-bridge.sh`, `.codex/scripts/cognee-brief.sh`, `.codex/scripts/cognee-sync-planning.sh`, and `.codex/scripts/sync-planning-to-cognee.sh`
- keep `.codex/docker/Dockerfile.cognee` and `config/deploy.cognee.yml`
- remove `.codex/scripts/sync-to-cognee.sh`
- keep Cognee non-blocking and focused on planning artifacts instead of broad repository sync
- expand the Cognee guidance in `.rules/patterns/cognee-gsd-integration.md`

## Deploy template decision

Approved direction:
- keep `.kamal/secrets.example`, `config/deploy.yml`, and `config/deploy.cognee.yml`
- keep the current compute-server assumptions from policy defaults: `10.10.20.138`, `harbor.compute.lan`, and `~/.ssh/z3r0Layer-main`
- treat `config/deploy.yml` as a starter template that still needs app-specific service details
- treat `config/deploy.cognee.yml` as the concrete Cognee deployment template backed by `.codex/docker/Dockerfile.cognee`
- keep secrets placeholder-only and continue ignoring `.kamal/secrets*` in git

## Follow-up checkpoints

- finish subsystem review one group at a time
- clean up duplicated or stale docs after the final keep/remove decisions
