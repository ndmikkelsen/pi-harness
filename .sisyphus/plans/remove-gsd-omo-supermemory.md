# Remove GSD, Adopt OMO + Supermemory

## TL;DR
> **Summary**: Remove GSD-specific runtime, scaffold, and documentation surfaces from `ai-harness`; enforce an OMO + OpenCode/Codex + Beads + Cognee workflow; add `opencode-supermemory` config + verification integration.
> **Deliverables**:
> - GSD-free runtime and install-skill behavior
> - GSD-free templates/docs/tests with OMO-first workflow language
> - Doctor and integration checks that fail on GSD drift
> - Supermemory integration guidance + verification coverage
> **Effort**: Large
> **Parallel**: YES - 4 waves
> **Critical Path**: 1 -> 2 -> 5 -> 8 -> 9 -> F1-F4

## Context
### Original Request
- Remove GSD from `ai-harness`.
- Workflow target: OMO + OpenCode/Codex with Beads and Cognee.
- Integrate `https://github.com/supermemoryai/opencode-supermemory` for OpenCode.

### Interview Summary
- Migration policy: hard-remove `/gsd-*` references (no alias/deprecation window).
- Scaffold policy: stop scaffolding `.planning/` by default.
- Supermemory policy: `install-skill` supports config + verification only; no secret writing.

### Metis Review (gaps addressed)
- Guardrail applied: preserve-by-default behavior for existing repositories; explicit migration path for cleanup.
- Guardrail applied: no workflow innovation beyond parity replacement and policy cleanup.
- Guardrail applied: treat residual-token sweeps and doctor drift checks as first-class acceptance criteria.
- Guardrail applied: supermemory secrets must remain env-driven (`SUPERMEMORY_API_KEY`) and never written by scaffold.

## Work Objectives
### Core Objective
Deliver a decision-complete migration that removes GSD dependencies from `ai-harness` while keeping a coherent OMO + Beads + Cognee operator workflow and adding reliable supermemory integration checks.

### Deliverables
- Updated CLI/runtime types and install flow with no `.gsd/defaults.json` dependency.
- Updated templates and generators without `.planning/` scaffold defaults or GSD command references.
- Updated repository and template docs describing OMO-first operational loops.
- Updated doctor checks and integration tests that detect GSD drift.
- Updated smoke/test evidence showing migration stability.

