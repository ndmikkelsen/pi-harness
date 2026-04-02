# OpenCode Workflow Operationalization and Landing

## TL;DR
> **Summary**: Operationalize the already-implemented OpenCode worktree + repeatable global defaults workflow into a decision-complete execution runbook that is verifiable, non-clobber-safe, and ready for branch landing.
> **Deliverables**:
> - Decision-complete execution tasks for usage guidance, evidence capture, and landing workflow
> - Explicit acceptance criteria for idempotency, non-clobber guarantees, and failure handling
> - Final verification wave with parallel reviewers before completion
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 -> 2 -> 5 -> 8 -> F1-F4

## Context
### Original Request
Continue with clear next steps unless blocked by ambiguity.

### Interview Summary
- Prior implementation and validation are complete for: worktree integration, global managed defaults, merge-safe updates, docs/tests/build verification.
- Remaining value is operationalization: exact usage workflow, reproducible verification evidence, and disciplined landing/handoff.
- No new product feature scope is required unless explicitly requested.

### Metis Review (gaps addressed)
- Added guardrails to prevent scope creep into unrelated feature work.
- Added explicit acceptance criteria for idempotency, non-clobber preservation, malformed JSON behavior, and permission-denied behavior.
- Added evidence-path requirements so validation claims are reproducible.

## Work Objectives
### Core Objective
Produce and execute a deterministic closeout workflow that converts "implemented and tested" into "operationally ready, reproducible, and handoff-safe."

### Deliverables
- Operator usage instructions aligned to current scaffold and install behavior.
- Verification evidence bundle under `.sisyphus/evidence/` proving repeatability and safety.
- Landing checklist covering Beads status, commit strategy, branch push, and PR to `dev`.

### Definition of Done (verifiable conditions with commands)
- `pnpm test tests/integration/install-skill.test.ts` passes.
- `pnpm test tests/integration/cli-install-skill.test.ts` passes.
- `pnpm test` passes.
- `pnpm build && pnpm test:smoke:dist` passes.
- Temp-HOME two-run installer evidence confirms idempotency and non-clobber behavior with saved artifacts.

### Must Have
- No overwrite of unrelated keys in `~/.config/opencode/oh-my-opencode.json` or `~/.gsd/defaults.json`.
- Explicit handling and tests for malformed JSON and write-permission failures.
- Repository docs that match actual command surface and managed-file behavior.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No new model-routing redesign or unrelated CLI feature additions.
- No undocumented behavior claims without command-backed evidence.
- No manual-only QA steps; all checks must be agent-executable.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + existing Vitest integration/CLI suite.
- QA policy: Every task includes happy and failure/edge scenarios with evidence artifacts.
- Evidence root: `.sisyphus/evidence/opencode-workflow-operationalization/`.

## Execution Strategy
### Parallel Execution Waves
> Target: 3-5 tasks per wave for this bounded closeout.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: scope lock + evidence harness + baseline docs alignment
Wave 2: edge-case test hardening + behavior validation
Wave 3: landing prep + operator handoff package

### Dependency Matrix (full, all tasks)
- 1 blocks 2,3,4,5,6,7,8
- 2 blocks 5,6
- 3 blocks 7
- 4 blocks 8
- 5,6,7,8 block F1-F4

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 4 tasks -> writing, quick, unspecified-low
- Wave 2 -> 3 tasks -> quick, unspecified-high
- Wave 3 -> 1 task -> writing
- Final Verification -> 4 tasks -> oracle, unspecified-high, deep

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Freeze Operational Scope and Non-Goals

  **What to do**: Create a short scope-lock note in `.sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md` that states this phase only operationalizes usage, verification evidence, and landing; explicitly excludes unrelated feature work.
  **Must NOT do**: Do not add new CLI flags, model-routing behavior changes, or template redesign during this phase.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: precise scope language and guardrails
  - Skills: `[]` - no extra skill required
  - Omitted: `harness` - implementation scaffolding is not needed

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2,3,4,5,6,7,8 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.sisyphus/plans/opencode-workflow-operationalization.md` - canonical scope and guardrails for this closeout
  - Pattern: `README.md` - current documented command surface
  - Pattern: `AGENTS.md` - repo workflow and landing expectations

  **Acceptance Criteria** (agent-executable only):
  - [ ] `test -f .sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md` succeeds
  - [ ] `grep -q "Must NOT" .sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md` succeeds

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - scope lock created
    Tool: Bash
    Steps: mkdir -p .sisyphus/evidence/opencode-workflow-operationalization && test -f .sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md
    Expected: command exits 0 and file exists
    Evidence: .sisyphus/evidence/task-1-scope-lock.txt

  Scenario: Failure/edge case - scope lock misses exclusions
    Tool: Bash
    Steps: grep -q "Must NOT" .sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md
    Expected: exits 0; non-zero means task fails and must be rewritten
    Evidence: .sisyphus/evidence/task-1-scope-lock-error.txt
  ```

  **Commit**: YES | Message: `docs(workflow): lock operational scope and guardrails` | Files: `.sisyphus/evidence/opencode-workflow-operationalization/scope-lock.md`

