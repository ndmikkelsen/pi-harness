# Implementation Plan

## Work Item
untracked — tighten the Pi-native serving contract so publish flows always carry a real PR description/completed-work summary, emit a short post-serve branch summary, enforce a local-only but durable `STICKYNOTE.md` workflow across worktrees, and record a repo-level decision on curated knowledge-garden sync scope.

Acceptance criteria:
- `/serve` and plain-language serve intent follow the same prompt-native path and always produce a PR description that includes a completed-work summary.
- `scripts/serve.sh` always prints a short post-serve summary of branch changes after pushing/confirming the PR.
- `STICKYNOTE.md` stays gitignored and local-only, cannot be accidentally served while tracked or left as an untouched template, and updates made from a linked worktree flow back to the main worktree for future worktrees.
- The repo records a comparison against muninn and an explicit decision on whether curated Cognee sync should expand beyond the current Pi artifacts.

## Knowledge Inputs
- Active Beads issue: `untracked`. `bd ready --json` returned `[]`.
- Reused the latest Cognee brief already captured in `context.md`; it was attempted with `./scripts/cognee-brief.sh "serve workflow PR description completed work summary STICKYNOTE bootstrap worktree sync coverage"` and returned only generic guidance, so local repo files remained authoritative.
- Repo-local sources that shaped the plan: `context.md`, `.pi/prompts/serve.md`, `scripts/serve.sh`, `scripts/bootstrap-worktree.sh`, `scripts/sync-artifacts-to-cognee.sh`, `docs/bake-usage.md`, `src/commands/doctor.ts`, `tests/integration/serve-script.test.ts`, `tests/integration/bootstrap-worktree.test.ts`, `tests/integration/doctor.test.ts`, and `tests/integration/docs-alignment.test.ts`.
- Muninn comparison inputs: `/Users/naynay/Projects/bldx/muninn/.codex/scripts/land.sh`, `/Users/naynay/Projects/bldx/muninn/.codex/README.md`, `/Users/naynay/Projects/bldx/muninn/.claude/skills/land/SKILL.md`, `/Users/naynay/Projects/bldx/muninn/.claude/commands/land.md`, and `/Users/naynay/Projects/bldx/muninn/.gitignore`. Those files show stricter mandatory `STICKYNOTE.md` handoff discipline plus curated planning-sync intent, but the referenced `.claude/scripts` Cognee backend wrappers were not present in the inspected checkout, so the comparison is workflow-level rather than backend-runtime-level.

## Goal
Make serving and worktree handoff behavior explicitly publish-ready, locally durable, and knowledge-garden-aware without breaking the repo’s prompt-native `/serve` contract.

## Approach
Keep this work sequential in the main session; do **not** use a parallel wave because `scripts/serve.sh`, `scripts/bootstrap-worktree.sh`, prompt/template parity, and doctor alignment checks all overlap on the same publish contract. Start by locking failing integration expectations for serving, then implement the smallest script/prompt changes that guarantee an explicit PR body and post-serve summary. In the same serve contract, enforce `STICKYNOTE.md` at publish time as local-only, present, and filled in. Next, switch worktree bootstrapping from per-worktree copy semantics to a main-worktree-canonical `STICKYNOTE.md` handoff model for linked worktrees so edits flow back naturally. Finally, document the muninn comparison and keep curated Cognee sync intentionally narrow: borrow muninn’s mandatory handoff discipline, but do **not** upload `STICKYNOTE.md` or raw PR metadata automatically.

## Test Strategy
Hybrid, integration-led.
- Serve runtime RED: `pnpm test -- tests/integration/serve-script.test.ts`
- Worktree/STICKYNOTE RED: `pnpm test -- tests/integration/bootstrap-worktree.test.ts`
- Prompt/doctor parity follow-up: `pnpm test -- tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`
- Lead with integration tests because the current repo contract for serving and worktree bootstrap already lives in `tests/`, even though the feature has user-visible behavior.

## RED
1. Extend `tests/integration/serve-script.test.ts` so it fails unless serving:
   - creates or updates a PR with an explicit description/body instead of relying only on `gh pr create --fill`
   - includes a completed-work section in that body
   - prints a short post-serve branch summary to stdout
   - rejects a missing, tracked, or untouched-template `STICKYNOTE.md`
   Then run: `pnpm test -- tests/integration/serve-script.test.ts`
2. Extend `tests/integration/bootstrap-worktree.test.ts` so it fails unless linked worktrees inherit a main-worktree-canonical `STICKYNOTE.md` and later worktrees see prior local updates. Then run: `pnpm test -- tests/integration/bootstrap-worktree.test.ts`
3. After the runtime contract is clear, tighten `tests/integration/doctor.test.ts` and `tests/integration/docs-alignment.test.ts` so they fail unless serve prompt/template guidance mentions the required PR description/completed-work summary and the local-only `STICKYNOTE.md` contract. Then run: `pnpm test -- tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`

