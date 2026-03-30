# Phase 2 Context

## Goal

Finish CORE-05 by making this repository the golden reference for the ai-harness foundation: Beads, GSD, Codex, and OpenCode working together through one opinionated scaffold.

## Active Beads Epic

- `ai-harness-3uw` - Phase 2: self-hosted harness rollout

## Requirement Mapping

- `CORE-04` - Global `harness` skill install - Done
- `CORE-05` - Self-hosted scaffold adoption - In progress

## Product Stance For This Phase

- `src/templates/**` is the source of truth for generated scaffold content.
- This repository dogfoods the scaffold and should behave like the reference implementation.
- Existing repositories keep user-owned files by default.
- Known non-harness AI workflow droppings are removed only through curated cleanup manifests.
- Doctor guidance should distinguish missing harness files, deprecated known leftovers, and preserved user-owned files.

## Child Work

- `ai-harness-3uw.1` - Codify ai-harness doctrine and cleanup contract
- `ai-harness-3uw.2` - Expand curated cleanup manifests for legacy AI workflow droppings
- `ai-harness-3uw.3` - Build adoption fixture matrix for mixed repository states
- `ai-harness-3uw.4` - Teach doctor to flag deprecated AI workflow artifacts
- `ai-harness-3uw.5` - Validate the dogfood loop on self-hosted and sample repos

## Done Means

- The doctrine is explicit enough to guide cleanup and doctor behavior.
- Existing-repo adoption safely removes known conflicting AI workflow artifacts when requested.
- Tests cover clean, legacy, and mixed-repo adoption states.
- `ai-harness doctor` explains deprecated known artifacts without broad heuristic deletion.
- The self-hosted repo and sample repos validate cleanly, with follow-up gaps captured as Beads issues.