- [x] 2. Publish Operator Usage Workflow (Current State)

  **What to do**: Update usage docs to include a single authoritative "current-state" runbook: install local launcher, install global skill, scaffold/adopt repo, doctor check, optional worktree plugin setup, day-to-day Beads + GSD loop.
  **Must NOT do**: Do not describe unsupported commands or speculative auth/model behavior.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: documentation consistency
  - Skills: `[]` - existing repo patterns are sufficient
  - Omitted: `obsidian-markdown` - not an Obsidian vault task

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5,6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `README.md` - quickstart and global install references
  - Pattern: `docs/harness-usage.md` - detailed command walkthroughs
  - Pattern: `.rules/patterns/operator-workflow.md` - canonical Beads + GSD loop
  - Pattern: `.opencode/worktree.jsonc` - optional worktree plugin path

  **Acceptance Criteria** (agent-executable only):
  - [ ] `grep -q "install-skill --assistant opencode" README.md` succeeds
  - [ ] `grep -q "kdco/worktree" README.md` succeeds
  - [ ] `grep -q "bd ready" docs/harness-usage.md` succeeds

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - runbook includes required command chain
    Tool: Bash
    Steps: grep -q "pnpm install" README.md && grep -q "pnpm build" README.md && grep -q "pnpm install:local" README.md && grep -q "ai-harness install-skill --assistant opencode" README.md
    Expected: all greps pass
    Evidence: .sisyphus/evidence/task-2-runbook.txt

  Scenario: Failure/edge case - docs drift from repo workflow
    Tool: Bash
    Steps: grep -q "feature -> dev -> main" AGENTS.md && grep -q "land.sh" docs/harness-usage.md
    Expected: both pass; if either fails, docs must be corrected
    Evidence: .sisyphus/evidence/task-2-runbook-error.txt
  ```

  **Commit**: YES | Message: `docs(workflow): codify current-state operator runbook` | Files: `README.md`, `docs/harness-usage.md`

- [x] 3. Define Verification Evidence Layout and Naming

  **What to do**: Create deterministic evidence directory structure and naming convention for this closeout (`task-{N}-{slug}.txt`, command transcripts, before/after JSON snapshots) under `.sisyphus/evidence/opencode-workflow-operationalization/`.
  **Must NOT do**: Do not place evidence outside `.sisyphus/evidence/`.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` - Reason: straightforward filesystem and naming setup
  - Skills: `[]` - no special library required
  - Omitted: `harness` - no scaffold generation needed

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 7 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.sisyphus/plans/opencode-workflow-operationalization.md` - expected evidence links in QA sections
  - Pattern: `.sisyphus/notepads/bootstrap-repeatable-oh-my-opencode-defaults/` - prior planning artifact style

  **Acceptance Criteria** (agent-executable only):
  - [ ] `test -d .sisyphus/evidence/opencode-workflow-operationalization` succeeds
  - [ ] `test -f .sisyphus/evidence/opencode-workflow-operationalization/README.md` succeeds

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - evidence tree present
    Tool: Bash
    Steps: test -d .sisyphus/evidence/opencode-workflow-operationalization && test -f .sisyphus/evidence/opencode-workflow-operationalization/README.md
    Expected: both checks pass
    Evidence: .sisyphus/evidence/task-3-evidence-layout.txt

  Scenario: Failure/edge case - missing naming rules
    Tool: Bash
    Steps: grep -q "task-{N}-{slug}" .sisyphus/evidence/opencode-workflow-operationalization/README.md
    Expected: grep passes; otherwise evidence protocol incomplete
    Evidence: .sisyphus/evidence/task-3-evidence-layout-error.txt
  ```

  **Commit**: YES | Message: `chore(verification): define deterministic evidence layout` | Files: `.sisyphus/evidence/opencode-workflow-operationalization/README.md`

