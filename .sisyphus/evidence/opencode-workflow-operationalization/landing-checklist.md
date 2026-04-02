# Landing Checklist: opencode-workflow-operationalization
# Feature branch: feat/workflow-orientation
# Target: merge to dev via PR
# Produced after Task 7 (Reconcile Beads State and Prepare Landing Sequence)
# PREREQUISITE: Tasks 1-8 complete and verified; Final Wave (F1-F4) complete and user-approved

## Phase 0: Prerequisite Verification (run before any landing action)

- [ ] Confirm Tasks 5, 6, 8 and Final Wave (F1-F4) are complete and verified
  Command: `ls .sisyphus/evidence/opencode-workflow-operationalization/task-5-*.txt .sisyphus/evidence/opencode-workflow-operationalization/task-5-*.json .sisyphus/evidence/opencode-workflow-operationalization/task-6-*.txt .sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md .sisyphus/evidence/f1-plan-compliance.txt .sisyphus/evidence/f2-code-quality.txt .sisyphus/evidence/f3-manual-qa.txt .sisyphus/evidence/f4-scope-fidelity.txt 2>/dev/null`
  Success: all task evidence files exist and are non-empty

- [ ] Confirm no unresolved blockers in Beads
  Command: `bd ready --json`
  Success: empty `[]` OR only low-priority backlog items remain

- [ ] Confirm feature branch is clean and tracks origin
  Command: `git status`
  Success: branch is feat/workflow-orientation, no uncommitted changes

## Phase 1: Quality Gates (must all pass before push)

- [ ] `pnpm typecheck` exits 0
  Command: `pnpm typecheck`
  Success: exit code 0, no TypeScript errors
  Note: no pre-existing evidence file; run fresh at landing time

- [ ] `pnpm test tests/integration/install-skill.test.ts` exits 0
  Evidence: .sisyphus/evidence/opencode-workflow-operationalization/task-4-install-skill-test.txt

- [ ] `pnpm test tests/integration/cli-install-skill.test.ts` exits 0
  Evidence: .sisyphus/evidence/opencode-workflow-operationalization/task-4-cli-install-skill-test.txt

- [ ] `pnpm test` exits 0
  Evidence: .sisyphus/evidence/opencode-workflow-operationalization/task-4-full-test.txt

- [ ] `pnpm build && pnpm test:smoke:dist` exits 0
  Evidence: .sisyphus/evidence/opencode-workflow-operationalization/task-4-build-smoke.txt

- [ ] Task 5 idempotency + non-clobber evidence exists and passes
  Evidence files (real, existing):
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-install-skill-run-1.txt
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-install-skill-run-2.txt
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-custom-key-comparison.txt
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-1-before.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-1-after.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-2-before.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-opencode-defaults-run-2-after.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-1-before.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-1-after.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-2-before.json
    - .sisyphus/evidence/opencode-workflow-operationalization/task-5-gsd-defaults-run-2-after.json
  Success: custom keys preserved (custom_key_preservation all true), managed keys refreshed (managed_key_refresh all true), second run idempotent (idempotency_checks all true)

- [ ] Task 6 edge-case coverage evidence exists and tests pass
  Evidence: .sisyphus/evidence/opencode-workflow-operationalization/task-6-edge-cases.txt
  Success: malformed JSON replacement and permission-denied coverage both pass in the targeted integration suite

## Phase 2: Beads State Finalization (after all Tasks 5-8 + F1-F4 are verified)

- [ ] Update ai-harness-ddi status to reflect completion
  Command: `bd update ai-harness-ddi --status resolved --json`
  Trigger: after all plan tasks and final wave are complete

- [ ] Close ai-harness-ddi with verified reason
  Command: `bd close ai-harness-ddi --reason "Verified: all plan tasks (1-8) + Final Wave (F1-F4) complete; operationalization landed" --json`

## Phase 3: Commit Remaining Uncommitted Work (if any)

- [ ] `git status` -- identify any remaining uncommitted evidence or doc files
- [ ] `git add .` -- stage all closeout artifacts
- [ ] `git commit -m "chore(landing): finalize opencode-workflow-operationalization closeout"` (or similar)

## Phase 4: Push Feature Branch

- [ ] `git push -u origin feat/workflow-orientation`
  Success: branch pushed to origin without rejection

## Phase 5: Open or Update PR to dev

- [ ] `gh pr view feat/workflow-orientation --json number,title,state 2>/dev/null` -- check if PR exists
- [ ] If PR does not exist: `gh pr create --base dev --head feat/workflow-orientation --title "feat(workflow): operationalize OpenCode workflow and landing" --body "$(cat <<'EOF'
## Summary
- Add deterministic evidence layout under .sisyphus/evidence/opencode-workflow-operationalization/
- Update operator runbook in README.md and docs/harness-usage.md to reflect current-state command chain
- Lock operational scope and guardrails in scope-lock.md
- Capture baseline validation transcripts (install-skill tests, full test suite, build+smoke)
- Prove idempotency and non-clobber behavior via temp-HOME two-run replay with custom-key preservation checks
- Final handoff note at .sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md
EOF
)"`
- [ ] If PR exists: `gh pr edit --base dev` (or refresh as needed)
  Success: PR state is open, target base is dev

## Phase 6: Handoff

- [ ] Verify PR URL is accessible
- [ ] Verify all evidence files are committed and pushed
  Command: `git log origin/feat/workflow-orientation --oneline -5`
- [ ] Confirm .planning/STATE.md next actions are up to date

## Success Criteria (all must be true)

1. Feature branch feat/workflow-orientation is pushed to origin
2. Pull request from feat/workflow-orientation to dev is open
3. All quality gates (typecheck, tests, build+smoke) have green evidence files
4. No unresolved Beads blockers (bd ready returns [] or low-priority-only)
5. All closeout artifacts committed and visible on origin
6. PR body references evidence paths and validation outcomes

## Notes

- Do NOT merge into main or push directly to main
- Do NOT close Beads issues before Final Wave approval
- If any quality gate fails, halt and remediate before continuing
- ./.codex/scripts/land.sh handles push + PR but Task 8 must produce the final-handoff.md first
