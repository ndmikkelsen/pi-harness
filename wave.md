# Execution Approach

## Mode
Parallel recon -> Direct implementation

## Work Item
Epic `pi-harness-lz2` with child tasks `pi-harness-lz2.1`, `pi-harness-lz2.2`, and `pi-harness-lz2.3`

## Knowledge
- Cognee was attempted for both planning lanes and was unavailable.
- Parallel pi-subagents were used for explore/plan/review recon across the three issue slices.
- Local repository evidence was sufficient to complete the cleanup and verification work directly.

## Test Strategy
TDD/BDD hybrid.
- Source-graph cleanup and cleanup-boundary work used narrow regression tests first.
- CLI workflow wording was kept aligned through the existing BDD lane.

## Agents / Chains
- Parallel subagents for recon on issues `pi-harness-lz2.1`, `.2`, and `.3`
- Main session for the coupled source cleanup, test updates, and verification sweep

## Verification
- `pnpm test -- tests/unit/scaffold-source-graph.test.ts tests/unit/cleanup.test.ts tests/integration/doctor.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/cli-doctor.test.ts tests/integration/beads-wrapper.test.ts tests/integration/cli-init.test.ts tests/integration/land-script.test.ts`
- `pnpm test:bdd`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:smoke:dist`

## Risks
- Legacy cleanup support must remain explicit so future cleanup does not remove adoption-only safeguards.
- The broad source-template cleanup was coupled enough that direct main-session implementation was safer than parallel editing in the current dirty tree.
