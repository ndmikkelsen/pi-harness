# Code Context

## Work Item
untracked

Best-known acceptance criteria from the request:
1. `/serve` and plain-language serve intent should always include a PR description and a summary of completed work.
2. Serving should always emit a short post-serve branch summary.
3. `STICKYNOTE.md` should always be filled out, never committed, and should flow back to the main worktree so future worktrees inherit it.
4. Document the current knowledge-garden sync coverage and gaps.

## Knowledge Brief
Attempted `./scripts/cognee-brief.sh "serve workflow PR description completed work summary STICKYNOTE bootstrap worktree sync coverage"`.

It returned generic notes about `/serve`, `bootstrap-worktree.sh`, and `STICKYNOTE.md` seeding, but local repo files were still the authoritative source.

## Files Retrieved
- `.pi/prompts/serve.md:1-20`
- `scripts/serve.sh:1-134`
- `scripts/bootstrap-worktree.sh:15-133`
- `.beads/hooks/post-checkout:12-23`
- `scripts/hooks/post-checkout:1-10`
- `scripts/sync-artifacts-to-cognee.sh:1-36`
- `scripts/cognee-brief.sh:1-18`
- `scripts/cognee-bridge.sh:18-118`
- `README.md:44-59`
- `AGENTS.md:64-70`
- `STICKYNOTE.example.md:1-15`
- `STICKYNOTE.md:1-25`
- `.gitignore:17-30`
- `src/commands/doctor.ts:415-445, 571-600`
- `tests/integration/serve-script.test.ts:17-279`
- `tests/integration/bootstrap-worktree.test.ts:20-251`
- `tests/integration/init.test.ts:78-121`
- `tests/integration/doctor.test.ts:454-501, 617-643`
- `tests/integration/docs-alignment.test.ts:42-149, 205-218`
- `docs/bake-usage.md:91-104`
- `src/templates/pi/prompts/serve.md:1-20`
- `src/templates/pi/scripts/serve.sh:1-134`
- `src/templates/pi/scripts/bootstrap-worktree.sh:15-133`
- `src/templates/pi/scripts/sync-artifacts-to-cognee.sh:1-36`
- `src/templates/root/gitignore.md:17-30`
- `src/generators/project-docs.ts:4-11`

## Key Contracts
- `/serve` is intentionally prompt-native, not an extension command. `.pi/prompts/serve.md:6-19`, `AGENTS.md:66-70`, and `src/commands/doctor.ts:421-445` enforce that boundary.
- Plain-language publish requests are currently recognized only in docs/prompt guidance, not in executable code. `AGENTS.md:68` and `.pi/prompts/serve.md:11` mention the phrases; `.pi/extensions/repo-workflows.ts:37-61` has no `/serve` command at all.
- `scripts/serve.sh:61-134` runs verification, optional gitleaks, warns if `STICKYNOTE.md` is missing, syncs Cognee artifacts, pushes the branch, and creates a PR with `gh pr create --base dev --head "$branch" --fill`. It does not currently build a required PR body/summary, update an existing PR body, or print a branch summary beyond `git status` plus `Serve complete. PR to dev: ...`.
- `scripts/bootstrap-worktree.sh:57-93` links shared `.env*` and `.kamal/secrets*` files from the main worktree, but `STICKYNOTE.md` is only copied from `STICKYNOTE.example.md` when missing. There is no current main-worktree sync or shared-link behavior for `STICKYNOTE.md`.
- `.beads/hooks/post-checkout:12-23` and `scripts/hooks/post-checkout:4-10` make bootstrap run on checkout/worktree creation, so any STICKYNOTE backflow policy likely belongs in `scripts/bootstrap-worktree.sh`.
- `STICKYNOTE.example.md:1-15` defines the handoff shape. `src/generators/project-docs.ts:4-11` scaffolds only `STICKYNOTE.example.md`. `tests/integration/init.test.ts:82-87,109-121` and `tests/integration/scaffold-snapshots.test.ts:124-145` confirm `STICKYNOTE.md` is not scaffolded.
- `.gitignore:17` keeps `STICKYNOTE.md` untracked, and `tests/integration/doctor.test.ts:617-643` shows doctor only warns when that ignore rule is missing; there is no current completeness or “filled out” enforcement.
- Knowledge-garden coverage today is split:
  - `scripts/cognee-brief.sh:13-18` delegates to `scripts/cognee-bridge.sh brief`.
  - `scripts/cognee-bridge.sh:39-64` queries `pi-harness-knowledge` and `pi-harness-patterns` by default.
  - `docs/bake-usage.md:91-104` documents manual seeding of `docs/` + `README.md` into the knowledge dataset and `.pi/` into the patterns dataset.
  - `scripts/sync-artifacts-to-cognee.sh:7-36` auto-uploads only `context.md`, `plan.md`, `progress.md`, `review.md`, and `wave.md` to `pi-harness-artifacts` during serve.
  - No current automatic sync covers `STICKYNOTE.md`, PR descriptions, branch summaries, `scripts/`, or `tests/`.

