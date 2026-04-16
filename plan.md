# Implementation Plan

## Work Item
`untracked` — fix existing-repo bake refresh so `.env.example` does not duplicate scaffold entries that are already present.

## Knowledge Inputs
- Beads unavailable for this slice (`bd ready --json` returned `[]`)
- Cognee skipped; targeted repository evidence was sufficient
- `context.md`
- user-provided duplicate `.env.example` example

## Goal
Keep existing-repo merge mode additive without duplicating already-defined env keys, while still appending genuinely missing scaffold variables.

## Test Strategy
Hybrid, with a real RED -> GREEN -> REFACTOR loop.

## RED
Tighten focused regression coverage so merge-mode tests fail when:
- an existing `.env.example` already has `APP_ENV` and `LLM_API_KEY`
- merge mode re-adds those keys from the scaffold block
- merge mode omits newer scaffold keys like `GITHUB_PERSONAL_ACCESS_TOKEN`

Commands:
- `pnpm test -- tests/integration/cli-init.test.ts tests/integration/init.test.ts`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`

## GREEN
Implement the smallest change in:
- `src/generators/root.ts`
- `src/templates/root/env.example-append.md`

by:
- extracting env keys from existing and generated lines
- appending only missing keys under the scaffold marker
- keeping the append template aligned with the full scaffold env contract

## REFACTOR
- keep merge logic local to root generation
- preserve comments and existing file order outside the appended scaffold block
- keep tests semantic by asserting key counts rather than entire file snapshots

## Delegation Units

### Delegation Unit: env-example-merge-fix
- Owner: main session
- Goal: prevent duplicate scaffold env keys during existing-repo merge mode
- Allowed Files:
  - `src/generators/root.ts`
  - `src/templates/root/env.example-append.md`
  - `tests/integration/cli-init.test.ts`
  - `tests/integration/init.test.ts`
  - `apps/cli/features/adoption/adoption.feature`
  - `apps/cli/features/adoption/adoption.spec.ts`
  - `apps/cli/features/steps/adoption.steps.ts`
- Non-Goals:
  - no unrelated bake workflow changes
  - no provider/model config changes
  - no doctor-policy expansion
- Inputs:
  - `context.md`
  - `wave.md`
  - current `.env.example` templates and merge code
- Output:
  - code + tests + `progress.md`
- RED:
  - the focused integration and BDD commands above
- GREEN Target:
  - passing merge behavior with unique env keys only
- Caller Verification:
  - `pnpm test -- tests/integration/cli-init.test.ts tests/integration/init.test.ts`
  - `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
  - `pnpm typecheck`
- Escalate If:
  - the fix requires rewriting merge behavior across other root files
  - key-based parsing proves too weak for the supported env syntax

## Requested Follow-up
none

## Risks
- skipping updates when the scaffold marker already exists means older merged files still keep their prior merged block unless a separate migration path is added
- simplistic key parsing assumes one env assignment per line
