# AGENTS.md

> AI Development Guide

## Overview

This repository is prepared for Codex through a focused runtime layer while keeping .rules/ and .planning/ as the canonical project systems.

## Codex Workflow

Codex works in this repository through a focused runtime layer. The canonical systems remain:

- .rules/ for architecture and workflow rules
- .planning/ for GSD planning, execution, and handoff artifacts
- .codex/scripts/ for working Cognee and planning sync backends

Use the Codex compatibility docs and scripts under .codex/ as entrypoints, not as a separate source of truth.

### Codex Operating Sequence

1. Read the relevant .rules/ documents before changing code or infrastructure.
2. Inspect .planning/STATE.md and any active phase docs in .planning/.
3. Use native `bd` for task tracking after the repository is initialized with `bd init`.
4. Query Cognee with ./.codex/scripts/cognee-brief.sh "<query>".
5. On a fresh worktree, run ./.codex/scripts/bootstrap-worktree.sh.
6. Use `.rules/patterns/operator-workflow.md` and `/gsd-next` as the default interactive work loop.
7. Land the session with ./.codex/scripts/land.sh.

### Codex Guardrails

- Do not create duplicate planning systems or issue trackers under .codex/.
- Do not mirror .planning/ into .codex-specific directories.
- Keep Cognee integration non-blocking; if it is down, continue using local docs and planning artifacts.
- Treat .codex/agents/*.md as reusable role briefs and .codex/scripts/*.sh as the executable surface.
- Use `.codex/skills/harness/SKILL.md` when bootstrapping or adopting another repository with ai-harness.
- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.

### Repo-Specific Notes

- This repository builds the `ai-harness` CLI, its scaffold generators, and the globally installed `harness` skill.
- For scaffold changes, edit `src/templates/**` and relevant generator code first, then rebuild `dist/`.
- Use `ai-harness --mode existing . --init-json` and `ai-harness doctor . --assistant codex` when dogfooding the scaffold against this repo.
- Verify runtime or template changes with `pnpm typecheck`, `pnpm test`, and `pnpm test:smoke:dist`.

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

1. **Check ready work**: `bd ready --json` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim --json`
3. **Use the interactive default**: `/gsd-next` routes to the next useful GSD step without extra command hunting
4. **Use the explicit phase loop when needed**: `/gsd-discuss-phase <n>` -> `/gsd-plan-phase <n>` -> `/gsd-execute-phase <n>` -> `/gsd-verify-work <n>`
4. **Work on it**: Implement, test, document
5. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
6. **Complete only after verification passes**: `bd close <id> --reason "Verified"`

### Beads + GSD Harmonization

- Prefer the loop `bd ready -> claim -> /gsd-next -> /gsd-verify-work -> bd close`
- When phase work is required, use `/gsd-discuss-phase <n> -> /gsd-plan-phase <n> -> /gsd-execute-phase <n> -> /gsd-verify-work <n>`
- Use `.codex/workflows/autonomous-execution.md` for one-agent phase execution, or `.codex/workflows/parallel-execution.md` for multi-wave work
- Reference active Beads issue IDs in phase context and handoff notes when the work maps to a phase
- If `/gsd-verify-work <n>` finds gaps, create bug or follow-up issues instead of closing the parent issue early
- If `.beads/` or `bd` is unavailable, continue with GSD rather than blocking execution

### Project-Local Beads State

Beads is project-local in this repository:

- Each write updates local Beads state under `.beads/`
- No separate Beads Dolt remote sync is required for normal usage
- Keep issue status current in the repo before landing or handing off work

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md, `docs/harness-usage.md`, and `.rules/patterns/operator-workflow.md`.

<!-- END BEADS INTEGRATION -->

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until the feature branch is pushed and the pull request to `dev` exists or is updated.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH THE FEATURE BRANCH** - This is MANDATORY:
   ```bash
   git push -u origin <feature-branch>
   git status  # MUST show the current branch is clean and tracking origin/<feature-branch>
   ```
5. **OPEN OR UPDATE THE PR** - Create or refresh the PR from `<feature-branch>` to `dev`
6. **Clean up** - Clear stashes, prune remote branches when safe
7. **Verify** - All changes committed, pushed, and attached to the `dev` PR
8. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until the feature branch push succeeds and the PR to `dev` exists or is updated
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- NEVER use landing to merge into or push directly to `main`
- If push or PR creation fails, resolve and retry until it succeeds
