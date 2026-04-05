# AGENTS.md

> AI Development Guide

## Overview

This repository is prepared for Codex inside Pi through a focused runtime layer while keeping `.rules/`, native Beads, and `.codex/` workflows as the canonical operating systems.

## Codex Workflow

Codex works in this repository through a focused runtime layer. The canonical systems remain:

- `.rules/` for architecture and workflow rules
- native `bd` for Beads backlog tracking
- `.codex/scripts/` for Cognee and runtime automation
- repo-local handoff or plan notes when they already exist

Use the Codex compatibility docs and scripts under `.codex/` as entrypoints, not as a separate source of truth.

### Codex Operating Sequence

1. Read the relevant `.rules/` documents before changing code or infrastructure.
2. If Beads is available, start from `bd ready --json` and claim one issue with `bd update <id> --claim --json`.
3. For planning, research, or autonomous startup work, attempt `./.codex/scripts/cognee-brief.sh "<query>"` before broad repository exploration.
4. Follow `.rules/patterns/operator-workflow.md` plus `.codex/workflows/autonomous-execution.md` as the default execution loop.
5. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
6. Close Beads work only after verification passes.
7. If you are in an execution/autonomous landing lane, land the session with `./.codex/scripts/land.sh`.

### Codex Guardrails

- Do not recreate legacy `.planning/` workspaces or duplicate issue trackers under `.codex/`.
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
- Attempt a Cognee brief with `./.codex/scripts/cognee-brief.sh "<query>"` before broad repository exploration.
- Close Beads issues only after verification passes.
- If verification finds gaps, create follow-up Beads bug issues instead of closing the parent work early.
- If Cognee is unavailable, continue only when the task remains locally verifiable from `.rules/`, handoff notes, and repo evidence.
- If `.beads/` or `bd` is unavailable, continue with `.rules/patterns/operator-workflow.md` and local verification steps without blocking on issue tracking.

<!-- BEGIN BEADS INTEGRATION -->
## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update <id> --claim --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Use `bd dolt push`/`bd dolt pull` for remote sync
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

<!-- END BEADS INTEGRATION -->

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
