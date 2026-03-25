# ai-scaffolding

`scaff` is the local AI workflow bootstrapper.

It provides a modular TypeScript CLI that can:

- scaffold a brand new project directory
- adopt an existing repository without clobbering user files
- generate the local AI workflow structure for Claude or Codex/OpenCode, plus GSD, Beads, and Cognee
- keep implementation concerns separated into command, core, and generator layers

## Why this repo exists

This repository is a modular TypeScript CLI with clear module boundaries, executable regression tests, and safer defaults.

## Current command surface

`scaff` defaults to `--assistant codex` and also accepts `--assistant opencode` as a Codex-compatible alias.

After building, the CLI is available as `scaff`.

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

- root hygiene files like `.gitignore`, `.env.example`, `.gitleaks.toml`, `.pre-commit-config.yaml`
- Beads command wrappers and docs; run `bd init` to create `.beads/`
- `.planning/` for GSD planning artifacts
- `.claude/` hooks, scripts, and docker wrappers used as the shared backend layer
- `.claude/commands` and `.claude/agents` for reusable workflow commands and role briefs
- `.agents` for top-level reusable role briefs
- `CONSTITUTION.md` and `VISION.md` for project governance
- `.codex/` compatibility docs, wrappers, templates, and `AGENTS.md` when `--assistant codex` or `--assistant opencode` is selected
- `.kamal/` and `config/` deployment templates
- `.rules/`, `CLAUDE.md`, and `STICKYNOTE.md`

## Safety model for existing projects

- existing files are preserved by default
- `.gitignore` is merged with required ignored entries instead of being skipped outright
- `.env.example` gets an appended AI workflow block when needed
- `CLAUDE.md` gets an appended workflow section when needed
- `AGENTS.md` is added for Codex-targeted projects
- `--force` replaces managed files explicitly

## Development

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm install:local
```

## Local launcher

`~/.local/bin/scaff` is now a thin wrapper around this repository.

- it prefers `dist/src/cli.js`
- it will try `pnpm build` if `dist/` is missing
- it falls back to the repo-installed `tsx` binary to run `src/cli.ts` when dependencies are already installed
- set `SCAFF_REPO` if you want the launcher to target a different checkout

Refresh the installed launchers after moving this repo:

```bash
pnpm install:local
```

That command installs `scaff` into `~/.local/bin/`.

BDD specs live in `apps/cli/features/`, and executable regression coverage lives in `tests/`.

## Docs

- `docs/architecture.md`
- `docs/migration-plan.md`
