# Phase 2 Summary

## Outcome

Phase 2 completed the self-hosted rollout for `ai-harness`.

- the doctrine now makes Beads + GSD + Codex/OpenCode the explicit default foundation
- curated cleanup now covers the known deprecated workflow leftovers we explicitly support
- doctor distinguishes missing harness files, deprecated curated leftovers, root scaffold hints, and executable drift
- adoption coverage now includes clean, legacy, and mixed-state existing repositories
- the repository continues to dogfood the same scaffold it ships

## Completed Beads Work

- `ai-harness-3uw.1` - doctrine and cleanup contract
- `ai-harness-3uw.2` - curated cleanup manifest expansion
- `ai-harness-3uw.3` - adoption fixture matrix
- `ai-harness-3uw.4` - doctor deprecated-artifact guidance
- `ai-harness-3uw.5` - self-hosted and sample-repo dogfood validation

## Key Deliverables

- doctrine updates in `README.md`, `docs/ai-harness-premise.md`, and `.planning/PROJECT.md`
- cleanup manifest expansion in `src/core/cleanup-manifests.ts`
- deprecated-artifact doctor warnings in `src/commands/doctor.ts`
- mixed adoption coverage in `tests/integration/init.test.ts` and `tests/integration/cli-init.test.ts`

## Follow-On

Move to Phase 3 for distribution strategy, downstream versioning, migration guidance, and compatibility messaging.
