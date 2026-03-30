# AI Harness

## What This Is

AI Harness is a TypeScript CLI that bootstraps new and existing repositories with an opinionated Beads + GSD + Codex/OpenCode foundation, plus optional Cognee plumbing.

## Core Value

Give a repository a safe, repeatable AI development scaffold without clobbering existing files, while keeping one canonical workflow across local CLI use and the global `harness` skill. Existing repositories should keep user-owned files by default and remove known non-harness AI workflow droppings only through curated cleanup manifests.

## Constraints

- Technical: preserve existing files by default, keep generators modular and testable, and keep source templates aligned with built `dist/` output.
- Product: support both greenfield setup and existing-repo adoption, keep `harness` simple to invoke from OpenCode, maintain one shared Codex/OpenCode runtime surface, and keep the default foundation opinionated around Beads, GSD, Codex, and OpenCode.
- Timeline: current work is focused on self-hosting the scaffold in this repository and hardening rename/install flows around the local-use model.

## Doctrine

- Install the Beads + GSD + Codex/OpenCode foundation by default, with Cognee kept optional.
- Preserve user-owned files in existing repositories unless a narrow merge or force path is explicitly selected.
- Remove known non-harness AI workflow droppings only through curated cleanup manifests.
- Treat `src/templates/**` as the canonical scaffold source and this repository as the dogfooded reference implementation.
- Treat `ai-harness` as a local-use tool on developer machines: `dist/` powers the launcher and installed skill flow, not a registry or package release channel.

## Validated Requirements

- `CORE-06` - validated in Phase 3: downstream repos now record their `ai-harness` scaffold baseline, the supported local refresh path is explicit, and `scaiff` remains migration-only history with no shipped alias.

## Current State

- v1.0 is complete: Phases 1-3 delivered the preserve-by-default scaffold engine, self-hosted harness rollout, and local-use distribution readiness.

## Open Questions

- How much of the local refresh flow should be automated without weakening preserve-by-default review?
- How much of the generated runtime should stay Codex-compatible under `.codex/` versus move to more OpenCode-native surfaces later?

## Notes

- This repository is both the source of the scaffold and a live example of the scaffold applied to itself.
- `src/templates/**` remains the canonical source of truth; dogfooded files in this repo must track that source rather than drift from it.
- Primary context lives in `README.md`, `docs/ai-harness-premise.md`, `docs/ai-harness-map.md`, and `docs/architecture.md`.