- [x] 4. Capture Baseline Validation Transcripts

  **What to do**: Run baseline validation commands and store raw outputs in evidence files: targeted tests, full test suite, build+smoke.
  **Must NOT do**: Do not summarize-only; store raw command output artifacts.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: deterministic command execution and output capture
  - Skills: `[]` - standard repo commands only
  - Omitted: `writing` - this is execution evidence, not prose work

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 8 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `tests/integration/install-skill.test.ts` - targeted suite
  - Pattern: `tests/integration/cli-install-skill.test.ts` - targeted CLI suite
  - Pattern: `package.json` - script names (`test`, `build`, `test:smoke:dist`)

  **Acceptance Criteria** (agent-executable only):
  - [ ] `pnpm test tests/integration/install-skill.test.ts` exits 0
  - [ ] `pnpm test tests/integration/cli-install-skill.test.ts` exits 0
  - [ ] `pnpm test` exits 0
  - [ ] `pnpm build && pnpm test:smoke:dist` exits 0

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - baseline suite all green
    Tool: Bash
    Steps: run four validation command groups and redirect each stdout/stderr to .sisyphus/evidence/opencode-workflow-operationalization/
    Expected: all commands exit 0 and transcript files exist
    Evidence: .sisyphus/evidence/task-4-baseline-validation.txt

  Scenario: Failure/edge case - regression appears in one command
    Tool: Bash
    Steps: if any command exits non-zero, save failing output and halt downstream tasks
    Expected: failure transcript captured with command and exit code
    Evidence: .sisyphus/evidence/task-4-baseline-validation-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: evidence-only artifacts

