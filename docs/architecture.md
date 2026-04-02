# Architecture

## Shape

The project is intentionally split into small layers:

- `src/cli.ts` parses CLI arguments and prints reports
- `src/commands/init.ts` coordinates resolution, generation, file application, and optional git setup
- `src/commands/install-skill.ts` installs the global OpenCode `harness` skill bundle plus the managed OpenCode and GSD default files it owns
- `src/core/` holds reusable domain logic like project resolution, port selection, filesystem writes, and git detection
- `src/generators/` defines scaffold content by concern instead of keeping one giant script
- `src/templates/` is the canonical scaffold source; `dist/templates/` is the built copy used by the shipped CLI
- `src/generators/codex.ts` seeds the Codex/OpenCode runtime layer, including scripts, agents, templates, and deploy assets
- `src/generators/planning.ts` seeds the official GSD planning surface (`PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, research, milestones, codebase, quick tasks, and phases)
- `src/local-launcher.ts` and `scripts/install-local-launcher.ts` install the local `ai-harness` wrapper in `~/.local/bin/`
- `tests/` covers unit and integration behavior
- `apps/cli/features/` captures BDD scenarios for the expected user-facing workflow

## Flow

1. Resolve project mode and target directory.
2. Resolve safe service ports.
3. Build a scaffold context from policy defaults plus user input, including the assistant target.
4. Generate managed files and directories, then add the selected assistant runtime surface.
5. Apply the plan with strict preserve-by-default rules for existing files, plus optional root-file merges.
6. Initialize git only when requested and only when no repo already exists.

## Design choices

- TypeScript over Bash for testability and maintainability
- generator modules grouped by domain (`root`, `planning`, `codex`, `config`, `rules`, `project-docs`)
- Codex/OpenCode runtime assets now live directly under `.codex/` as the single assistant runtime surface.
- preserve-by-default adoption for existing repos, with explicit opt-in merging for `.gitignore` and `.env.example`
- optional remote port detection instead of mandatory network coupling
- Codex/OpenCode support shares one runtime surface so the scaffold stays focused on the supported assistants and avoids deprecated parallel artifacts

## Deferred work

- deeper YAML-aware merging for files like `.pre-commit-config.yaml`
- better local refresh ergonomics beyond the current checkout + `pnpm install:local` flow
- richer upgrade assistance for older `scaiff`-era repos without weakening explicit review
- fuller parity for deploy/runtime automation that still depends on machine-specific tools
