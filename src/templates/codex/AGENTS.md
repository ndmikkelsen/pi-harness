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
2. Use `.rules/patterns/operator-workflow.md` as the canonical day-to-day runbook for Beads claim-first work, verification, and landing-lane decisions.
3. Use `.codex/workflows/autonomous-execution.md` or `.codex/workflows/parallel-execution.md` only when the lane is explicitly autonomous or multi-wave.
4. Use `.codex/README.md` for runtime-surface maps, self-adoption commands, and scaffold maintenance notes.
5. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
6. Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with `pi-harness`.
7. If you are in an execution/autonomous landing lane, land the session with `./.codex/scripts/land.sh`.

### {{COMPAT_LABEL}} Guardrails

- Do not create duplicate planning systems or issue trackers under `.codex/`.
- Do not mirror repo-local handoff or plan notes into `.codex`-specific directories.
- Treat `.codex/agents/*.md` as reusable role briefs and `.codex/scripts/*.sh` as the executable surface.
- Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with `pi-harness`.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

### Landing Authority

- Only execution/autonomous landing lanes should run `./.codex/scripts/land.sh`.
- Planning, research, and review lanes must hand off instead of publishing.

### Beads + Cognee Loop

- `.rules/patterns/operator-workflow.md` owns the daily Beads + Cognee loop, including claim-first work selection, Cognee brief timing, verification, and closeout.
- `.codex/workflows/autonomous-execution.md` owns the one-agent autonomous variant, and `.codex/workflows/parallel-execution.md` owns the multi-wave variant.
- Carry the active Beads issue ID through notes, execution context, and handoff docs when Beads is available.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If Cognee or Beads is unavailable, follow the fallback rules documented in `.rules/patterns/operator-workflow.md` and the relevant autonomous workflow doc instead of inventing a parallel process.
