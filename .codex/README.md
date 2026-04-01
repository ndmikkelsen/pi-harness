# Codex Compatibility Layer

This repository is the source of the `ai-harness` CLI and the scaffold it generates.
Codex should use this runtime layer to maintain the harness, validate the generated scaffold, and keep local and global setup flows aligned.

## Canonical Systems

- .rules/ is the source of truth for architecture and workflow patterns
- .planning/ is the GSD execution and handoff workspace
- .codex/scripts/ contains the live Cognee and planning sync plumbing
- README.md plus docs/ai-harness-premise.md, docs/ai-harness-map.md, and docs/architecture.md describe the real product and architecture
- Use native `bd` as the Beads task-tracking interface after `bd init`

## Codex Mapping

| Existing project surface | Codex entrypoint |
| --- | --- |
| Runtime scripts | .codex/scripts/*.sh |
| Agent role briefs | .codex/agents/*.md |
| Repo setup skill | .codex/skills/harness/SKILL.md |
| Cognee advisor | ./.codex/scripts/cognee-brief.sh |
| Planning sync | ./.codex/scripts/sync-planning-to-cognee.sh |
| Landing protocol | ./.codex/scripts/land.sh |

## Runtime Surface

- `./.codex/scripts/cognee-bridge.sh` - low-level Cognee query, upload, and cognify entrypoint
- `./.codex/scripts/cognee-sync-planning.sh` - sync GSD planning artifacts into Cognee
- `./.codex/scripts/sync-planning-to-cognee.sh` - user-facing planning sync entrypoint
- `./.codex/scripts/bootstrap-worktree.sh` - seed local worktree state and link shared `.env` / `.kamal` secrets when present
- `.codex/workflows/autonomous-execution.md` - backlog-driven autonomous execution policy shared across Codex and OpenCode
- `.codex/docker/Dockerfile.cognee` - container build source for the Cognee deploy template
- `.codex/skills/harness/SKILL.md` - source skill instructions mirrored by the globally installed OpenCode `harness` skill

## Default Workflow

1. Read `README.md`, `docs/ai-harness-premise.md`, and `.planning/STATE.md` before editing scaffold behavior.
2. For scaffold changes, update `src/templates/**` and relevant generators before rebuilding `dist/`.
3. Follow `.rules/patterns/operator-workflow.md` as the canonical operator runbook.
4. If Beads is available, use `bd ready --json`, claim the active issue, and start from `/gsd-next`.
5. Use `ai-harness --mode existing . --init-json` to validate how this repo adopts its own scaffold without clobbering existing files.
6. Use `ai-harness doctor . --assistant codex` to audit the current repo after runtime changes.
7. Generate a knowledge brief with ./.codex/scripts/cognee-brief.sh when Cognee is available.
8. Use `.codex/workflows/autonomous-execution.md` for one-agent backlog-driven execution, or `.codex/workflows/parallel-execution.md` for multi-wave execution.
9. Run `pnpm typecheck`, `pnpm test`, `pnpm test:bdd`, and `pnpm test:smoke:dist` before landing scaffold or runtime changes.
10. Close or update Beads issues only after verification passes; create bug issues if verification reveals gaps.
11. Finish with ./.codex/scripts/land.sh to publish the feature branch and open or update the PR to `dev`.

## Rules

- Do not create parallel planning systems under .codex/.
- Treat .codex/ as the runtime surface for assistant-specific scripts and docs while keeping `.planning/` and `.rules/` canonical.
- Keep source templates, generated docs, and built `dist/` artifacts in sync.
- If Cognee is unavailable, continue with .rules/, .planning/, and repo search.
- Prefer `harness` as the user-facing skill name and `ai-harness` as the CLI/package name.
