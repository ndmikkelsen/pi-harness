---
name: bake
description: Use the pi-harness CLI to scaffold new and existing repositories for vanilla Pi with Beads, Cognee, and project-local `.pi/*` runtime surfaces.
---

# Bake

Use this skill when the user wants the canonical repo-local `/bake` setup surface, needs to bootstrap a repository with `pi-harness`, adopt an existing codebase into the scaffold, or tailor newly created AI workflow files to the project's real history and stack.

## Rules

- Decide `greenfield` (`new` mode) vs `existing` before running `pi-harness`.
- In baked repos, keep `/bake` as the canonical Pi setup surface and `/adopt` as the compatibility path for existing-repo refreshes.
- Never run `pi-harness` in `new` mode against a non-empty directory.
- Never use `--force` by default.
- In existing repos, preserve pre-existing scaffold files by default.
- Only use `--cleanup-manifest legacy-ai-frameworks-v1` when the user explicitly wants curated legacy AI-framework files removed.
- Only use `--merge-root-files` when the user explicitly wants `.gitignore` and `.env.example` merged.
- Treat Cognee as lane-aware: attempt a Cognee brief for planning or research when `scripts/cognee-brief.sh` exists, and continue only when local repo evidence remains sufficient if Cognee is unavailable.
- Prefer shared Pi packages in `.pi/settings.json` over machine-specific absolute extension install paths.
- Customize only files that `pi-harness` just created unless the user explicitly asks to rewrite existing scaffold files.

## Workflow

1. Determine repository mode using `references/pi-harness-command-matrix.md`.
2. If the repository is new, use the `new` mode command from `references/pi-harness-command-matrix.md` and continue with newly created files only.
3. If the repository is existing, gather context using `references/existing-repo-context-checklist.md`.
4. If the repo contains curated legacy AI-framework files and the user wants them cleaned up, run `pi-harness --mode existing . --cleanup-manifest legacy-ai-frameworks-v1 --init-json` first.
5. When refreshing the current repository in existing mode, prefer the canonical baked-repo `/bake` flow and run `pi-harness --mode existing . --init-json` so you can distinguish `createdPaths` from `skippedPaths`.
6. If the user explicitly uses `/adopt` or older notes reference adoption language, keep the same conservative existing-repo flow rather than inventing a separate path.
7. In existing repos, customize only the files listed in `createdPaths`, guided by `references/scaffold-customization-map.md`.
8. Run `pi-harness doctor <target>` after setup.
9. Summarize what was created, what was preserved, what was removed, and any follow-up gaps.

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
