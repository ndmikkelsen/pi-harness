# Phase 2 Plan

## Execution Order

1. `ai-harness-3uw.1` - Lock the doctrine and cleanup contract.
2. `ai-harness-3uw.2` - Expand curated cleanup manifests from that doctrine.
3. `ai-harness-3uw.3` and `ai-harness-3uw.4` - Build adoption fixtures and doctor guidance in parallel once cleanup scope is explicit.
4. `ai-harness-3uw.5` - Validate the dogfood loop on this repo and sample repos, then close the phase epic.

## Validation Gates

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:smoke:dist`
- `pnpm exec tsx src/cli.ts doctor . --assistant codex`

## Discovery Rules

- If new conflicting AI workflow artifacts are discovered, create follow-up Beads issues linked from the active Phase 2 task.
- Do not expand cleanup heuristically; only add explicit curated entries backed by tests.
- Keep source templates, dogfooded repo files, and built `dist/` output aligned as work lands.
