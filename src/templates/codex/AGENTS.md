# AGENTS.md

> AI Development Guide

## Overview

This repository is prepared for {{COMPAT_LABEL}} through a thin compatibility layer while keeping .rules/ and .planning/ as the canonical project systems.

## {{COMPAT_LABEL}} Workflow

{{COMPAT_LABEL}} works in this repository through a thin adapter layer. The canonical systems remain:

- .rules/ for architecture and workflow rules
- .planning/ for GSD planning, execution, and handoff artifacts
- .claude/scripts/ for working Cognee and planning sync backends

Use the {{COMPAT_LABEL}} compatibility docs and scripts under .codex/ as entrypoints, not as a separate source of truth.

### {{COMPAT_LABEL}} Operating Sequence

1. Read the relevant .rules/ documents before changing code or infrastructure.
2. Inspect .planning/STATE.md and any active phase docs in .planning/.
3. Query Cognee with ./.codex/scripts/cognee-brief.sh "<query>".
4. On a fresh worktree, run ./.codex/scripts/bootstrap-worktree.sh.
5. Execute work in waves with explicit file ownership and validation boundaries.
6. Land the session with ./.codex/scripts/land.sh.

### {{COMPAT_LABEL}} Guardrails

- Do not create duplicate planning systems or issue trackers under .codex/.
- Do not mirror .planning/ into .codex-specific directories.
- Keep Cognee integration non-blocking; if it is down, continue using local docs and planning artifacts.
- Treat .codex/agents/*.md as reusable role briefs and .codex/scripts/*.sh as the executable surface.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.
