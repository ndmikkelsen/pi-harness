# Codex Compatibility Layer

This repository already has working project systems for backlog tracking, runtime automation, and knowledge capture.
Codex should use them directly from Pi through this runtime layer.

## Canonical Systems

- `.rules/` is the source of truth for architecture and workflow patterns
- native `bd` is the backlog interface for Beads tracking
- `.codex/scripts/` contains the live Cognee and runtime automation plumbing
- `README.md` plus repo docs describe the real product and architecture

## Codex Mapping

| Existing project surface | Codex entrypoint |
| --- | --- |
| Runtime scripts | `.codex/scripts/*.sh` |
| Agent role briefs | `.codex/agents/*.md` |
| Repo setup skill | `.codex/skills/harness/SKILL.md` |
| Cognee advisor | `./.codex/scripts/cognee-brief.sh` |
| Worktree bootstrap | `./.codex/scripts/bootstrap-worktree.sh` |
| Landing protocol | `./.codex/scripts/land.sh` |

## Runtime Surface

- `./.codex/scripts/bootstrap-worktree.sh` - seed local worktree state and link shared `.env` / `.kamal` secrets when present
- `./.codex/scripts/cognee-bridge.sh` - low-level Cognee query, upload, and cognify entrypoint
- `./.codex/scripts/cognee-brief.sh` - operator-facing Cognee brief entrypoint
- `./.codex/scripts/land.sh` - landing protocol for execution/autonomous lanes on feature branches
- `.codex/workflows/autonomous-execution.md` - backlog-driven autonomous execution policy for the Codex baseline
- `.codex/workflows/parallel-execution.md` - multi-wave execution policy for the Codex baseline
- `.codex/docker/Dockerfile.cognee` - container build source for the Cognee deploy template
- `.codex/skills/harness/SKILL.md` - reusable setup workflow for new and existing repositories

## Default Workflow

1. Read `README.md`, repo docs, and the active handoff or plan context before editing scaffold behavior.
2. For scaffold changes, update `src/templates/**` and relevant generators before rebuilding `dist/`.
3. Follow `.rules/patterns/operator-workflow.md` as the canonical operator runbook.
4. If Beads is available, use `bd ready --json`, claim the active issue, and work from repo-local context plus verification evidence.
5. Use `pi-harness --mode existing . --assistant codex --init-json` to validate how this repo adopts its own scaffold without clobbering existing files.
6. Use `pi-harness doctor . --assistant codex` to audit the current repo after runtime changes.
7. On a fresh checkout or worktree, run `./.codex/scripts/bootstrap-worktree.sh`.
8. For planning, research, or autonomous startup work, generate a knowledge brief with `./.codex/scripts/cognee-brief.sh` when Cognee is available.
9. Use `.codex/workflows/autonomous-execution.md` for one-agent backlog-driven execution, or `.codex/workflows/parallel-execution.md` for multi-wave execution.
10. Run `pnpm typecheck`, `pnpm test`, `pnpm test:bdd`, and `pnpm test:smoke:dist` before landing scaffold or runtime changes.
11. Close or update Beads issues only after verification passes; create bug issues if verification reveals gaps.
12. If you are in an execution/autonomous landing lane, finish with `./.codex/scripts/land.sh` to publish the feature branch and ensure a PR to `dev` exists.

## Rules

- Do not create parallel planning systems under `.codex/`; legacy `.planning/`, `.sisyphus/`, and planning-sync surfaces stay cleanup-only.
- Treat `.codex/` as the runtime surface for Codex-specific scripts and docs while keeping Beads and `.rules/` canonical.
- Keep source templates, generated docs, and built `dist/` artifacts in sync.
- Prefer `harness` as the reusable setup reference and `pi-harness` as the CLI/package name.
