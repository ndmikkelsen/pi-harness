# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee attempted with `./scripts/cognee-brief.sh "Gemma 4 local install flow user-global settings models.json local launcher"` and fell back because no Cognee datasets were seeded. Repo evidence plus the local Pi `models.md` documentation were sufficient for this bounded change.

## Test Strategy
TDD.
- RED: focused unit and integration tests for the user-global local-installer path did not cover registering a compute-hosted Gemma 4 Ollama entry in `~/.pi/agent/models.json`.
- GREEN: add the minimal installer/model-config helpers needed to merge that entry without touching scaffolded repo files.
- REFACTOR: tighten the README/docs guidance and add a convenience script while keeping provider/model choice in Pi runtime.

## Decision Rationale
- The task was localized to the user-global local-installer/runtime-config surface.
- Direct mode fit once the Pi `models.json` schema was confirmed from local Pi docs.
- Delegation overhead was no longer worth it after the scoped evidence pass; the remaining work was a tight code-and-tests change.

## Routing Signals
- Hard triggers present: implementation request, structured verification required.
- Soft triggers present: code, tests, and user-facing docs all needed coordinated updates.
- Safe direct scope: `scripts/install-local-launcher.ts`, `src/local-launcher.ts`, `package.json`, focused tests, and matching docs/template updates.

## Agents / Chains
- None. Lead implemented the bounded user-global installer/runtime-config change directly.

## Delegation Units
- none

## Verification
- `pnpm test -- tests/unit/local-launcher.test.ts tests/integration/global-bake-install.test.ts`
- `pnpm build`

## Risks
- Existing-repo refresh can update many managed files at once.
- Cognee context was unavailable, so decisions rely on current repo evidence only.

