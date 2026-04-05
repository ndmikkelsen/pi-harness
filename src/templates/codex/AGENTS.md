# AGENTS.md

> AI Development Guide

## Overview

This repository is prepared for {{COMPAT_LABEL}} inside Pi through a thin compatibility layer. Workflow authority remains in `.rules/` and repo-local process notes. Pi-native reusable orchestration lives in `.omp/` when the repo scaffolds it, while `.codex/` stays a compatibility and maintenance surface.

## {{COMPAT_LABEL}} Workflow

{{COMPAT_LABEL}} works in this repository through Pi-native project context plus a focused compatibility layer. The canonical systems are:

- `.rules/` for architecture and workflow rules
- native `bd` for Beads backlog tracking
- `.omp/` for Pi-native custom agents and skills that should be discovered directly by Pi
- `.codex/scripts/` for Cognee and compatibility automation
- repo-local handoff or plan notes when they already exist

Use the {{COMPAT_LABEL}} docs under `.codex/` as compatibility maps and maintenance notes, not as a second source of workflow authority.

### {{COMPAT_LABEL}} Operating Sequence

1. Read the relevant `.rules/` documents before changing code or infrastructure.
2. Use `.rules/patterns/operator-workflow.md` as the canonical day-to-day runbook for Beads claim-first work, verification, and landing-lane decisions.
3. Use `.omp/agents/*.md` and `.omp/skills/*/SKILL.md` when Pi-native project orchestration or reusable task-shaping help is needed.
4. Use `.codex/workflows/autonomous-execution.md` or `.codex/workflows/parallel-execution.md` only for Codex-compatible autonomous or multi-wave deltas.
5. Use `.codex/README.md` for compatibility maps, self-adoption commands, and scaffold maintenance notes.
6. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
7. Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with `pi-harness`.
8. If you are in an execution/autonomous landing lane, land the session with `./.codex/scripts/land.sh`.

### {{COMPAT_LABEL}} Guardrails

- Do not create duplicate planning systems or issue trackers under `.codex/` or `.omp/`.
- Do not mirror repo-local handoff or plan notes into compatibility-specific directories.
- Treat `.omp/*` as Pi-native runtime assets discovered directly by Pi; treat `.codex/agents/*.md` as compatibility briefs and `.codex/scripts/*.sh` as the executable compatibility surface.
- Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with `pi-harness`.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

### Landing Authority

- Only execution/autonomous landing lanes should run `./.codex/scripts/land.sh`.
- Planning, research, and review lanes must hand off instead of publishing.

### Beads + Cognee Loop

- `.rules/patterns/operator-workflow.md` owns the daily Beads + Cognee loop, including claim-first work selection, Cognee brief timing, verification, and closeout.
- `.omp/agents/` and `.omp/skills/` hold Pi-native reusable orchestration helpers; `.codex/workflows/*.md` documents Codex-compatible lane deltas when those lanes are explicitly chosen.
- Carry the active Beads issue ID through notes, execution context, and handoff docs when Beads is available.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If Cognee or Beads is unavailable, follow the fallback rules documented in `.rules/patterns/operator-workflow.md` and the relevant autonomous workflow doc instead of inventing a parallel process.