- [x] 5. Prove Idempotency + Non-Clobber with Temp-HOME Replay

  **What to do**: Execute a two-run `install-skill` replay against a temp HOME with seeded custom keys in `oh-my-opencode.json` and `.gsd/defaults.json`; confirm managed keys refresh while unrelated keys persist exactly.
  **Must NOT do**: Do not run against real HOME when collecting destructive test evidence; use isolated temp directories only.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: multi-step correctness validation with strict assertions
  - Skills: `[]` - command orchestration only
  - Omitted: `harness` - no new scaffolding required

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: F1-F4 | Blocked By: 1,2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/commands/install-skill.ts` - install entry write/update flow
  - Pattern: `src/core/opencode-skill.ts` - merge behavior for managed JSON keys
  - Test: `tests/integration/install-skill.test.ts` - install behavior assertions

  **Acceptance Criteria** (agent-executable only):
  - [ ] First run writes managed files in temp HOME.
  - [ ] Second run reports unchanged or no meaningful diff for managed outputs.
  - [ ] Seeded unrelated keys remain byte-for-byte equivalent after second run.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - repeatable install without clobber
    Tool: Bash
    Steps: create temp HOME, seed custom keys, run ai-harness install-skill twice, diff before/after custom-key projections
    Expected: managed keys updated, custom keys preserved, second run idempotent
    Evidence: .sisyphus/evidence/task-5-idempotency-nonclobber.txt

  Scenario: Failure/edge case - custom keys lost
    Tool: Bash
    Steps: compare projected custom-key JSON snapshots before/after second run
    Expected: any mismatch fails task and blocks closeout
    Evidence: .sisyphus/evidence/task-5-idempotency-nonclobber-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: evidence-only artifacts

- [x] 6. Validate Malformed JSON and Permission-Denied Behaviors

  **What to do**: Add/adjust integration tests and expected outcomes for malformed JSON in managed files and write-permission denial on target config paths; ensure behavior is explicit and documented.
  **Must NOT do**: Do not silently ignore parse/write failures without deterministic error signaling.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: focused test+behavior hardening in limited files
  - Skills: `[]` - existing Vitest patterns sufficient
  - Omitted: `writing` - primary work is executable tests and assertions

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: F1-F4 | Blocked By: 1,2

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/integration/install-skill.test.ts` - integration style and fixtures
  - Test: `tests/integration/cli-install-skill.test.ts` - CLI result expectations
  - Pattern: `src/core/opencode-skill.ts` - merge/parse behavior surface
  - Pattern: `src/commands/install-skill.ts` - command-level error/result handling

  **Acceptance Criteria** (agent-executable only):
  - [ ] Malformed JSON case has a deterministic expected result verified by tests.
  - [ ] Permission-denied write case has deterministic error handling verified by tests.
  - [ ] `pnpm test tests/integration/install-skill.test.ts` exits 0 after updates.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - edge-case coverage added and green
    Tool: Bash
    Steps: run targeted integration tests covering malformed JSON and EACCES write failure
    Expected: all tests pass with explicit assertions
    Evidence: .sisyphus/evidence/task-6-edge-cases.txt

  Scenario: Failure/edge case - nondeterministic error behavior
    Tool: Bash
    Steps: run test filter for malformed/permission cases and inspect assertion outputs
    Expected: stable expected messages/codes; flaky or generic failures fail task
    Evidence: .sisyphus/evidence/task-6-edge-cases-error.txt
  ```

  **Commit**: YES | Message: `test(install-skill): cover malformed-json and permission failures` | Files: `tests/integration/install-skill.test.ts`, `tests/integration/cli-install-skill.test.ts`, optional minimal production files if required

- [x] 7. Reconcile Beads State and Prepare Landing Sequence

  **What to do**: Update active Beads issue statuses to reflect completed/remaining work, ensure discovered follow-ups are linked, and produce a deterministic landing checklist including required push + PR-to-dev steps.
  **Must NOT do**: Do not close parent issues before verification artifacts and checks are complete.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` - Reason: workflow-state reconciliation
  - Skills: `[]` - repo-native Beads workflow
  - Omitted: `harness` - unrelated to scaffold generation

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8, F1-F4 | Blocked By: 1,3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `AGENTS.md` - Beads workflow and landing protocol
  - Pattern: `.rules/patterns/operator-workflow.md` - canonical operator loop
  - Pattern: `.planning/STATE.md` - active phase context (if present)

  **Acceptance Criteria** (agent-executable only):
  - [ ] `bd ready --json` output captured in evidence.
  - [ ] Active issue updates/closures use `--json` and are captured.
  - [ ] Landing checklist file exists with ordered commands and success states.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - beads state aligned with work status
    Tool: Bash
    Steps: run bd ready/update/close commands (as applicable) with --json and save outputs
    Expected: issue states reflect reality and outputs are captured
    Evidence: .sisyphus/evidence/task-7-beads-landing.txt

  Scenario: Failure/edge case - unresolved blocker at closeout
    Tool: Bash
    Steps: if bd ready shows high-priority dependent blocker, create discovered-from follow-up and keep parent open
    Expected: no premature closure; blocker linkage exists
    Evidence: .sisyphus/evidence/task-7-beads-landing-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: issue state + evidence artifacts

