---
name: scaiff-repo-setup
description: Use the scaiff CLI to scaffold new and existing repositories for Codex/OpenCode with GSD, Beads, and Cognee. For existing repositories, gather project context first and then customize only newly created scaffold files.
---

# Scaiff Repo Setup

Use this skill when the user wants to bootstrap a repository with `scaiff`, adopt an existing codebase into the scaffold, or tailor newly created AI workflow files to the project's real history and stack.

## Rules

- Decide `greenfield` (`new` mode) vs `existing` before running `scaiff`
- Never run `scaiff` in `new` mode against a non-empty directory
- Never use `--force` by default
- In existing repos, preserve pre-existing scaffold files by default
- Only use `--cleanup-manifest legacy-ai-frameworks-v1` when the user explicitly wants curated legacy AI-framework files removed
- Only use `--merge-root-files` when the user explicitly wants `.gitignore` and `.env.example` merged
- Treat Cognee as optional; continue when unavailable
- Customize only files that `scaiff` just created unless the user explicitly asks to rewrite existing scaffold files

## Workflow

1. Determine repository mode using `references/scaiff-command-matrix.md`
2. If the repository is existing, gather context using `references/existing-repo-context-checklist.md`
3. If the repo contains curated legacy AI-framework files and the user wants them cleaned up, run `scaiff --mode existing <target> --cleanup-manifest legacy-ai-frameworks-v1 --init-json` first
4. Run `scaiff` with `--init-json` so you can distinguish `createdPaths` from `skippedPaths`
5. In existing repos, customize only the files listed in `createdPaths`, guided by `references/scaffold-customization-map.md`
6. Run `scaiff doctor <target> --assistant <codex|opencode>` after setup
7. Summarize what was created, what was preserved, what was removed, and any follow-up gaps

## Existing Repository Adaptation

Before editing scaffold files in an existing project, gather:

- git status, branch, remotes, and recent commits
- Beads state if `bd` or `.beads/` is available
- Cognee brief if `.codex/scripts/cognee-brief.sh` already exists
- project docs like `README*`, `docs/**/*.md`, `.planning/*`, `.rules/**/*`, and `AGENTS.md`
- manifest files using `references/manifest-discovery.md`

Use `assets/adoption-notes-template.md` as a scratch document if the repo is large or the context is noisy.

## Customization Priority

Prefer to tailor newly created files in this order:

1. `.planning/PROJECT.md`
2. `.planning/REQUIREMENTS.md`
3. `.planning/ROADMAP.md`
4. `.planning/STATE.md`
5. `.codex/README.md`
6. `AGENTS.md`
7. `STICKYNOTE.example.md`

Do not add secrets to `.env.example`; keep placeholder values only.
