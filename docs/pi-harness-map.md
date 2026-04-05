# pi-harness map

`pi-harness` is a TypeScript CLI that bootstraps repositories for a Pi-operated Codex workflow with Beads and Cognee.

## Key surfaces

- `src/cli.ts` - command entrypoint
- `src/commands/init.ts` - scaffold/adoption command orchestration
- `src/commands/doctor.ts` - scaffold audit command
- `src/core/**` - reusable helpers and policies
- `src/generators/**` - managed output definitions
- `src/templates/**` - scaffold source of truth
- `.codex/**` - dogfooded Codex runtime layer
- `.rules/**` - dogfooded workflow and architecture rules
- `tests/**` and `apps/cli/features/**` - regression and BDD coverage

## Command surface

```bash
# new repository
pi-harness my-app --assistant codex --init-json

# existing repository
pi-harness --mode existing . --assistant codex --init-json

# audit a repository
pi-harness doctor . --assistant codex
```

## Behavioral summary

- scaffolds a new project directory
- adopts an existing repository without clobbering user files by default
- emits `.codex/`, `.rules/`, Beads, deployment, and handoff files from one template source
- validates that a repository still matches the supported Codex + Beads + Cognee clean-slate baseline

## Guardrails

- no registry-published distribution path is assumed
- no `.planning/` or `.sisyphus/` workspace is part of the supported scaffold surface
- no extra assistant compatibility layer is scaffolded in the current baseline
- legacy workflow leftovers such as planning workspaces and retired planning-sync scripts are removed only through curated cleanup manifests
