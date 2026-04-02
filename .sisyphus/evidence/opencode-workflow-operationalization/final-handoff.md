# Final Operator Handoff Packet

## What changed

- Scope lock is documented and enforced in `.sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md`.
- Runbook docs are aligned to the current supported command chain, with concise commands in `README.md` and detailed walkthroughs in `docs/harness-usage.md`.
- Evidence layout is standardized with deterministic naming and flat structure rules in `.sisyphus/evidence/opencode-workflow-operationalization/README.md`.
- Baseline validation transcripts from Task 4 are captured in `.sisyphus/evidence/opencode-workflow-operationalization/task-4-install-skill-test.txt`, `.sisyphus/evidence/opencode-workflow-operationalization/task-4-cli-install-skill-test.txt`, `.sisyphus/evidence/opencode-workflow-operationalization/task-4-full-test.txt`, and `.sisyphus/evidence/opencode-workflow-operationalization/task-4-build-smoke.txt`.
- Idempotency and non-clobber behavior are proven with isolated temp-HOME replay artifacts: `.sisyphus/evidence/opencode-workflow-operationalization/task-5-replay-context.txt`, `.sisyphus/evidence/opencode-workflow-operationalization/task-5-install-skill-run-1.txt`, `.sisyphus/evidence/opencode-workflow-operationalization/task-5-install-skill-run-2.txt`, `.sisyphus/evidence/opencode-workflow-operationalization/task-5-custom-key-comparison.txt`, and paired snapshots under `.sisyphus/evidence/opencode-workflow-operationalization/task-5-*-before.json` plus `.sisyphus/evidence/opencode-workflow-operationalization/task-5-*-after.json`.
- Malformed JSON replacement and permission-denied failure behavior are covered by the expanded Task 6 integration run in `.sisyphus/evidence/opencode-workflow-operationalization/task-6-edge-cases.txt` (5 tests passed).
- Beads-state evidence and the corrected landing sequence checklist are captured in `.sisyphus/evidence/opencode-workflow-operationalization/task-7-beads-landing.txt` and `.sisyphus/evidence/opencode-workflow-operationalization/landing-checklist.md`.

## How to use now

- Follow the current-state command chain in `README.md`:
  - `pnpm install`
  - `pnpm build`
  - `pnpm install:local`
  - `ai-harness install-skill --assistant opencode`
  - `ai-harness my-app --assistant opencode --init-json` (new repo) or `ai-harness --mode existing . --assistant opencode --init-json` (existing repo)
  - `ai-harness doctor . --assistant opencode`
  - optional: `ocx add kdco/worktree --from https://registry.kdco.dev`
  - day-to-day: `bd ready --json` -> `bd update <id> --claim --json` -> `/gsd-next` -> phase commands when routed -> `bd close <id> --reason "Verified: <artifact or phase> passed" --json` -> `./.codex/scripts/land.sh`
- Use `docs/harness-usage.md` for the full operator walkthrough, including context-gathering expectations for existing repo adoption and preserve-by-default `createdPaths` customization rules.

## Validation evidence

- Scope and closeout boundary: `.sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md`.
- Evidence naming and layout protocol: `.sisyphus/evidence/opencode-workflow-operationalization/README.md`.
- Baseline quality gates from Task 4:
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-4-install-skill-test.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-4-cli-install-skill-test.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-4-full-test.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-4-build-smoke.txt`
- Temp-HOME idempotency and non-clobber proof from Task 5:
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-replay-context.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-install-skill-run-1.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-install-skill-run-2.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-custom-key-comparison.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-1-before.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-1-after.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-2-before.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-2-after.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-1-before.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-1-after.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-2-before.json`
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-2-after.json`
- Edge-case safety coverage from Task 6: `.sisyphus/evidence/opencode-workflow-operationalization/task-6-edge-cases.txt`.
- Beads state and landing readiness setup from Task 7:
  - `.sisyphus/evidence/opencode-workflow-operationalization/task-7-beads-landing.txt`
  - `.sisyphus/evidence/opencode-workflow-operationalization/landing-checklist.md`
- Final verification wave approvals:
  - `.sisyphus/evidence/f1-plan-compliance.txt`
  - `.sisyphus/evidence/f2-code-quality.txt`
  - `.sisyphus/evidence/f3-manual-qa.txt`
  - `.sisyphus/evidence/f4-scope-fidelity.txt`

## Next commands

1. Final verification wave is complete and approved; use `.sisyphus/evidence/f1-plan-compliance.txt`, `.sisyphus/evidence/f2-code-quality.txt`, `.sisyphus/evidence/f3-manual-qa.txt`, and `.sisyphus/evidence/f4-scope-fidelity.txt` as the approval record.
2. Execute landing checklist phases in order from `.sisyphus/evidence/opencode-workflow-operationalization/landing-checklist.md`:
   - Phase 0 prerequisite verification.
   - Phase 1 quality gates (`pnpm typecheck`, test and smoke checks).
   - Phase 2 Beads finalization (`bd update ai-harness-ddi --status resolved --json`, then `bd close ai-harness-ddi --reason "Verified: all plan tasks (1-8) + Final Wave (F1-F4) complete; operationalization landed" --json`).
   - Phase 3 commit remaining uncommitted closeout artifacts.
   - Phase 4 push `feat/workflow-orientation`.
   - Phase 5 open or update PR to `dev`.
   - Phase 6 handoff verification.
