# AGENTS.md

> AI Development Guide

## Overview

This repository uses vanilla Pi as its native runtime.
Workflow authority lives in this file, `.pi/*`, native Beads state, and repo-local handoff notes.
The scaffold is provider-agnostic: choose providers and models inside Pi with `/login`, `/model`, `.pi/settings.json`, or `~/.pi/agent/models.json` instead of changing the scaffold shape.

## Runtime surfaces

The canonical project surfaces are:
- `AGENTS.md`
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
4. Capture scope and acceptance criteria in repo-local context before broad edits.
5. For planning, research, or autonomous startup work, attempt `./scripts/cognee-brief.sh "<query>"` before broad exploration.
6. Use `.pi/skills/harness/SKILL.md`, `.pi/skills/beads/SKILL.md`, and `.pi/skills/parallel-wave-design/SKILL.md` when the task matches.
7. Use `.pi/prompts/adopt.md`, `.pi/prompts/triage.md`, and `.pi/prompts/land.md` for reusable slash workflows.
8. Use the commands registered by `.pi/extensions/repo-workflows.ts` when native slash-command execution is the cleanest path.
9. If you are in an execution or autonomous landing lane, finish with `./scripts/land.sh`.

## Guardrails

- Do not create duplicate planning systems or issue trackers.
- Do not mirror repo-local handoff or plan notes into runtime-specific directories.
- Keep provider and model choice out of the scaffold contract; configure Pi runtime instead.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

## Issue tracking with bd

This project uses `bd` for issue tracking.

### Default loop
1. `bd ready --json`
2. `bd update <id> --claim --json`
3. confirm or refresh acceptance criteria from repo docs and handoff notes
4. implement and run the narrowest verification that proves the change
5. close the issue only after verification passes: `bd close <id> --reason "Verified: <evidence>" --json`
6. if the session is in an execution or autonomous landing lane, finish with `./scripts/land.sh`

### Rules
- Keep the active Beads issue ID in notes, execution context, and handoff artifacts.
- If verification finds gaps, create linked follow-up issues instead of closing the parent work early.
- If `bd` or `.beads/` is unavailable, record that fact in the handoff and continue only when the task remains locally verifiable.

## Landing authority

- Only execution or autonomous landing lanes should run `./scripts/land.sh`.
- Planning, research, and review lanes must hand off instead of publishing.
- `scripts/land.sh` is a feature-branch closeout only. It must never merge into or push directly to `main`.
- Work is not complete until the feature branch is pushed and the pull request to `dev` exists or is updated.

## Beads + Cognee loop

- Start from `bd ready --json` when Beads is available.
- Carry the active Beads issue ID through notes, execution context, verification, and handoff.
- Attempt a Cognee brief before broad planning or repository-wide exploration.
- Close Beads issues only after verification passes.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If Cognee or Beads is unavailable, continue only when the task remains locally verifiable from repository evidence.
