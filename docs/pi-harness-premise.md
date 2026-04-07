# pi-harness premise

`pi-harness` is a modular TypeScript CLI for bootstrapping and refreshing a local vanilla Pi workflow backed by Beads plus optional Cognee acceleration.

## Core idea

The repo owns one scaffold and dogfoods it in place:
- `src/templates/**` is the scaffold source of truth
- `src/generators/**` maps those templates into managed output paths
- the repository root, `.pi/`, `scripts/`, `.config/`, `.docker/`, and `STICKYNOTE.example.md` are the dogfooded outputs of that scaffold
- `dist/` is the built runtime copy used by the local launcher and smoke checks

## What the scaffold is trying to provide

- a Pi-native runtime surface under `.pi/`
- plain operational scripts under `scripts/`
- native Beads tracking with `bd`
- optional Cognee knowledge acceleration through local scripts
- preserve-by-default adoption of existing repositories
- repeatable local setup without a registry-published package

## What this baseline deliberately does not provide

- an assistant-specific runtime surface beside Pi
- a repo-scaffolded `.planning/` or `.sisyphus/` workspace
- a parallel legacy runtime authority beside `AGENTS.md`, `.pi/*`, and `scripts/*`

## Current scaffold surface

| Concern | Current baseline |
| --- | --- |
| Runtime instructions | `AGENTS.md`, `.pi/**` |
| Operational scripts | `scripts/**` |
| Backlog tracking | native `bd` with `.beads/**` |
| Knowledge brief | `./scripts/cognee-brief.sh` |
| Local handoff | `STICKYNOTE.example.md` |
| Deployment templates | `.config/**`, `.docker/**`, `.kamal/**` |

## Operating principles

1. Keep one canonical runtime surface.
2. Prefer direct Pi-native instructions over compatibility wrappers.
3. Preserve existing user files by default in adoption mode.
4. Use curated cleanup manifests for known legacy artifacts instead of broad heuristics.
5. Keep source templates, dogfooded outputs, and `dist/` aligned in the same change.

## Local-use distribution model

The supported setup remains:

```bash
pnpm install
pnpm build
pnpm install:local
```

That produces a local `pi-harness` command backed by this checkout.

## Implications for future work

The current baseline is intentionally small:
- Pi is the runtime and the scaffold identity.
- Providers and models are selected inside Pi runtime configuration.
- Future runtime additions should land as real `.pi/*` or `scripts/*` surfaces, not compatibility labels with no implementation behind them.