- [x] 8. Produce Final Operator Handoff Packet

  **What to do**: Prepare final handoff note at `.sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md` summarizing what was implemented, how to use the workflow now, exact verification outcomes, and explicit next commands (`/start-work` for execution handoff if planning context is being used).
  **Must NOT do**: Do not leave ambiguous next steps or unresolved decisions unlisted.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: concise, decision-complete operational handoff
  - Skills: `[]` - no extra tooling required
  - Omitted: `obsidian-markdown` - handoff is repo-local markdown/text

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: F1-F4 | Blocked By: 1,4,7

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `README.md` - source of truth for user workflow commands
  - Pattern: `docs/harness-usage.md` - detailed operational flow
  - Pattern: `.sisyphus/evidence/opencode-workflow-operationalization/` - validation artifacts

  **Acceptance Criteria** (agent-executable only):
  - [ ] Handoff note includes "What changed", "How to use now", "Validation evidence", and "Next commands" sections.
  - [ ] `test -f .sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md` succeeds.
  - [ ] Every claim in handoff maps to either a file path or evidence artifact.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```bash
  Scenario: Happy path - handoff is actionable end-to-end
    Tool: Bash
    Steps: grep for required section headers and command snippets in .sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md
    Expected: all required sections/commands exist
    Evidence: .sisyphus/evidence/task-8-handoff.txt

  Scenario: Failure/edge case - unsupported claim detected
    Tool: Bash
    Steps: cross-check each handoff claim in .sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md against evidence files and fail on unmatched claim
    Expected: zero unmatched claims
    Evidence: .sisyphus/evidence/task-8-handoff-error.txt
  ```

  **Commit**: YES | Message: `docs(handoff): finalize operational next-step packet` | Files: `.sisyphus/evidence/opencode-workflow-operationalization/final-handoff.md`, updated docs/evidence index

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

  **QA Scenarios** (MANDATORY):
  ```bash
  Scenario: F1 happy path - plan compliance passes
    Tool: task (oracle)
    Steps: run oracle against .sisyphus/plans/opencode-workflow-operationalization.md and implementation evidence
    Expected: explicit pass/approve verdict with zero critical violations
    Evidence: .sisyphus/evidence/f1-plan-compliance.txt

  Scenario: F1 edge case - critical deviation detected
    Tool: task (oracle)
    Steps: capture oracle rejection output and map each issue to remediation tasks
    Expected: no completion until all critical deviations are resolved and re-approved
    Evidence: .sisyphus/evidence/f1-plan-compliance-error.txt

  Scenario: F2 happy path - quality review approves
    Tool: task (unspecified-high)
    Steps: review changed files and test outputs for maintainability/readability/regression risk
    Expected: approval with no unresolved high-severity concerns
    Evidence: .sisyphus/evidence/f2-code-quality.txt

  Scenario: F2 edge case - high-severity concern found
    Tool: task (unspecified-high)
    Steps: capture concern list, apply fixes, rerun review
    Expected: final approval required before completion
    Evidence: .sisyphus/evidence/f2-code-quality-error.txt

  Scenario: F3 happy path - executable QA verifies workflow
    Tool: Bash
    Steps: execute documented runbook commands in isolated temp environment and confirm expected outputs
    Expected: all runbook steps succeed exactly as documented
    Evidence: .sisyphus/evidence/f3-manual-qa.txt

  Scenario: F3 edge case - runbook command mismatch
    Tool: Bash
    Steps: record failing command/output and patch docs or implementation, then rerun full scenario
    Expected: no mismatches remain
    Evidence: .sisyphus/evidence/f3-manual-qa-error.txt

  Scenario: F4 happy path - scope fidelity confirmed
    Tool: task (deep)
    Steps: audit changed artifacts against scope lock and non-goals
    Expected: no out-of-scope work present
    Evidence: .sisyphus/evidence/f4-scope-fidelity.txt

  Scenario: F4 edge case - scope creep found
    Tool: task (deep)
    Steps: identify out-of-scope changes, remove or defer via follow-up issue, rerun audit
    Expected: final audit approval with no scope violations
    Evidence: .sisyphus/evidence/f4-scope-fidelity-error.txt
  ```

## Commit Strategy
- Commit 1: `docs(workflow): codify operator usage and evidence protocol`
- Commit 2: `test(install-skill): add edge-case safety coverage`
- Commit 3: `chore(verification): capture reproducible closeout evidence`
- Commit 4: `chore(landing): finalize beads state and PR handoff notes`

## Success Criteria
- Workflow usage is explicit and reproducible from docs alone.
- Managed global defaults are demonstrably repeatable and non-clobber-safe.
- Landing prerequisites are complete with no stranded local-only state.
