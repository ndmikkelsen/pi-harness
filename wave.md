# Execution Approach

## Mode
Direct

## Work Item
pi-harness-cw9

## Knowledge
- `bd ready --json` returned `[]`, so the feature work was created in Beads and claimed as `pi-harness-cw9`.
- Cognee was attempted with `./scripts/cognee-brief.sh "Pi-native /bake or /skill:bake auto-detect new vs existing repo, scaffold greenfield repos, refresh existing repos, remove old AI scaffolding so only pi-harness scaffolding remains"`.
- Cognee datasets were unavailable (`DatasetNotFoundError`), so repository files and tests remained authoritative.

## Test Strategy
Hybrid, integration-led RED -> GREEN -> REFACTOR.
- RED: add failing coverage for cleanup auto-confirm, generated native `/bake` surfaces, and docs alignment.
- GREEN: implement cleanup confirmation support, native `/bake` extension/script defaults, and aligned docs/templates.
- REFACTOR: keep dogfood + template surfaces aligned and rerun targeted verification plus smoke/build coverage.

## Agents / Chains
Main session only. The work touched tightly coupled runtime, template, docs, and test surfaces.

## Verification
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- `pnpm test:smoke:dist`

## Risks
- Native existing-repo `/bake` is intentionally more aggressive than conservative fallback adoption, so `/adopt` remains as the preserve-existing path.
- Cleanup auto-confirm is explicitly scoped to curated manifest entries; unexpected non-curated leftovers still require follow-up review.