## GREEN
- Update `scripts/serve.sh` and `src/templates/pi/scripts/serve.sh` to build a short completed-work/branch-summary payload, pass that payload to `gh pr create` and `gh pr edit` explicitly, and print the same short summary after serving.
- Make serving fail fast when `STICKYNOTE.md` is tracked, missing, or still effectively the scaffold template.
- Update `.pi/prompts/serve.md` and `src/templates/pi/prompts/serve.md` so `/serve` and plain-language serve intent both gather the same PR-summary inputs before invoking the script.
- Update `scripts/bootstrap-worktree.sh` and `src/templates/pi/scripts/bootstrap-worktree.sh` so the main worktree owns the canonical local `STICKYNOTE.md`, linked worktrees point back to it, and first-run seeding still comes from `STICKYNOTE.example.md`.
- Record the knowledge-sync decision in docs: keep automatic Cognee sync limited to curated Pi artifacts and leave `scripts/sync-artifacts-to-cognee.sh` unchanged for this change.

## REFACTOR
- Extract any repeated shell logic for building the PR body, branch summary, and `STICKYNOTE.md` validation into small local helpers inside `scripts/serve.sh` if the GREEN step introduces duplication.
- Normalize dogfood/template parity immediately after each script or prompt change instead of leaving drift for a cleanup pass.
- Keep doctor checks focused on scaffold/runtime contract tokens, not per-session local state, so fresh clones are not forced to fail before a user has done any work.

## Tasks
1. Lock the serve RED surface in `tests/integration/serve-script.test.ts`.
   - Add failing expectations for explicit PR body creation/update, completed-work text, post-serve branch summary output, and `STICKYNOTE.md` gating.
   - Cover both “create PR” and “existing PR already open” paths.

2. Implement the serve contract in the runtime and prompt surfaces.
   - `scripts/serve.sh`
   - `src/templates/pi/scripts/serve.sh`
   - `.pi/prompts/serve.md`
   - `src/templates/pi/prompts/serve.md`
   Scope: generate/update a required PR description, emit a short branch-change summary, and keep `/serve` prompt-native for slash and plain-language serve intent.

3. Lock the worktree handoff RED surface in `tests/integration/bootstrap-worktree.test.ts`.
   - Add failing expectations for main-worktree `STICKYNOTE.md` seeding, linked-worktree backflow, and idempotent reruns.
   - Keep the local-only contract intact by asserting the behavior is bootstrap/runtime-only, not a tracked scaffold artifact.

4. Implement the shared local handoff behavior for `STICKYNOTE.md`.
   - `scripts/bootstrap-worktree.sh`
   - `src/templates/pi/scripts/bootstrap-worktree.sh`
   Scope: make the main worktree the canonical local note for linked worktrees while preserving first-run seeding from `STICKYNOTE.example.md` and current shared-link semantics for other local files.

5. Align doctor/parity coverage to the new serve and local-handoff contract.
   - `src/commands/doctor.ts`
   - `tests/integration/doctor.test.ts`
   - `tests/integration/docs-alignment.test.ts`
   Scope: require the prompt/template tokens that describe explicit PR summaries and `STICKYNOTE.md` expectations, but avoid turning session-local completeness into a global doctor failure.

6. Document the muninn comparison and knowledge-sync decision.
   - `docs/bake-usage.md`
   Decision to capture: borrow muninn’s mandatory handoff discipline, but do **not** expand automatic Cognee upload coverage to `STICKYNOTE.md`, raw PR bodies, or raw post-serve summaries in this change. If a future change wants more sync coverage, it should introduce a durable non-local artifact first.

## Dependencies
- Task 1 must happen before Task 2 so the serve contract is observed in a real RED phase.
- Task 3 must happen before Task 4 so the `STICKYNOTE.md` backflow behavior is locked before bootstrap changes.
- Task 2 should land before Task 5 so doctor/parity checks reflect the final serve wording and script contract.
- Task 6 depends on the outcome of Tasks 2 and 4 because the sync-policy decision should be documented against the final publish/handoff behavior, not an intermediate design.

## Verification
`pnpm test -- tests/integration/serve-script.test.ts tests/integration/bootstrap-worktree.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`

## Risks
- The biggest design choice is what counts as a “filled out” `STICKYNOTE.md`; byte-difference from `STICKYNOTE.example.md` may be too weak, but strict content parsing may be brittle. Favor a small, explicit heuristic tied to the current template fields.
- Switching from per-worktree copies to a shared main-worktree handoff note changes current expectations for isolated scratch notes across worktrees; callers should confirm that shared continuity is the intended tradeoff.
- `gh pr create`/`gh pr edit` body handling must work for both new and existing PRs, and tests need fixture coverage for newline-heavy bodies.
- The muninn comparison is informative but partial because its checked-in Cognee wrapper backend was absent from the inspected checkout; do not cargo-cult its missing backend plumbing.
- Keeping curated Cognee sync narrow avoids leaking local-only state, but it also means future knowledge-garden consumers will still rely on `context.md`/`plan.md`/`progress.md`/`review.md`/`wave.md` rather than raw serve output.
