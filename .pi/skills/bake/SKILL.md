---
name: bake
description: Use the pi-harness CLI and Pi-native `/bake` flow to scaffold new and existing repositories for vanilla Pi with Beads, Cognee, and project-local `.pi/*` runtime surfaces.
---

# Bake

Use this skill when the user wants `/bake` or `/skill:bake` to bootstrap a repository, refresh an existing checkout to the supported pi-harness baseline, or explain the setup workflow before execution.

## Rules

- Use `/bake` or `/skill:bake` first; do not make users memorize raw `pi-harness` flags for normal setup work.
- `/bake` should auto-detect whether the target is `new` or `existing`.
- For existing repos, `/bake` should refresh managed files and remove curated legacy AI scaffolding with `pi-harness --mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --init-json`.
- Keep `/adopt` only as the conservative compatibility path when the user explicitly wants preserve-existing behavior.
- Keep provider/model setup inside Pi runtime configuration rather than changing the scaffold identity.
- Treat Cognee as lane-aware: attempt a Cognee brief for planning or research when `scripts/cognee-brief.sh` exists, and continue only when local repo evidence remains sufficient if Cognee is unavailable.
- Prefer shared Pi packages in `.pi/settings.json` over machine-specific absolute extension install paths.

## Workflow

1. Determine the target path and whether the user wants the native `/bake` execution path or guidance through `/skill:bake` first.
2. If you are in `/skill:bake`, explain that `/bake` auto-detects `new` vs `existing`, then invoke the same native `/bake` flow when execution is requested.
3. For a new target, `/bake` runs the equivalent of `pi-harness --init-json`.
4. For an existing target, `/bake` runs the equivalent of `pi-harness --mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --init-json` so baked repos refresh managed scaffold files instead of silently preserving stale ones.
5. Use `/adopt` only when the user explicitly wants the conservative `pi-harness --mode existing . --init-json` preserve-existing path.
6. Run `pi-harness doctor <target>` after setup when you need an explicit audit.
7. Summarize what was created, what was refreshed, what was removed, and any follow-up gaps.

## Existing Repository Adaptation

Before editing scaffold files in an existing project, gather:

- git status, branch, remotes, and recent commits
- Beads state if `bd` or `.beads/` is available
- Cognee brief if `scripts/cognee-brief.sh` already exists
- project docs like `README*`, `docs/**/*.md`, repo-local handoff docs when present, `AGENTS.md`, and any existing `.pi/**/*` runtime files, especially `.pi/settings.json`, `.pi/mcp.json`, `.pi/agents/*`, `.pi/agents/*.chain.md`, `.pi/extensions/role-workflow.ts`, `.pi/extensions/repo-workflows.ts`, `.pi/prompts/bake.md`, and `.pi/prompts/adopt.md`
- manifest files using `references/manifest-discovery.md`

Use `assets/adoption-notes-template.md` as a scratch document if the repo is large or the context is noisy.

## Customization Priority

Prefer to tailor newly created files in this order:

1. `AGENTS.md`
2. `.pi/settings.json`
3. `.pi/mcp.json`
4. `.pi/extensions/role-workflow.ts`
5. `.pi/agents/*.md`
6. `.pi/agents/*.chain.md`
7. `.pi/extensions/repo-workflows.ts`
8. `.pi/prompts/bake.md`
9. `.pi/prompts/adopt.md`
10. `.pi/skills/bake/SKILL.md`
11. `.pi/prompts/serve.md`
12. `STICKYNOTE.example.md`

Do not add secrets to `.env.example`; keep placeholder values only.
