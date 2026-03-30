# Phase 3 Context

## Goal

Finish CORE-06 by locking `ai-harness` to a local-use, non-registry distribution model, telling downstream repos how to understand scaffold versions, and showing how older `scaiff`-era users migrate cleanly.

## Beads Epic

- `ai-harness-b42` - Phase 3: distribution and migration readiness

## Phase Status

- Active after Phase 2 closeout

## Current Decision Track

- `ai-harness-b42.1` closed with a local-use decision: `ai-harness` is used on local developer machines and has no package-manager publication track.
- `ai-harness-b42.2` is now defining the downstream versioning and upgrade story that keeps long-lived local adoption safe.

## Child Work

- `ai-harness-b42.1` - Decide the ai-harness distribution model
- `ai-harness-b42.2` - Define downstream versioning and upgrade guidance
- `ai-harness-b42.3` - Document scaiff compatibility and alias strategy
- `ai-harness-b42.4` - Document install and update guidance for downstream repos

## Done Means

- Distribution direction is explicit.
- Versioning and upgrade guidance tells downstream repos how to reason about harness changes.
- Compatibility messaging for older scaiff references is settled.
- Install and update docs are ready to ship.
