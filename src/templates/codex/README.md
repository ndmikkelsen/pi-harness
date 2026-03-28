# {{COMPAT_LABEL}} Compatibility Layer

This repository already has working project systems for backlog tracking, planning, and knowledge capture.
{{COMPAT_LABEL}} should use them directly through this runtime layer.

## Canonical Systems

- .rules/ is the source of truth for architecture and workflow patterns
- .planning/ is the GSD execution and handoff workspace
- .codex/scripts/ contains the live Cognee and planning sync plumbing
- Use native `bd` as the Beads task-tracking interface after `bd init`

## {{COMPAT_LABEL}} Mapping

| Existing project surface | {{COMPAT_LABEL}} entrypoint |
| --- | --- |
| Runtime scripts | .codex/scripts/*.sh |
| Agent role briefs | .codex/agents/*.md |
| Repo setup skill | .codex/skills/scaiff-repo-setup/SKILL.md |
| Cognee advisor | ./.codex/scripts/cognee-brief.sh |
| Planning sync | ./.codex/scripts/sync-planning-to-cognee.sh |
| Landing protocol | ./.codex/scripts/land.sh |

## Runtime Surface

- `./.codex/scripts/cognee-bridge.sh` - low-level Cognee query, upload, and cognify entrypoint
- `./.codex/scripts/cognee-sync-planning.sh` - sync GSD planning artifacts into Cognee
- `./.codex/scripts/sync-planning-to-cognee.sh` - user-facing planning sync entrypoint
- `./.codex/scripts/bootstrap-worktree.sh` - seed local worktree state
- `.codex/docker/Dockerfile.cognee` - container build source for the Cognee deploy template
- `.codex/skills/scaiff-repo-setup/SKILL.md` - reusable setup workflow for new and existing repositories

## Default Workflow

1. Read relevant .rules/ and current .planning/ context.
2. Review .planning/STATE.md before starting implementation.
3. For existing repos, optionally run `scaiff --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json` before tailoring new scaffold files.
4. Generate a knowledge brief with ./.codex/scripts/cognee-brief.sh.
5. On a fresh worktree, run ./.codex/scripts/bootstrap-worktree.sh.
6. Break work into waves using .codex/workflows/parallel-execution.md.
7. Validate each wave before handing off or merging into the next.
8. Finish with ./.codex/scripts/land.sh.

## Rules

- Do not create parallel planning systems under .codex/.
- Treat .codex/ as the runtime surface for assistant-specific scripts and docs while keeping `.planning/` and `.rules/` canonical.
- If Cognee is unavailable, continue with .rules/, .planning/, and repo search.
