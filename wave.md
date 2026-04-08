# Execution Approach

## Mode
Direct

## Work Item
`pi-harness-edk` — Add a separate dev-to-main promotion workflow

Child tasks:
- `pi-harness-edk.2` — Lock RED coverage for dev-to-main promotion
- `pi-harness-edk.1` — Implement the promotion runtime and scaffold template
- `pi-harness-edk.3` — Align docs, doctor, and scaffold parity for promotion

## Knowledge
Cognee was attempted with `./scripts/cognee-brief.sh "dev to main promotion workflow release step ensure local changes land upstream dev main"`, but the brief was stale and still referenced legacy `land.sh` guidance. Local repository files, tests, and branch policy remained authoritative.

## Test Strategy
Hybrid, integration-led.
- RED: add `tests/integration/promote-script.test.ts` before runtime changes and confirm it fails because `scripts/promote.sh` does not exist yet.
- GREEN: add a dedicated `dev` -> `main` promotion script/prompt pair plus scaffold wiring and explicit PR-body refresh behavior.
- REFACTOR: align doctor, docs, init, and scaffold snapshot coverage so the new release-step contract stays stable without weakening `/serve`.

## Agents / Chains
Main session only. The work crossed one release contract spanning runtime docs, scaffold templates, doctor checks, and integration coverage, so parallel delegation would have increased overlap risk.

## Verification
Caller-side verification completed with:
- `pnpm typecheck`
- `pnpm test -- tests/integration/serve-script.test.ts tests/integration/promote-script.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts`

## Risks
- `scripts/promote.sh` intentionally opens or refreshes a PR to `main`; it never merges or pushes directly to `main`, so release completion still depends on the normal GitHub review/merge path.
- Promotion summaries are commit-driven, not `STICKYNOTE.md`-driven, so the release PR body is explicit but intentionally higher-level than feature-branch serve summaries.
- Existing plain-language publish intent still maps to `/serve`; callers should invoke `/promote` explicitly for the separate `dev` -> `main` release step.
