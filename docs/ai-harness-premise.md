# ai-harness premise

`ai-harness` is a modular TypeScript CLI for bootstrapping and refreshing a local Codex workflow that is operated from Pi and backed by Beads plus Cognee.

## Core idea

The repo owns one scaffold and dogfoods it in place:

- `src/templates/**` is the scaffold source of truth
- `src/generators/**` maps those templates into managed output paths
- the repository root, `.codex/`, `.rules/`, `config/`, and `STICKYNOTE.example.md` are the dogfooded outputs of that scaffold
- `dist/` is the built runtime copy used by the local launcher and smoke checks

## What the scaffold is trying to provide

- a single Codex runtime surface under `.codex/`
- native Beads tracking with `bd`
- optional Cognee knowledge acceleration through local scripts
- preserve-by-default adoption of existing repositories
- repeatable local setup without a registry-published package

## What this baseline deliberately does not provide

- a second assistant runtime surface beside Codex
- a global OpenCode skill installer or managed OpenCode defaults
- a default `.planning/` workspace scaffold
- a separate OMO policy contract layered on top of the operator workflow

## Current scaffold surface

| Concern | Current baseline |
| --- | --- |
| Runtime docs and scripts | `.codex/**` |
| Workflow and policy docs | `.rules/**` |
| Backlog tracking | native `bd` with `.beads/**` |
| Knowledge brief | `./.codex/scripts/cognee-brief.sh` |
| Local handoff | `STICKYNOTE.example.md` |
| Deployment templates | `config/**`, `.kamal/**` |

## Operating principles

1. Keep one canonical runtime surface.
2. Prefer direct workflow docs over overlapping contracts.
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

That produces a local `ai-harness` command backed by this checkout.

## Implications for future work

The current baseline is intentionally small:

- Codex remains the only supported scaffold target
- Pi is the operating environment, not a fake second scaffold mode
- any future Pi-native additions should be introduced as real runtime surfaces, not compatibility labels with no implementation behind them
