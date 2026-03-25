# Architecture

## Shape

The project is intentionally split into small layers:

- `src/cli.ts` parses CLI arguments and prints reports
- `src/commands/init.ts` coordinates resolution, generation, file application, and optional git setup
- `src/core/` holds reusable domain logic like project resolution, port selection, filesystem writes, and git detection
- `src/generators/` defines scaffold content by concern instead of keeping one giant script
- `src/generators/codex.ts` adds the Codex/OpenCode compatibility layer on top of the shared scaffold when requested
- `tests/` covers unit and integration behavior
- `apps/cli/features/` captures BDD scenarios for the expected user-facing workflow

## Flow

1. Resolve project mode and target directory.
2. Resolve safe service ports.
3. Build a scaffold context from policy defaults plus user input, including the assistant target.
4. Generate managed files and directories, then add assistant-specific overlays.
5. Apply the plan with merge or skip rules for existing files.
6. Initialize git only when requested and only when no repo already exists.

## Design choices

- TypeScript over Bash for testability and maintainability
- generator modules grouped by domain (`root`, `beads`, `planning`, `claude`, `codex`, `config`, `rules`, `project-docs`)
- command-surface scaffolding now includes `.claude/commands`, `.claude/agents`, and `.agents`.
- merge-aware adoption for the most important shared files instead of blind overwrite-or-skip behavior
- optional remote port detection instead of mandatory network coupling
- Codex/OpenCode support is layered on top of the shared Claude-compatible backend scripts so both workflows can coexist

## Deferred work

- deeper YAML-aware merging for files like `.pre-commit-config.yaml`
- richer CLI subcommands like `inspect` or `doctor`
- fuller parity for deploy/runtime automation that still depends on machine-specific tools
