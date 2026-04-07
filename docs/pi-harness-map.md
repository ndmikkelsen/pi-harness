# pi-harness map

`pi-harness` is a TypeScript CLI that bootstraps repositories for vanilla Pi with Beads and optional Cognee acceleration.

## Key surfaces

- `src/cli.ts` - command entrypoint
- `src/commands/init.ts` - scaffold/adoption command orchestration
- `src/commands/doctor.ts` - scaffold audit command
- `src/core/**` - reusable helpers and policies
- `src/generators/**` - managed output definitions
- `src/templates/**` - scaffold source of truth
- `.pi/**` - dogfooded Pi-native runtime layer
- `scripts/**` - dogfooded operational backends
- `tests/**` and `apps/cli/features/**` - regression and BDD coverage

## Command surface

```bash
# new repository
pi-harness my-app --init-json

# existing repository
pi-harness --mode existing . --init-json

# audit a repository
pi-harness doctor .
```

## Behavioral summary

- scaffolds a new project directory
- adopts an existing repository without clobbering user files by default
- emits `AGENTS.md`, `.pi/*`, `scripts/*`, Beads, deployment, and handoff files from one template source
- validates that a repository still matches the supported Pi-native clean-slate baseline

## Guardrails

- no registry-published distribution path is assumed
- no `.planning/` or `.sisyphus/` workspace is part of the supported scaffold surface
- no assistant-specific runtime surface is scaffolded in the current baseline
- legacy workflow leftovers are removed only through curated cleanup manifests
