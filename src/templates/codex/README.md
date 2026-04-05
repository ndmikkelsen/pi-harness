# {{COMPAT_LABEL}} Compatibility Layer

> Compatibility map and maintenance guide for the Codex-facing runtime surface.

This repository already has working project systems for backlog tracking, runtime automation, and knowledge capture.
{{COMPAT_LABEL}} should use them directly from Pi through this compatibility layer.

Workflow authority lives in `.rules/patterns/operator-workflow.md`; Pi-native reusable orchestration lives in `.omp/*`; `.codex/*` carries compatibility docs, wrappers, and maintenance notes.

## Authority Split

- `.rules/patterns/operator-workflow.md` - canonical day-to-day operator workflow
- `.omp/agents/*.md` - Pi-native custom agents discovered directly by Pi
- `.omp/skills/*/SKILL.md` - Pi-native reusable skills for repo-specific task shaping and execution help
- `.codex/workflows/*.md` - Codex-compatible autonomous or multi-wave deltas
- `.codex/scripts/*.sh` - compatibility wrappers for Cognee, bootstrap, and landing
- `README.md` plus repo docs - product and architecture truth

## {{COMPAT_LABEL}} Mapping

| Project surface | Primary entrypoint |
| --- | --- |
| Pi-native custom agents | `.omp/agents/*.md` |
| Pi-native reusable skills | `.omp/skills/*/SKILL.md` |
| Runtime scripts | `.codex/scripts/*.sh` |
| Compatibility workflow deltas | `.codex/workflows/*.md` |
| Compatibility agent briefs | `.codex/agents/*.md` |
| Repo setup skill | `.codex/skills/harness/SKILL.md` |
| Cognee advisor | `./.codex/scripts/cognee-brief.sh` |
| Operator runbook | `.rules/patterns/operator-workflow.md` |
| Landing protocol | `./.codex/scripts/land.sh` |

## Runtime Surface

- `.omp/agents/orchestrator.md` - Pi-native custom agent for multi-wave task orchestration
- `.omp/skills/parallel-wave-design/SKILL.md` - Pi-native reusable guidance for safe task batching and wave handshakes
- `./.codex/scripts/cognee-bridge.sh` - low-level Cognee query, upload, and cognify entrypoint
- `./.codex/scripts/bootstrap-worktree.sh` - seed local worktree state and link shared `.env` / `.kamal` secrets when present
- `./.codex/scripts/land.sh` - feature-branch closeout that publishes the current branch and ensures a PR to `dev` exists
- `.codex/workflows/autonomous-execution.md` - Codex-compatible backlog-driven autonomous lane delta
- `.codex/workflows/parallel-execution.md` - Codex-compatible multi-wave delta aligned to Pi task semantics
- `.codex/docker/Dockerfile.cognee` - container build source for the Cognee deploy template
- `.codex/skills/harness/SKILL.md` - reusable setup workflow for new and existing repositories

## Default Workflow

1. Read `README.md`, repo docs, and the active handoff or plan context before editing scaffold behavior.
2. For scaffold changes, update `src/templates/**` and relevant generators before rebuilding `dist/`.
3. Use `.rules/patterns/operator-workflow.md` as the canonical day-to-day operator runbook.
4. Use `.omp/agents/*.md` and `.omp/skills/*/SKILL.md` for Pi-native reusable orchestration help when the work benefits from custom project guidance.
5. Use `.codex/workflows/autonomous-execution.md` or `.codex/workflows/parallel-execution.md` only for Codex-compatible autonomous or multi-wave deltas.
6. Use the runtime scripts in `.codex/scripts/` when those runbooks call for Cognee briefs, worktree bootstrap, or landing.
7. Use `pi-harness --mode existing . --assistant codex --init-json` to validate how this repo adopts its own scaffold without clobbering existing files.
8. Use `pi-harness doctor . --assistant codex` to audit the current repo after runtime changes.
9. Run `pnpm typecheck`, `pnpm test`, `pnpm test:bdd`, and `pnpm test:smoke:dist` before landing scaffold or runtime changes.

## Cognee Dataset Seeding

Use this when `./.codex/scripts/cognee-brief.sh` reports missing datasets or when you want to refresh the knowledge garden after major doc and workflow changes.

- Keep the default split: `<app>-knowledge` for README/docs/rules/handoff context, `<app>-patterns` for reusable agents, skills, feature files, and workflow examples.
- Use `sync-dir` for directories containing `.md` or `.feature` files, and `upload` for standalone files such as `README.md` or `STICKYNOTE.md`.
- If a repo keeps handoff or evidence notes outside the defaults, sync those directories into the same datasets instead of creating one-off names.

```bash
APP_SLUG=<app-slug>

./.codex/scripts/cognee-bridge.sh sync-dir docs --dataset "$APP_SLUG-knowledge"
./.codex/scripts/cognee-bridge.sh sync-dir .rules --dataset "$APP_SLUG-knowledge"
./.codex/scripts/cognee-bridge.sh upload README.md --dataset "$APP_SLUG-knowledge"

./.codex/scripts/cognee-bridge.sh sync-dir .omp/agents --dataset "$APP_SLUG-patterns"
./.codex/scripts/cognee-bridge.sh sync-dir .omp/skills --dataset "$APP_SLUG-patterns"
./.codex/scripts/cognee-bridge.sh sync-dir .codex/agents --dataset "$APP_SLUG-patterns"
./.codex/scripts/cognee-bridge.sh sync-dir .codex/skills --dataset "$APP_SLUG-patterns"

./.codex/scripts/cognee-bridge.sh cognify --dataset "$APP_SLUG-knowledge"
./.codex/scripts/cognee-bridge.sh cognify --dataset "$APP_SLUG-patterns"
```

- Validate the refresh with `./.codex/scripts/cognee-bridge.sh health` and a follow-up `./.codex/scripts/cognee-brief.sh "<query>"`.

## Rules

- Do not create parallel planning systems under `.codex/` or `.omp/`.
- Keep `.rules/` canonical, `.omp/` Pi-native, and `.codex/` compatibility-only.
- Keep source templates, generated docs, and built `dist/` artifacts in sync.
- Prefer `harness` as the reusable setup reference and `pi-harness` as the CLI/package name.