### Definition of Done (verifiable conditions with commands)
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm test:bdd` passes.
- `pnpm test:smoke:dist` passes.
- `pnpm exec tsx src/cli.ts doctor . --assistant opencode --json` returns no GSD-required artifact failures.
- Residual check across managed scaffold surfaces finds zero `/gsd-` commands in supported workflow docs/templates.

### Must Have
- No runtime flag/type path for `--gsd-root` or `.gsd/defaults.json` in install-skill.
- No default scaffold creation of `.planning/**`.
- OMO + Beads + Cognee flow documented in canonical docs/templates.
- Supermemory setup/validation documented and tested as config + verify only.
- Existing-repo adoption remains preserve-by-default unless explicit migration cleanup is selected.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No compatibility alias layer for `/gsd-*` commands.
- No automatic writing of `SUPERMEMORY_API_KEY` or secrets into config files.
- No unrelated refactors outside migration scope.
- No silent destructive cleanup of user-owned legacy files without explicit migration/cleanup path.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after using existing TypeScript + integration + BDD stack.
- QA policy: Every task includes happy-path and failure/edge-case agent-executed scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Runtime contract updates (CLI/options/types/install) + initial regression assertions.
Wave 2: Template/generator migration for workflow/rules/scaffold defaults.
Wave 3: Doctor/test/docs alignment + supermemory integration checks.
Wave 4: Dist refresh, smoke verification, residual drift sweeps, and evidence capture.

### Dependency Matrix (full, all tasks)
- 1 blocks 2, 3, 4.
- 2 blocks 5, 6.
- 3 blocks 7.
- 4 blocks 8.
- 5, 6, 7, 8 block 9.
- 9 blocks F1-F4.

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 3 tasks -> `quick`, `unspecified-high`
- Wave 2 -> 2 tasks -> `unspecified-high`, `writing`
- Wave 3 -> 3 tasks -> `unspecified-high`, `writing`
- Wave 4 -> 1 task -> `quick`
- Final Verification -> 4 tasks -> `oracle`, `unspecified-high`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Remove GSD runtime options and install-skill contracts

  **What to do**: Remove `--gsd-root` and `.gsd/defaults.json` paths from CLI/install runtime and update types/tests.
  **Must NOT do**: Do not remove unrelated managed outputs; do not write secrets.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: cross-file runtime contract updates
  - Skills: [`git-master`] — safe atomic commit and change audit
  - Omitted: [`frontend-ui-ux`] — not relevant

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/cli.ts`
  - API/Type: `src/core/types.ts`
  - Pattern: `src/commands/install-skill.ts`
  - Pattern: `src/core/opencode-skill.ts`
  - Test: `tests/integration/install-skill.test.ts`
  - Test: `tests/integration/cli-install-skill.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `pnpm exec tsx src/cli.ts install-skill --assistant opencode --help` has no `--gsd-root` option.
  - [ ] `pnpm typecheck` passes.
  - [ ] `pnpm test -- tests/integration/install-skill.test.ts tests/integration/cli-install-skill.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Contract removal verified
    Tool: Bash
    Steps: Run targeted install-skill/CLI integration tests
    Expected: Tests pass without `.gsd/defaults.json` expectations
    Evidence: .sisyphus/evidence/task-1-runtime-gsd-removal.txt

  Scenario: Legacy flag fails cleanly
    Tool: Bash
    Steps: Run install-skill with `--gsd-root`
    Expected: Unknown option + non-zero exit
    Evidence: .sisyphus/evidence/task-1-runtime-gsd-removal-error.txt
  ```

  **Commit**: YES | Message: `refactor(cli): remove gsd install-skill option surface` | Files: runtime + types + install tests

- [ ] 2. Replace managed autonomous workflow with OMO-first loop

  **What to do**: Rewrite managed global workflow to remove `/gsd-*` and define OMO + Beads + Cognee command flow.
  **Must NOT do**: Do not invent unsupported command set.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: canonical workflow text rewrite
  - Skills: [`harness`] — template consistency
  - Omitted: [`playwright`] — not needed

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/templates/opencode/get-shit-done/workflows/autonomous.md`
  - Pattern: `.rules/patterns/omo-agent-contract.md`
  - Pattern: `.rules/patterns/operator-workflow.md`
  - Test: `tests/integration/install-skill.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Workflow template has zero `/gsd-` references.
  - [ ] Install-skill tests assert OMO-first workflow text and pass.
  - [ ] `pnpm test -- tests/integration/install-skill.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Managed workflow refresh passes
    Tool: Bash
    Steps: Run install-skill workflow assertions
    Expected: New OMO loop validated
    Evidence: .sisyphus/evidence/task-2-managed-workflow.txt

  Scenario: Residual token scan
    Tool: Grep
    Steps: Search workflow file for `/gsd-`
    Expected: Zero matches
    Evidence: .sisyphus/evidence/task-2-managed-workflow-error.txt
  ```

  **Commit**: YES | Message: `docs(opencode): replace gsd autonomous workflow with omo loop` | Files: workflow template + tests

- [ ] 3. Remove `.planning/` from default scaffold generation

  **What to do**: Stop scaffolding `.planning/**` by default and update generator/tests/snapshots.
  **Must NOT do**: Do not delete pre-existing user `.planning/` during existing-mode default run.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: generator contract shift
  - Skills: [`git-master`] — snapshot/test sync
  - Omitted: [`frontend-ui-ux`] — not relevant

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 7 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/generators/root.ts`
  - Pattern: `src/generators/rules.ts`
  - Pattern: `src/templates/planning/**`
  - Test: `tests/integration/init.test.ts`
  - Test: `tests/integration/cli-init.test.ts`
  - Test: `tests/integration/scaffold-snapshots.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Default scaffold tests no longer expect `.planning/**`.
  - [ ] Existing-mode tests confirm preserve-by-default for existing `.planning/`.
  - [ ] `pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: New scaffold excludes `.planning/`
    Tool: Bash
    Steps: Run init + snapshot tests
    Expected: No default `.planning/` generated
    Evidence: .sisyphus/evidence/task-3-scaffold-planning-removal.txt

  Scenario: Existing repo preserve behavior
    Tool: Bash
    Steps: Run existing-mode fixture with preseeded `.planning/`
    Expected: Content preserved
    Evidence: .sisyphus/evidence/task-3-scaffold-planning-removal-error.txt
  ```

  **Commit**: YES | Message: `refactor(scaffold): stop default planning directory generation` | Files: generators + scaffold tests

- [ ] 4. Remove GSD-specific rules/templates and rewire canonical references

  **What to do**: Remove/replace `gsd-workflow` and `cognee-gsd-integration` rule templates and update indexes.
  **Must NOT do**: Do not leave dangling links in rule indexes/docs.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: policy doc migration
  - Skills: [`harness`] — scaffold doc parity
  - Omitted: [`playwright`] — not needed

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/templates/rules/patterns/gsd-workflow.md`
  - Pattern: `src/templates/rules/patterns/cognee-gsd-integration.md`
  - Pattern: `src/templates/rules/index.md`
  - Test: `tests/integration/docs-alignment.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Rules index has no required links to removed GSD docs.
  - [ ] `pnpm test -- tests/integration/docs-alignment.test.ts` passes.
  - [ ] No stale template references remain.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Rules alignment passes
    Tool: Bash
    Steps: Run docs-alignment tests
    Expected: No missing/stale rule reference failures
    Evidence: .sisyphus/evidence/task-4-rules-rewire.txt

  Scenario: Removed rule token scan
    Tool: Grep
    Steps: Search for removed rule filenames
    Expected: Zero unexpected hits
    Evidence: .sisyphus/evidence/task-4-rules-rewire-error.txt
  ```

  **Commit**: YES | Message: `docs(rules): remove gsd rule references and align omo policy` | Files: rules templates/index + tests

- [ ] 5. Update doctor drift checks for post-GSD policy

  **What to do**: Update doctor to enforce OMO-era managed artifacts and fail on stale GSD dependencies.
  **Must NOT do**: Do not regress OMO contract/handoff validations.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: validation logic and diagnostics
  - Skills: [`git-master`] — controlled refactor
  - Omitted: [`frontend-ui-ux`] — not relevant

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 9 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - API/Type: `src/commands/doctor.ts`
  - Test: `tests/integration/doctor.test.ts`
  - Pattern: `.rules/patterns/omo-agent-contract.md`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Doctor fails on injected stale GSD managed references.
  - [ ] Doctor passes on migrated policy set.
  - [ ] `pnpm test -- tests/integration/doctor.test.ts` passes.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Drift detection catches stale GSD
    Tool: Bash
    Steps: Run doctor drift fixture tests
    Expected: Deterministic failure with remediation hint
    Evidence: .sisyphus/evidence/task-5-doctor-gsd-drift.txt

  Scenario: Existing OMO checks still enforced
    Tool: Bash
    Steps: Run full doctor integration suite
    Expected: Contract/handoff checks remain active
    Evidence: .sisyphus/evidence/task-5-doctor-gsd-drift-error.txt
  ```

  **Commit**: YES | Message: `test(doctor): enforce post-gsd managed policy drift checks` | Files: doctor + doctor tests

- [ ] 6. Migrate repo/template operator docs to OMO + Beads + Cognee

  **What to do**: Update AGENTS/README/runbooks/templates to remove `/gsd-*` chains and keep one consistent replacement loop.
  **Must NOT do**: Do not leave contradictory instructions across root vs templates.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: high-surface doc consistency pass
  - Skills: [`harness`] — template/runtime alignment
  - Omitted: [`playwright`] — not needed

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `AGENTS.md`
  - Pattern: `README.md`
  - Pattern: `docs/harness-usage.md`
  - Pattern: `src/templates/codex/AGENTS.md`
  - Pattern: `src/templates/codex/README.md`
  - Pattern: `src/templates/root/README.md`
  - Test: `tests/integration/docs-alignment.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Core docs/templates contain no `/gsd-*` workflow instructions.
  - [ ] Docs-alignment and snapshot checks pass.
  - [ ] Workflow wording is consistent across root and templates.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Docs consistency regression passes
    Tool: Bash
    Steps: Run docs-alignment + snapshot tests
    Expected: No drift errors
    Evidence: .sisyphus/evidence/task-6-docs-operator-loop.txt

  Scenario: Residual `/gsd-` docs sweep
    Tool: Grep
    Steps: Search docs/template-doc surfaces for `/gsd-`
    Expected: Zero unexpected hits
    Evidence: .sisyphus/evidence/task-6-docs-operator-loop-error.txt
  ```

  **Commit**: YES | Message: `docs(workflow): migrate gsd command guidance to omo loop` | Files: root/template docs + related tests

- [ ] 7. Define explicit existing-repo migration path for legacy GSD artifacts

  **What to do**: Provide explicit cleanup/migration path for existing repos while default mode preserves legacy files.
  **Must NOT do**: Do not silently delete legacy files in default adoption mode.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: policy + cleanup behavior + tests
  - Skills: [`git-master`] — safe behavioral change sequencing
  - Omitted: [`frontend-ui-ux`] — not needed

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 9 | Blocked By: 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/cleanup/manifests/legacy-ai-frameworks-v1.json`
  - Test: `tests/unit/cleanup.test.ts`
  - Test: `tests/integration/cli-init.test.ts`
  - Test: `tests/integration/init.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Default existing-mode run preserves legacy GSD artifacts.
  - [ ] Explicit cleanup path removes only targeted artifacts.
  - [ ] Cleanup + existing-mode tests pass.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Preserve-by-default behavior
    Tool: Bash
    Steps: Run existing-mode fixture without cleanup flag
    Expected: Legacy files preserved
    Evidence: .sisyphus/evidence/task-7-existing-migration.txt

  Scenario: Explicit cleanup behavior
    Tool: Bash
    Steps: Run existing-mode fixture with cleanup manifest
    Expected: Only targeted legacy files removed
    Evidence: .sisyphus/evidence/task-7-existing-migration-error.txt
  ```

  **Commit**: YES | Message: `feat(migration): add explicit legacy gsd cleanup path` | Files: cleanup logic + tests + docs

- [ ] 8. Add supermemory config+verify integration in install-skill/docs/tests

  **What to do**: Add official supermemory setup/verify guidance, plugin config checks, and compatibility caveat messaging.
  **Must NOT do**: Do not auto-write API keys or auto-install external packages by default.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: install flow + docs + test updates
  - Skills: [`harness`] — managed asset consistency
  - Omitted: [`dev-browser`] — not needed

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 9 | Blocked By: 4, 6

  **References** (executor has NO interview context — be exhaustive):
  - External: `https://github.com/supermemoryai/opencode-supermemory`
  - External: `https://supermemory.ai/docs/integrations/opencode`
  - Pattern: `src/commands/install-skill.ts`
  - Pattern: `src/core/opencode-skill.ts`
  - Test: `tests/integration/install-skill.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Install-skill output includes supermemory setup + verification guidance.
  - [ ] Tests cover plugin registration expectation + missing-key guidance.
  - [ ] No path writes `SUPERMEMORY_API_KEY` into files.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Supermemory guidance validation
    Tool: Bash
    Steps: Run install-skill integration tests for guidance text
    Expected: Plugin + verify steps present
    Evidence: .sisyphus/evidence/task-8-supermemory-integration.txt

  Scenario: Missing-key error guidance
    Tool: Bash
    Steps: Run verification path with key unset
    Expected: Deterministic env-var guidance, no secret output
    Evidence: .sisyphus/evidence/task-8-supermemory-integration-error.txt
  ```

  **Commit**: YES | Message: `feat(opencode): add supermemory config and verification guidance` | Files: install/runtime docs + tests

- [ ] 9. Run full regression, residual drift sweeps, and refresh evidence

  **What to do**: Run all gates, residual scans, and produce fresh evidence artifacts.
  **Must NOT do**: Do not close with partial or stale verification artifacts.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: execution + artifact capture
  - Skills: [`git-master`] — final quality gate discipline
  - Omitted: [`frontend-ui-ux`] — not needed

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: F1-F4 | Blocked By: 5, 7, 8

  **References** (executor has NO interview context — be exhaustive):
  - Test: `pnpm typecheck`
  - Test: `pnpm test`
  - Test: `pnpm test:bdd`
  - Test: `pnpm test:smoke:dist`
  - Pattern: `.sisyphus/evidence/`

  **Acceptance Criteria** (agent-executable only):
  - [ ] All gates pass and outputs are recorded under `.sisyphus/evidence/`.
  - [ ] Residual `/gsd-` scan returns zero unexpected hits.
  - [ ] Doctor JSON output has no GSD-required artifact failures.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Full regression pass
    Tool: Bash
    Steps: Run typecheck/test/bdd/dist-smoke and capture logs
    Expected: All exit 0
    Evidence: .sisyphus/evidence/task-9-full-verification.txt

  Scenario: Final GSD drift scan
    Tool: Grep
    Steps: Scan managed surfaces for `/gsd-` and stale gsd defaults mentions
    Expected: Zero unexpected results
    Evidence: .sisyphus/evidence/task-9-full-verification-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: evidence artifacts only

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit per completed task (or tightly coupled task pair), preserving green tests at each boundary.
- Conventional commit style required (`refactor:`, `docs:`, `test:`, `chore:`).
- Avoid mixing runtime/template/docs changes in one commit unless they are inseparable for passing tests.

## Success Criteria
- All GSD runtime/scaffold/doc/test dependencies are removed or replaced with OMO-first equivalents.
- Existing-repo behavior is deterministic: preserve by default, explicit migration path for cleanup.
- Supermemory integration is documented, validated, and does not require secret file writes.
- Full quality gate suite passes with refreshed evidence artifacts.
