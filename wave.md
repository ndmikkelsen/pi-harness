# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee attempted with `./scripts/cognee-brief.sh "rename /harness bootstrap command to /bake across the pi-harness scaffold"` and was unavailable, so local repo files and tests were used as the source of truth.

## Test Strategy
Hybrid. BDD led the user-visible scaffold rename, backed by targeted integration assertions and a typecheck pass. RED: update the BDD and integration expectations from `.pi/skills/harness` to `.pi/skills/bake` and confirm the old scaffold fails. GREEN: rename the setup skill surfaces, docs, generators, and doctor checks to `bake`. REFACTOR: add a doctor guard for stale `.pi/skills/harness/SKILL.md` so refreshed repos do not silently keep the old alias.

## Agents / Chains
Main session only. The change touched coordinated scaffold paths, docs, generators, and verification logic, so direct execution kept the rename consistent.

## Verification
- `pnpm test:bdd`
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/beads-wrapper.test.ts tests/integration/cli-doctor.test.ts tests/integration/doctor.test.ts`
- `pnpm typecheck`

## Risks
- Existing repos refreshed from older scaffold versions may still have `.pi/skills/harness/SKILL.md`; `pi-harness doctor` now flags that stale alias for cleanup.
- No active Beads issue was available in this repo state (`bd ready --json` returned `[]`).
