# AGENTS.md

> AI Development Guide

## Overview

This repository is prepared for {{COMPAT_LABEL}} inside Pi through a focused runtime layer while keeping `.rules/`, native Beads, and `.codex/` workflows as the canonical operating systems.

## {{COMPAT_LABEL}} Workflow

{{COMPAT_LABEL}} works in this repository through a focused runtime layer. The canonical systems remain:

- `.rules/` for architecture and workflow rules
- native `bd` for Beads backlog tracking
- `.codex/scripts/` for Cognee and runtime automation
- repo-local handoff or plan notes when they already exist

Use the {{COMPAT_LABEL}} compatibility docs and scripts under `.codex/` as entrypoints, not as a separate source of truth.

### {{COMPAT_LABEL}} Operating Sequence

1. Read the relevant `.rules/` documents before changing code or infrastructure.
2. If Beads is available, start from `bd ready --json` and claim one issue with `bd update <id> --claim --json`.
3. For planning, research, or autonomous startup work, attempt `./.codex/scripts/cognee-brief.sh "<query>"` before broad repo exploration.
4. Follow `.rules/patterns/operator-workflow.md` plus `.codex/workflows/autonomous-execution.md` as the default execution loop.
5. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
6. Close Beads work only after verification passes.
7. If you are in an execution/autonomous landing lane, land the session with `./.codex/scripts/land.sh`.

### {{COMPAT_LABEL}} Guardrails

- Do not create duplicate planning systems or issue trackers under `.codex/`.
- Do not mirror repo-local handoff or plan notes into `.codex`-specific directories.
- Treat `.codex/agents/*.md` as reusable role briefs and `.codex/scripts/*.sh` as the executable surface.
- Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with `ai-harness`.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

### Landing Authority

- Only execution/autonomous landing lanes should run `./.codex/scripts/land.sh`.
- Planning, research, and review lanes must hand off instead of publishing.

### Beads + Cognee Loop

- When Beads is available, use `bd ready --json` and `bd update <id> --claim --json` before implementation work.
- Use `.codex/workflows/autonomous-execution.md` for one-agent execution, or `.codex/workflows/parallel-execution.md` for multi-wave execution.
- Carry the active Beads issue ID through notes, execution context, and handoff docs.
- Attempt a Cognee brief with `./.codex/scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide research.
- Close Beads issues only after verification passes.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If Cognee is unavailable, continue only when the task remains locally verifiable from `.rules/`, handoff notes, and repo evidence.
- If `.beads/` or `bd` is unavailable, continue with `.rules/patterns/operator-workflow.md` and local verification steps without blocking on issue tracking.
