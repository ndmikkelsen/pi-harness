# Architecture

## Overall shape

`ai-harness` is a layered scaffold-generator CLI with a dogfooded runtime surface.

- `src/cli.ts` is the command-line entrypoint
- `src/commands/*.ts` orchestrate command behavior
- `src/core/*.ts` provides reusable filesystem, cleanup, git, policy, and helper logic
- `src/generators/*.ts` map scaffold concerns to output paths
- `src/templates/**` stores the canonical scaffold content
- the repository root, `.codex/**`, `.rules/**`, and `config/**` are the scaffold applied back onto this repo

## Layers

### CLI entry layer

- file: `src/cli.ts`
- responsibility: parse user input, dispatch commands, and format command output
- current commands: scaffold init path and `doctor`

### Command orchestration layer

- files: `src/commands/init.ts`, `src/commands/doctor.ts`
- responsibility: turn parsed options into coordinated workflows
- command code stays thin by delegating reusable behavior to `src/core/**` and `src/generators/**`

### Core domain services layer

- files: `src/core/filesystem.ts`, `src/core/template-loader.ts`, `src/core/git.ts`, `src/core/project-input.ts`, `src/core/cleanup-manifests.ts`, `src/core/policy.ts`
- responsibility: shared primitives for applying managed files, loading templates, resolving project input, cleanup handling, and git/bootstrap integration

### Scaffold composition layer

- files: `src/generators/index.ts`, `src/generators/root.ts`, `src/generators/codex.ts`, `src/generators/rules.ts`, `src/generators/config.ts`, `src/generators/project-docs.ts`, `src/generators/planning.ts`
- responsibility: define what gets scaffolded, by concern, without baking every output into one monolithic command

### Template source layer

- files: `src/templates/**`
- responsibility: canonical scaffold text and scripts
- source-of-truth rule: edit here first, not in `dist/templates/**`

### Dogfooded runtime and policy layer

- files: `AGENTS.md`, `.codex/**`, `.rules/**`, `config/**`, `.kamal/secrets.example`, `STICKYNOTE.example.md`
- responsibility: prove that the scaffold works against the repository that builds it

### Verification layer

- files: `tests/**`, `apps/cli/features/**`
- responsibility: guard the CLI contract, scaffold outputs, docs alignment, smoke behavior, and BDD expectations

## Data flow

1. `src/cli.ts` parses options and dispatches to `runInit(...)` or `runDoctor(...)`.
2. `src/commands/init.ts` resolves project identity, policy defaults, and cleanup choices.
3. `src/generators/index.ts` expands a `ScaffoldContext` into `ManagedEntry[]`.
4. `src/core/filesystem.ts` applies those entries to the target directory with preserve-by-default behavior.
5. `src/core/git.ts` wires git initialization plus bootstrap hooks when requested.
6. `src/commands/doctor.ts` rebuilds the expected managed file set and validates that a target repo still matches the supported baseline.

## Source-of-truth rules

- edit `src/templates/**` before touching dogfooded `.codex/**`, `.rules/**`, or root scaffold outputs
- rebuild `dist/` after source or template changes
- keep tests and dogfooded outputs aligned in the same change

## Current baseline assumptions

- Codex is the only supported scaffold target
- Beads is the only backlog system intentionally scaffolded
- Cognee is optional but first-class through `.codex/scripts/*`
- Pi is the operating environment for the workflow, not a separate scaffold mode
