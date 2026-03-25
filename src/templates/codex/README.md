# {{COMPAT_LABEL}} Compatibility Layer

This repository already has working project systems for backlog tracking, planning, and knowledge capture.
{{COMPAT_LABEL}} should use them directly through this thin adapter layer.

## Canonical Systems

- .rules/ is the source of truth for architecture and workflow patterns
- .planning/ is the GSD execution and handoff workspace
- .claude/scripts/ contains the live Cognee and planning sync plumbing

## {{COMPAT_LABEL}} Mapping

| Existing project surface | {{COMPAT_LABEL}} entrypoint |
| --- | --- |
| Claude-compatible backend scripts | .codex/scripts/*.sh |
| Agent role briefs | .codex/agents/*.md |
| Cognee advisor | ./.codex/scripts/cognee-brief.sh |
| Planning sync | ./.codex/scripts/sync-planning-to-cognee.sh |
| Landing protocol | ./.codex/scripts/land.sh |

## Default Workflow

1. Read relevant .rules/ and current .planning/ context.
2. Review .planning/STATE.md before starting implementation.
3. Generate a knowledge brief with ./.codex/scripts/cognee-brief.sh.
4. On a fresh worktree, run ./.codex/scripts/bootstrap-worktree.sh.
5. Break work into waves using .codex/workflows/parallel-execution.md.
6. Validate each wave before handing off or merging into the next.
7. Finish with ./.codex/scripts/land.sh.

## Rules

- Do not create parallel planning systems under .codex/.
- Treat .codex/ as documentation and wrappers only.
- If Cognee is unavailable, continue with .rules/, .planning/, and repo search.
