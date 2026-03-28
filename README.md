# scaiff

`scaiff` is the local AI workflow bootstrapper.

It provides a modular TypeScript CLI that can:

- scaffold a brand new project directory
- adopt an existing repository without clobbering user files
- generate the local AI workflow structure for Codex/OpenCode, plus GSD, Beads, and Cognee
- keep implementation concerns separated into command, core, and generator layers

## Why this repo exists

This repository is a modular TypeScript CLI with clear module boundaries, executable regression tests, and safer defaults.

## Current command surface

`scaiff` defaults to `--assistant codex` and also accepts `--assistant opencode` as a Codex-compatible alias.

After building, the CLI is available as `scaiff`.

```bash
pnpm install
pnpm build

# new project
pnpm exec tsx src/cli.ts sample-app

# new project for Codex
pnpm exec tsx src/cli.ts sample-app --assistant codex

# new project for OpenCode using the same Codex-compatible scaffold
pnpm exec tsx src/cli.ts sample-app --assistant opencode

# adopt the current repository
pnpm exec tsx src/cli.ts --mode existing .

# adopt the current repository and opt into root-file merges
pnpm exec tsx src/cli.ts --mode existing . --merge-root-files

# emit machine-readable scaffold results
pnpm exec tsx src/cli.ts --mode existing . --init-json

# remove curated legacy AI-framework files before adopting
pnpm exec tsx src/cli.ts --mode existing . --cleanup-manifest legacy-ai-frameworks-v1 --init-json

# preview changes only
pnpm exec tsx src/cli.ts sample-app --dry-run

# probe the compute host for service ports before writing Kamal configs
pnpm exec tsx src/cli.ts sample-app --detect-ports

# audit an existing repository
pnpm exec tsx src/cli.ts doctor . --assistant auto

# audit with JSON output
pnpm exec tsx src/cli.ts doctor . --assistant codex --json
```

## What gets scaffolded

New repositories receive the full scaffold. Existing repositories create the same missing files while preserving pre-existing scaffold files by default.

- root hygiene files like `.gitignore`, `.env.example`, `.gitleaks.toml`, `.pre-commit-config.yaml`
- Beads docs for native `bd`; run `bd init` to create `.beads/`
- `.planning/` for GSD planning artifacts
- `.codex/` runtime scripts, docs, templates, agents, and docker assets shared by Codex and OpenCode
- `.codex/skills/scaiff-repo-setup/` for reusable repository setup guidance
- `AGENTS.md` for the repo-level Codex/OpenCode operating guide
- `.kamal/` and `config/` deployment templates
- `.rules/`, `STICKYNOTE.example.md`, and `.planning/` as the canonical guidance surface

## Safety model for existing projects

- existing files are preserved by default
- missing scaffold files are added without rewriting pre-existing scaffold files
- curated legacy AI-framework cleanup is opt-in via `--cleanup-manifest legacy-ai-frameworks-v1`
- `.gitignore` and `.env.example` are only merged when `--merge-root-files` is explicitly set
- `STICKYNOTE.md` is intentionally local-only and can be seeded from `STICKYNOTE.example.md`
- `AGENTS.md` is added for Codex/OpenCode-targeted projects
- `--force` replaces managed files explicitly

## Existing repo workflow

1. gather project context from git, docs, manifests, Beads, and Cognee when available
2. optionally run `scaiff --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json` to remove curated legacy AI-framework files
3. run `scaiff --mode existing <path> --init-json`
4. customize only the files listed in `createdPaths`
5. rerun with `--merge-root-files` only if you explicitly want `.gitignore` and `.env.example` merged
6. finish with `scaiff doctor <path> --assistant <codex|opencode>`

## Development

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm install:local
```

## Local launcher

`~/.local/bin/scaiff` is now a thin wrapper around this repository.

- it prefers `dist/src/cli.js`
- it will try `pnpm build` if `dist/` is missing
- it falls back to the repo-installed `tsx` binary to run `src/cli.ts` when dependencies are already installed
- set `SCAIFF_REPO` if you want the launcher to target a different checkout

Refresh the installed launchers after moving this repo:

```bash
pnpm install:local
```

That command installs `scaiff` into `~/.local/bin/`.

BDD specs live in `apps/cli/features/`, and executable regression coverage lives in `tests/`.

## Docs

- `docs/architecture.md`
- `docs/migration-plan.md`
- `docs/scaiff-map.md`
