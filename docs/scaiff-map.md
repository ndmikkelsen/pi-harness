# Scaiff Map

## Purpose

`scaiff` is a TypeScript CLI that bootstraps a repository for a Codex/OpenCode-first development workflow.

The kept systems are:
- GSD for planning and execution context
- Beads for task tracking through native `bd`
- Cognee for optional knowledge briefs and planning sync
- `.codex/` for the assistant runtime surface shared by Codex and OpenCode

## Runtime Shape

### CLI and orchestration

- `src/cli.ts` exposes `scaiff` and `scaiff doctor`
- `src/commands/init.ts` builds scaffold context and applies files
- `src/commands/doctor.ts` validates the generated Codex/OpenCode runtime layout

### Core generators

- `src/generators/root.ts` creates root docs and optional root-file merge behavior for adoption mode
- `src/generators/planning.ts` creates the official GSD planning surface
- `src/generators/codex.ts` creates the only assistant runtime surface under `.codex/`
- `src/generators/config.ts` creates `.kamal/` and `config/` deploy templates
- `src/generators/rules.ts` creates workflow and architecture guidance under `.rules/`
- `src/generators/project-docs.ts` creates `STICKYNOTE.example.md`

## Generated Repository Shape

### Planning

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/research/`
- `.planning/phases/`
- `.planning/quick/`
- `.planning/milestones/`
- `.planning/codebase/`

### Assistant runtime

- `.codex/README.md`
- `.codex/scripts/cognee-bridge.sh`
- `.codex/scripts/cognee-brief.sh`
- `.codex/scripts/cognee-sync-planning.sh`
- `.codex/scripts/sync-planning-to-cognee.sh`
- `.codex/scripts/bootstrap-worktree.sh`
- `.codex/scripts/land.sh`
- `.codex/agents/*.md`
- `.codex/skills/scaiff-repo-setup/SKILL.md`
- `.codex/skills/scaiff-repo-setup/references/*.md`
- `.codex/skills/scaiff-repo-setup/assets/adoption-notes-template.md`
- `.codex/workflows/parallel-execution.md`
- `.codex/templates/phase-execution.md`
- `.codex/docker/Dockerfile.cognee`
- `AGENTS.md`

### Rules and local docs

- `.rules/patterns/gsd-workflow.md`
- `.rules/patterns/beads-integration.md`
- `.rules/patterns/cognee-gsd-integration.md`
- `.rules/patterns/git-workflow.md`
- `.rules/patterns/env-security.md`
- `STICKYNOTE.example.md`

## Removed Shape

The scaffold no longer generates:
- legacy assistant runtime directories and placeholder governance docs
- Beads wrapper scripts or Beads config templates
- broad Cognee repo sync helpers
- dead `.codex` template files

## Existing Repository Adoption

- default behavior: create missing scaffold files and skip all pre-existing scaffold files unchanged
- optional behavior: `--merge-root-files` appends scaffold entries into `.gitignore` and `.env.example`
- optional behavior: `--cleanup-manifest legacy-ai-frameworks-v1` removes curated legacy AI-framework files before scaffolding
- `--force` still overwrites managed files explicitly when you want full regeneration
## Deploy Review

### Kept templates

- `.kamal/secrets.example` provides placeholder-only secrets
- `config/deploy.yml` is the generic app deploy starter
- `config/deploy.cognee.yml` is the concrete Cognee service template

### Current infrastructure assumptions

- compute host: `10.10.20.138`
- SSH user: `compute`
- SSH key: `~/.ssh/z3r0Layer-main`
- registry: `harbor.compute.lan`
- default Cognee DB port: `5432`

### Notes

- `config/deploy.yml` is intentionally incomplete and should be treated as an app-specific starting point, not a production-ready manifest
- `config/deploy.cognee.yml` is the stronger template because it includes proxy, env, accessory DB, and dockerfile wiring
- Cognee is optional at runtime; the scaffold keeps the integration non-blocking when the service is unavailable

## Commit-ready summary

If you want to commit this cleanup, a good conventional message is:

`refactor: simplify scaiff around codex, gsd, beads, and cognee`
