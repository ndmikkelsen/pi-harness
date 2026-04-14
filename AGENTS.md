# AGENTS.md

> AI Development Guide

## Overview

This repository uses vanilla Pi as its native runtime.
Workflow authority lives in this file, `.pi/*`, native Beads state, and repo-local handoff notes.
The scaffold is provider-agnostic: choose providers and models inside Pi with `/login`, `/model`, `.pi/settings.json`, or `~/.pi/agent/models.json` instead of changing the scaffold shape.
Project-local subagents live in `.pi/agents/*` and are discovered through the `pi-subagents` package declared in `.pi/settings.json`. They run on demand through Pi tools and slash commands; they do not run persistently in the background. The active workflow role in the main session can be switched with `Ctrl+.`, `Ctrl+,`, `/role`, `/next-role`, or `/prev-role`.

## Runtime surfaces

The canonical project surfaces are:
- `AGENTS.md`
- `.pi/agents/*`
- `.pi/extensions/*`
- `.pi/prompts/*`
- `.pi/skills/*`
- `scripts/*`
- native `bd`
- repo-local docs and handoff notes

## Operating sequence

1. Read `README.md`, relevant repo docs, and any active handoff notes before broad edits.
2. On a fresh checkout or worktree, run `./scripts/bootstrap-worktree.sh`.
3. If the repository uses Beads, run `bd ready --json` and claim the active issue with `bd update <id> --claim --json`.
4. Capture scope, acceptance criteria, and the likely BDD/TDD lane in repo-local context before broad edits.
5. For planning, research, or autonomous startup work, attempt `./scripts/cognee-brief.sh "<query>"` before broad exploration.
6. Use `.pi/skills/bake/SKILL.md`, `.pi/skills/beads/SKILL.md`, `.pi/skills/cognee/SKILL.md`, `.pi/skills/red-green-refactor/SKILL.md`, `.pi/skills/parallel-wave-design/SKILL.md`, and `.pi/skills/subagent-workflow/SKILL.md` when the task matches.
7. Use `Ctrl+.`, `Ctrl+,`, `/role <name>`, `/next-role`, or `/prev-role` to switch the active main-session workflow role between `lead`, `explore`, `plan`, `build`, and `review`.
8. Use project-local agents and chains under `.pi/agents/*` with pi-subagents when the work benefits from narrow delegation, caller-managed parallel waves, or repo-specific role handoffs.
9. Use `.pi/prompts/adopt.md`, `.pi/prompts/triage.md`, `.pi/prompts/serve.md`, `.pi/prompts/promote.md`, `.pi/prompts/plan-change.md`, `.pi/prompts/ship-change.md`, `.pi/prompts/parallel-wave.md`, `.pi/prompts/review-change.md`, and `.pi/prompts/feat-change.md` for reusable slash workflows.
10. Use the commands and shortcuts registered by project-local `.pi/extensions/*` files when native slash-command execution is the cleanest path.
11. If you are in an execution or autonomous serving lane, finish with `./scripts/serve.sh`.

## Guardrails

- Do not create duplicate planning systems or issue trackers.
- Do not mirror repo-local handoff or plan notes into runtime-specific directories.
- Keep provider and model choice out of the scaffold contract; configure Pi runtime instead.
- Keep shared Pi packages in `.pi/settings.json`; do not hardcode machine-specific extension install paths.
- When a user explicitly asks to use an MCP or names a configured MCP-backed system like GitHub MCP, use the configured MCP adapter path first and only fall back to shell/CLI tools when MCP is unavailable and that fallback is stated explicitly.
- Observe a real RED -> GREEN -> REFACTOR loop before broad production changes when the task requires implementation.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

## Issue tracking with bd

This project uses `bd` for issue tracking.

### Default loop
1. `bd ready --json`
2. `bd update <id> --claim --json`
3. confirm or refresh acceptance criteria from repo docs and handoff notes
4. implement and run the narrowest verification that proves the change
5. close the issue only after verification passes: `bd close <id> --reason "Verified: <evidence>" --json`
6. if the session is in an execution or autonomous serving lane, finish with `./scripts/serve.sh`

### Rules
- Keep the active Beads issue ID in notes, execution context, and handoff artifacts.
- If verification finds gaps, create linked follow-up issues instead of closing the parent work early.
- If `bd` or `.beads/` is unavailable, record that fact in the handoff and continue only when the task remains locally verifiable.

## Serving authority

- Only execution or autonomous serving lanes should run `./scripts/serve.sh`.
- Planning, research, and review lanes must hand off instead of publishing.
- Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as intent to use `/serve` or `./scripts/serve.sh` when the lane is allowed to publish.
- `scripts/serve.sh` is a feature-branch closeout only. It must never merge into or push directly to `main`.
- Work is not complete until the feature branch is pushed and the pull request to `dev` exists or is updated.

## Promotion authority

- Only execution or autonomous release lanes should run `./scripts/promote.sh`.
- Use `/promote` or `./scripts/promote.sh` only from `dev` when the release changes already live on `dev` and you need a PR to `main`.
- `scripts/promote.sh` pushes `dev` and creates or refreshes the PR to `main`; it must never merge into or push directly to `main`.
- Keep feature-branch publishing on `/serve` / `./scripts/serve.sh`; do not overload serve for the `dev` -> `main` release step.

## Beads + Cognee loop

- Start from `bd ready --json` when Beads is available.
- Carry the active Beads issue ID through notes, execution context, verification, and handoff.
- Attempt a Cognee brief before broad planning or repository-wide exploration.
- Close Beads issues only after verification passes.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If Cognee or Beads is unavailable, continue only when the task remains locally verifiable from repository evidence.
