# AGENTS.md

> AI Development Guide

## Overview

This repository is prepared for {{COMPAT_LABEL}} through a focused runtime layer while keeping .rules/ and .planning/ as the canonical project systems.

## {{COMPAT_LABEL}} Workflow

{{COMPAT_LABEL}} works in this repository through a focused runtime layer. The canonical systems remain:

- .rules/ for architecture and workflow rules
- .planning/ for GSD planning, execution, and handoff artifacts
- .codex/scripts/ for working Cognee and planning sync backends

Use the {{COMPAT_LABEL}} compatibility docs and scripts under .codex/ as entrypoints, not as a separate source of truth.
For OMO lane and tool policy, treat `.rules/patterns/omo-agent-contract.md` as the normative source and keep this file adapter-only.

### {{COMPAT_LABEL}} Operating Sequence

1. Read the relevant .rules/ documents before changing code or infrastructure.
2. Inspect .planning/STATE.md and any active phase docs in .planning/.
3. Use native `bd` for task tracking after the repository is initialized with `bd init`.
4. For planning, research, or autonomous startup work, query Cognee with ./.codex/scripts/cognee-brief.sh "<query>".
5. If you use OpenCode worktrees, prefer the scaffolded `.opencode/worktree.jsonc` with `kdco/worktree`; otherwise run ./.codex/scripts/bootstrap-worktree.sh on a fresh worktree.
6. Use `.rules/patterns/operator-workflow.md` and `/gsd-next` as the default interactive work loop.
7. If you are in an execution/autonomous landing lane, land the session with ./.codex/scripts/land.sh.

### {{COMPAT_LABEL}} Guardrails

- Do not create duplicate planning systems or issue trackers under .codex/.
- Do not mirror .planning/ into .codex-specific directories.
- Do not redefine OMO doctrine here; reference `.rules/patterns/omo-agent-contract.md` when policy decisions are needed.
- Follow `.rules/patterns/omo-agent-contract.md` for Cognee-required lanes and deterministic fallback or blocked outcomes.
- Treat .codex/agents/*.md as reusable role briefs and .codex/scripts/*.sh as the executable surface.
- Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with ai-harness.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

### Landing Authority

- Only execution/autonomous landing lanes should run `./.codex/scripts/land.sh`.
- Planning, research, and review lanes must hand off instead of publishing.

### Beads + GSD Loop

- When Beads is available, use `bd ready --json` and `bd update <id> --claim --json` before phase work.
- Use `.codex/workflows/autonomous-execution.md` for one-agent phase execution, or `.codex/workflows/parallel-execution.md` for multi-wave work.
- Carry the active Beads issue ID through phase notes, execution context, and handoff docs.
- Use `/gsd-next` first, then `/gsd-discuss-phase <n>`, `/gsd-plan-phase <n>`, `/gsd-execute-phase <n>`, and `/gsd-verify-work <n>` when phase work is required.
- Close Beads issues only after verification passes.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If `.beads/` or `bd` is unavailable, continue the GSD workflow without blocking on issue tracking.
