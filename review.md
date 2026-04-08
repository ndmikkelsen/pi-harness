# Review

## Verdict
Pass

## Scope Reviewed
- Dedicated `dev` -> `main` promotion runtime and prompt
- Scaffold parity for the new promote surfaces
- Doctor and integration coverage for the serve-vs-promote workflow split

## Verification Reviewed
- `pnpm typecheck`
- `pnpm test -- tests/integration/serve-script.test.ts tests/integration/promote-script.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts`

## Risks / Notes
- Promotion remains a PR-management step only; it intentionally does not merge into `main`.
- The promotion PR body is based on commit summaries rather than `STICKYNOTE.md`, which is appropriate for an aggregate `dev` release but less narrative than feature-branch serve bodies.
- Callers must use `/promote` explicitly for the release step; plain-language publish intent is still reserved for `/serve` behavior.
