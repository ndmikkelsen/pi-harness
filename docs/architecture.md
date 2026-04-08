# Architecture

## Overall shape

`pi-harness` is a layered scaffold-generator CLI with a dogfooded Pi-native runtime surface.

- `src/cli.ts` is the command-line entrypoint
- `src/commands/*.ts` orchestrate command behavior
- `src/core/*.ts` provides reusable filesystem, cleanup, git, policy, and helper logic
- `src/generators/*.ts` map scaffold concerns to output paths
- `src/templates/**` stores the canonical scaffold content
- the repository root, `.pi/**`, `scripts/**`, `config/**`, and `.kamal/**` are the scaffold applied back onto this repo

## Layers

### CLI entry layer
- file: `src/cli.ts`
- responsibility: parse user input, dispatch commands, and format command output

### Command orchestration layer
- files: `src/commands/init.ts`, `src/commands/doctor.ts`
- responsibility: turn parsed options into coordinated workflows

### Core domain services layer
- files: `src/core/filesystem.ts`, `src/core/template-loader.ts`, `src/core/git.ts`, `src/core/project-input.ts`, `src/core/cleanup-manifests.ts`, `src/core/policy.ts`
- responsibility: shared primitives for applying managed files, loading templates, resolving project input, cleanup handling, and git/bootstrap integration

### Scaffold composition layer
- files: `src/generators/index.ts`, `src/generators/root.ts`, `src/generators/pi.ts`, `src/generators/config.ts`, `src/generators/project-docs.ts`
- responsibility: define the live scaffolded surfaces by concern without baking every output into one monolithic command

### Template source layer
- files: `src/templates/**`
- responsibility: canonical scaffold text and scripts
- source-of-truth rule: edit here first, not in `dist/templates/**`

### Dogfooded runtime layer
- files: `AGENTS.md`, `.pi/**`, `scripts/**`, `config/**`, `.kamal/secrets.example`, `STICKYNOTE.example.md`
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
6. `src/commands/doctor.ts` rebuilds the expected managed file set and validates that a target repo still matches the supported Pi-native baseline.

## Source-of-truth rules

- edit `src/templates/**` before touching dogfooded root outputs
- rebuild `dist/` after source or template changes
- keep tests and dogfooded outputs aligned in the same change

## Current baseline assumptions

- Pi is the runtime surface, not a compatibility wrapper around another assistant-specific layout
- Beads is the backlog system intentionally scaffolded
- Cognee is optional but first-class through `scripts/*`
- runtime guidance lives in `AGENTS.md` and `.pi/*`
- legacy assistant-specific runtime artifacts and old planning workspaces are cleanup targets rather than supported runtime surfaces
