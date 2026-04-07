---
name: harness
description: Use the pi-harness CLI to scaffold new and existing repositories for vanilla Pi with Beads, Cognee, and project-local `.pi/*` runtime surfaces.
---

# Harness

Use this skill when the user wants to bootstrap a repository with `pi-harness`, adopt an existing codebase into the scaffold, or tailor newly created AI workflow files to the project's real history and stack.

## Rules

- Decide `greenfield` (`new` mode) vs `existing` before running `pi-harness`.
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
2. If the repository is existing, gather context using `references/existing-repo-context-checklist.md`.
3. If the repo contains curated legacy AI-framework files and the user wants them cleaned up, run `pi-harness --mode existing . --cleanup-manifest legacy-ai-frameworks-v1 --init-json` first.
4. When adopting the current repository, run `pi-harness --mode existing . --init-json` so you can distinguish `createdPaths` from `skippedPaths`.
5. In existing repos, customize only the files listed in `createdPaths`, guided by `references/scaffold-customization-map.md`.
6. Run `pi-harness doctor <target>` after setup.
7. Summarize what was created, what was preserved, what was removed, and any follow-up gaps.

## Existing Repository Adaptation

Before editing scaffold files in an existing project, gather:

- git status, branch, remotes, and recent commits
- Beads state if `bd` or `.beads/` is available
- Cognee brief if `scripts/cognee-brief.sh` already exists
- project docs like `README*`, `docs/**/*.md`, repo-local handoff docs when present, `AGENTS.md`, and any existing `.pi/**/*` runtime files, especially `.pi/settings.json`, `.pi/agents/*`, `.pi/agents/*.chain.md`, and `.pi/extensions/role-workflow.ts`
- manifest files using `references/manifest-discovery.md`

Use `assets/adoption-notes-template.md` as a scratch document if the repo is large or the context is noisy.

## Customization Priority

Prefer to tailor newly created files in this order:

1. `AGENTS.md`
2. `.pi/settings.json`
3. `.pi/extensions/role-workflow.ts`
4. `.pi/agents/*.md`
5. `.pi/agents/*.chain.md`
6. `.pi/extensions/repo-workflows.ts`
7. `.pi/skills/harness/SKILL.md`
8. `.pi/prompts/land.md`
9. `STICKYNOTE.example.md`

Do not add secrets to `.env.example`; keep placeholder values only.
