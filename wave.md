# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
`bd ready --json` returned no ready issues. Cognee was attempted with `./scripts/cognee-brief.sh "serve workflow PR description completed work summary STICKYNOTE bootstrap worktree sync coverage"`; the result was generic, so local repo files remained the source of truth.

## Test Strategy
Hybrid, integration-led.
- RED for serve behavior: tighten `tests/integration/serve-script.test.ts` around PR body/summary and post-serve output.
- RED for STICKYNOTE flow: tighten `tests/integration/bootstrap-worktree.test.ts` around shared/main-worktree handoff behavior.
- REFACTOR safety net: use `tests/integration/doctor.test.ts` and `tests/integration/docs-alignment.test.ts` only after the runtime contract is explicit.

## Agents / Chains
Main session only. The task was scoped repo recon across prompt, script, worktree, doctor, and Cognee seams; no parallel wave needed.

## Verification
Likely caller-side RED commands:
- `pnpm test -- tests/integration/serve-script.test.ts`
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts`
- optional contract/parity follow-up: `pnpm test -- tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`

## Risks
- `/serve` is deliberately prompt-native, so plain-language serve intent is documented today but not executable outside prompt/lane behavior.
- `scripts/serve.sh` currently relies on `gh pr create --fill`; requiring a guaranteed PR description/summary likely needs explicit body generation and probably an existing-PR update path too.
- `STICKYNOTE.md` is local-only and ignored today; making it “flow back” to future worktrees requires a decision between shared symlink behavior and copy/sync behavior.
- Current automatic Cognee sync only covers Pi artifacts (`context.md`, `plan.md`, `progress.md`, `review.md`, `wave.md`), not `STICKYNOTE.md` or PR metadata.