## Test Surface
- `tests/integration/serve-script.test.ts:110-279` is the primary RED seam for the serve follow-ups. Current assertions only expect `gh pr create --fill`, artifact sync, and `Serve complete. PR to dev: ...`; there is no coverage yet for required PR body text, existing-PR updates, or a short post-serve branch summary.
- `tests/integration/docs-alignment.test.ts:42-149,205-218` is the prompt/template parity seam if `/serve` wording or plain-language serve guidance changes.
- `tests/integration/bootstrap-worktree.test.ts:20-251` is the primary STICKYNOTE/worktree seam. Current coverage proves seeding and idempotency, but not sharing/syncing `STICKYNOTE.md` back to the main worktree.
- `tests/integration/init.test.ts:78-121` protects the contract that only `STICKYNOTE.example.md` is scaffolded.
- `tests/integration/doctor.test.ts:454-501,617-643` covers `/serve` prompt-native enforcement, Cognee sync hook presence, and the `STICKYNOTE.md` ignore warning. It does not currently enforce PR-description requirements or STICKYNOTE completeness.
- Strategy looks **hybrid, integration-led**: user-visible serve workflow copy plus lower-level shell/worktree behavior. There is no obvious existing BDD feature file for serving; the narrow seams are integration tests in `tests/`.

## Constraints
- Keep `/serve` prompt-native; do not reintroduce an extension-backed `serve` command. `.pi/prompts/serve.md:9-19`, `src/commands/doctor.ts:421-445`.
- Only execution/autonomous lanes should actually publish. `AGENTS.md:66-70`.
- `scripts/serve.sh` must keep the protected-branch and base-`dev` behavior. `scripts/serve.sh:57-59,122-128`, `src/commands/doctor.ts:590-600`.
- Dogfood/template parity matters for any runtime/script/prompt change: root files and `src/templates/pi/**` are kept aligned by `tests/integration/docs-alignment.test.ts:42-149`.
- `STICKYNOTE.md` is already local-only in this repo: `.gitignore:17` ignores it, and `git ls-files --error-unmatch STICKYNOTE.md` currently fails. Any “flow back to main worktree” change needs to preserve that untracked-local contract.
- Current STICKYNOTE semantics are per-worktree copy, not shared state. Changing that may alter existing expectations about isolated local notes across worktrees.
- Cognee sync paths are intentionally optional and skip cleanly when unavailable. `scripts/cognee-bridge.sh:49,77,96,108` and `scripts/sync-artifacts-to-cognee.sh:10-17`.

## Start Here
1. `tests/integration/serve-script.test.ts` -> `scripts/serve.sh` -> `.pi/prompts/serve.md` and `src/templates/pi/prompts/serve.md`.
2. `tests/integration/bootstrap-worktree.test.ts` -> `scripts/bootstrap-worktree.sh` -> `.beads/hooks/post-checkout`.
3. If policy enforcement is desired, extend `tests/integration/doctor.test.ts` and `src/commands/doctor.ts` after the script/prompt contract is explicit.
4. For knowledge-garden coverage changes, inspect `scripts/sync-artifacts-to-cognee.sh`, `scripts/cognee-bridge.sh`, and `docs/bake-usage.md` together.

## Verification Clues
- Narrowest likely RED for serve follow-ups: `pnpm test -- tests/integration/serve-script.test.ts`
- Narrowest likely RED for STICKYNOTE worktree flow: `pnpm test -- tests/integration/bootstrap-worktree.test.ts`
- Narrowest likely RED for policy/docs enforcement after behavior is chosen: `pnpm test -- tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts`
- Narrowest caller-side verification path after implementation: rerun the targeted test above for the changed seam, then inspect `gh` invocation/output in the serve fixture and a fresh worktree bootstrap result for `STICKYNOTE.md` behavior.
