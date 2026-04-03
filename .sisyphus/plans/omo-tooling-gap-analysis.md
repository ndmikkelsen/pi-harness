# OMO Tooling Alignment Gap Analysis and Remediation Roadmap

## TL;DR
> **Summary**: Audit and harden ai-harness so OMO agent behavior is contract-driven, non-conflicting, and verifiable across Beads, GSD, Cognee, OpenCode worktree, and landing flows.
> **Deliverables**:
> - Canonical OMO agent-to-tool contract in `.rules/`
> - Deduplicated authority model across `.rules`, `.codex`, `AGENTS.md`, and managed OpenCode assets
> - Explicit hook/bootstrap seam contract for Beads + worktree coexistence
> - Runtime verification expansion for GSD/Cognee policy behavior and drift detection
> **Effort**: Large
> **Parallel**: YES - 4 waves
> **Critical Path**: 1 -> 2 -> 5 -> 8 -> 11 -> F1-F4

## Context
### Original Request
Perform a gap analysis on this repository to ensure OMO works fluently with Beads, GSD, Cognee, OpenCode worktree, and related tools, with agent-role alignment that prevents clashes.

### Interview Summary
- Output optimized for audit + fix roadmap (not report-only).
- Canonical source-of-truth selected as `.rules/`.
- Cognee selected as required broadly for OMO workflows.

### Metis Review (gaps addressed)
- Add a single normative contract source and reduce all other doctrine to adapter/reference text.
- Define explicit seam behavior for `.beads/hooks/post-checkout` and `.codex/scripts/bootstrap-worktree.sh`.
- Add executable drift/policy verification so contracts fail fast when docs/scripts diverge.
- Lock landing authority and handoff ownership to avoid dual control paths.

## Work Objectives
### Core Objective
Produce a decision-complete, executable remediation plan that removes OMO/tooling authority ambiguity and validates behavioral alignment through automated checks.

### Deliverables
- OMO contract specification and precedence hierarchy.
- Canonicalized authority/handoff model for planning, execution, verification, and landing.
- Cognee-required policy definition with explicit failure/degradation semantics.
- Worktree/Beads seam ownership contract and idempotency guarantees.
- Verification suite additions for runtime behavior and doctrine drift.

### Definition of Done (verifiable conditions with commands)
- `pnpm test -- tests/integration/install-skill.test.ts` passes with contract-linked global asset expectations.
- `pnpm test -- tests/integration/bootstrap-worktree.test.ts` passes with documented coexistence behavior.
- `pnpm test -- tests/integration/land-script.test.ts` passes with landing authority contract checks.
- `pnpm test -- tests/integration/doctor.test.ts` passes with new policy/drift checks.
- `pnpm test` and `pnpm test:bdd` pass after contract and test updates.

### Must Have
- One canonical OMO contract in `.rules/patterns/`.
- Explicit agent-lane authority matrix (planning, research, execution, review, landing).
- Zero duplicated normative rules across adapter docs.
- Concrete command-based acceptance criteria and evidence paths per task.
- No ambiguity about Beads/GSD/Cognee/worktree precedence.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No new parallel planning systems outside `.planning/` + `.rules/` canon.
- No speculative model-routing redesign unrelated to alignment gaps.
- No manual-only acceptance criteria.
- No vague criteria like "looks aligned".
- No undocumented lane-level exceptions for Cognee behavior.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after + existing `vitest` integration/unit + BDD lane.
- QA policy: Every task includes happy and failure/edge scenarios with concrete steps.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Contract foundation and inventory baselines (tasks 1-4)
Wave 2: Doctrine normalization and seam hardening (tasks 5-8)
Wave 3: Verification expansion and policy enforcement (tasks 9-12)
Wave 4: End-to-end audit synthesis and release-safe adoption steps (tasks 13-15)

### Dependency Matrix (full, all tasks)
- 1 blocks 2,5,6,9
- 2 blocks 3,7,10
- 3 blocks 11
- 4 blocks 8
- 5 blocks 12
- 6 blocks 10,13
- 7 blocks 13
- 8 blocks 14
- 9 blocks 12
- 10 blocks 14
- 11 blocks 15
- 12 blocks 15
- 13 blocks 15
- 14 blocks 15
- 15 blocks F1-F4

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 4 tasks -> deep, writing, unspecified-high
- Wave 2 -> 4 tasks -> unspecified-high, writing, quick
- Wave 3 -> 4 tasks -> unspecified-high, deep, quick
- Wave 4 -> 3 tasks -> deep, writing, unspecified-high

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

<!-- TASKS INSERTED IN BATCHES BEFORE FINAL VERIFICATION WAVE -->

- [x] 1. Establish Canonical OMO Contract Source

  **What to do**: Add `src/templates/rules/patterns/omo-agent-contract.md` and dogfood mirror `.rules/patterns/omo-agent-contract.md` defining authority hierarchy, tool precedence, allowed tool families by agent/lane, handoff obligations, and explicit prohibition on duplicate normative ownership.
  **Must NOT do**: Do not redefine existing functional workflows; only codify ownership/precedence contracts.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: contract-heavy, policy-precision markdown work
  - Skills: `[]` — no special skill required
  - Omitted: `git-master` — not needed for non-git planning execution task

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2,5,6,9 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.rules/index.md` — canonical rules authority pattern
  - Pattern: `.rules/patterns/operator-workflow.md` — workflow doctrine style
  - Pattern: `.rules/patterns/cognee-gsd-integration.md` — Cognee policy baseline
  - Pattern: `AGENTS.md` — runtime and landing constraints
  - Pattern: `src/templates/rules/patterns/operator-workflow.md` — scaffold source alignment

  **Acceptance Criteria** (agent-executable only):
  - [ ] `src/templates/rules/patterns/omo-agent-contract.md` exists and defines hierarchy + lane matrix
  - [ ] `.rules/patterns/omo-agent-contract.md` mirrors contract semantics for dogfood repo
  - [ ] `grep -n "source of truth\|authority hierarchy\|tool precedence" src/templates/rules/patterns/omo-agent-contract.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Contract file completeness
    Tool: Bash
    Steps: Run grep checks for required sections and lane matrix headings in both contract files
    Expected: Required sections exist in both files with matching policy intent
    Evidence: .sisyphus/evidence/task-1-canonical-contract.txt

  Scenario: Missing hierarchy guardrail
    Tool: Bash
    Steps: Search contract for explicit duplicate-authority prohibition phrase
    Expected: Contract contains explicit prohibition and precedence order
    Evidence: .sisyphus/evidence/task-1-canonical-contract-error.txt
  ```

  **Commit**: YES | Message: `docs(rules): add canonical omo agent-tool contract` | Files: `src/templates/rules/patterns/omo-agent-contract.md`, `.rules/patterns/omo-agent-contract.md`

- [x] 2. Define Agent-Lane Tooling Matrix

  **What to do**: Add a strict matrix in the canonical contract mapping each OMO agent/lane (planning, explore/research, execution, review, landing) to required reads, allowed tools, forbidden actions, and required outputs.
  **Must NOT do**: Do not leave implicit defaults like "use judgment"; each lane needs explicit rules.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: cross-system authority design with zero-ambiguity requirements
  - Skills: `[]` — no specialized skill needed
  - Omitted: `frontend-ui-ux` — irrelevant for policy matrix

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3,7,10 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/templates/opencode/oh-my-opencode.json` — agent names and routing anchors
  - Pattern: `.codex/agents/orchestrator.md` — orchestration boundaries
  - Pattern: `.codex/agents/implementer.md` — implementer boundaries
  - Pattern: `.codex/agents/reviewer.md` — reviewer boundaries
  - Pattern: `.codex/agents/gsd-cognee-advisor.md` — Cognee advisory pattern

  **Acceptance Criteria** (agent-executable only):
  - [ ] Matrix includes every OMO agent name present in `src/templates/opencode/oh-my-opencode.json`
  - [ ] Matrix columns include Required Reads, Allowed Tools, Forbidden Actions, Handoff Target
  - [ ] `pnpm test -- tests/integration/scaffold-snapshots.test.ts` still passes after docs additions

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Agent coverage parity
    Tool: Bash
    Steps: Compare agent keys in oh-my-opencode.json against matrix entries via grep
    Expected: No missing/extra agent mappings
    Evidence: .sisyphus/evidence/task-2-agent-matrix.txt

  Scenario: Ambiguous lane policy
    Tool: Bash
    Steps: Search for fuzzy wording like "as needed" or "if appropriate" in matrix rules
    Expected: No ambiguous modifiers in normative matrix rows
    Evidence: .sisyphus/evidence/task-2-agent-matrix-error.txt
  ```

  **Commit**: YES | Message: `docs(rules): define omo lane tooling matrix` | Files: `src/templates/rules/patterns/omo-agent-contract.md`, `.rules/patterns/omo-agent-contract.md`

- [x] 3. Encode Handoff Contracts and Ownership

  **What to do**: Define handoff contracts for planning->execution, execution->review, review->landing, and verification->issue closure with required artifact fields and ownership.
  **Must NOT do**: Do not permit handoff without explicit artifact path and command evidence.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: precise protocol definition and field-level constraints
  - Skills: `[]` — standard markdown/policy edits
  - Omitted: `playwright` — not needed for contract writing

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 11 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.rules/patterns/gsd-workflow.md` — phase progression references
  - Pattern: `.rules/patterns/beads-integration.md` — issue lifecycle requirements
  - Pattern: `.codex/scripts/land.sh` — landing owner behavior
  - Pattern: `AGENTS.md` — mandatory closeout steps

  **Acceptance Criteria** (agent-executable only):
  - [ ] Contract includes required handoff schema fields (source lane, target lane, evidence path, verify command, status)
  - [ ] Landing ownership is explicitly assigned to execution/autonomous lanes only
  - [ ] `grep -n "handoff\|landing authority\|evidence path" src/templates/rules/patterns/omo-agent-contract.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Handoff schema presence
    Tool: Bash
    Steps: Validate all required handoff fields are listed in contract schema section
    Expected: Complete schema present without optional critical fields
    Evidence: .sisyphus/evidence/task-3-handoff-contracts.txt

  Scenario: Unowned landing path
    Tool: Bash
    Steps: Search for conflicting statements allowing planning/research lanes to run landing
    Expected: No conflicting landing permissions
    Evidence: .sisyphus/evidence/task-3-handoff-contracts-error.txt
  ```

  **Commit**: YES | Message: `docs(rules): codify lane handoff ownership` | Files: `src/templates/rules/patterns/omo-agent-contract.md`, `.rules/patterns/omo-agent-contract.md`

- [x] 4. Baseline Integration Seam Inventory

  **What to do**: Add a maintained seam inventory table documenting Beads, GSD, Cognee, worktree, and install-skill integration points, with owner, failure mode, and fallback.
  **Must NOT do**: Do not treat inventory as canonical policy; it is operational support linked to canonical contract.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: cross-file operational mapping and risk framing
  - Skills: `[]` — no specialized tool requirement
  - Omitted: `oracle` — already consulted during planning

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 8 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.beads/hooks/post-checkout` — hook seam
  - Pattern: `.codex/scripts/bootstrap-worktree.sh` — bootstrap seam
  - Pattern: `.codex/scripts/land.sh` — landing seam
  - Pattern: `.codex/scripts/cognee-sync-planning.sh` — Cognee sync seam
  - Pattern: `src/commands/install-skill.ts` — global managed asset seam

  **Acceptance Criteria** (agent-executable only):
  - [ ] Inventory table includes touchpoint, owner, fallback, and verification command columns
  - [ ] Every row has at least one file reference and one executable check
  - [ ] `grep -n "owner\|fallback\|verification command" .rules/patterns/omo-agent-contract.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Seam table completeness
    Tool: Bash
    Steps: Validate each target tool has at least one seam row in inventory table
    Expected: Beads, GSD, Cognee, worktree, install-skill all represented
    Evidence: .sisyphus/evidence/task-4-seam-inventory.txt

  Scenario: Missing fallback path
    Tool: Bash
    Steps: Search rows for empty fallback or ambiguous fallback notes
    Expected: No seam row lacks deterministic fallback behavior
    Evidence: .sisyphus/evidence/task-4-seam-inventory-error.txt
  ```

  **Commit**: YES | Message: `docs(rules): add omo seam inventory baseline` | Files: `src/templates/rules/patterns/omo-agent-contract.md`, `.rules/patterns/omo-agent-contract.md`

- [x] 5. Normalize Authority Text Across Runtime Docs

  **What to do**: Update `AGENTS.md`, `.codex/README.md`, and template equivalents to reference canonical `.rules/patterns/omo-agent-contract.md` for normative behavior; keep these docs as adapter/entrypoint guidance only.
  **Must NOT do**: Do not leave contradictory normative wording after adding references.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: doctrine deduplication and reference normalization
  - Skills: `[]` — standard markdown updates
  - Omitted: `harness` — no scaffold regeneration task in this step

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 12 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `AGENTS.md` — repo runtime guide
  - Pattern: `.codex/README.md` — runtime surface guide
  - Pattern: `src/templates/codex/AGENTS.md` — generated repo guide source
  - Pattern: `src/templates/codex/README.md` — generated repo runtime source

  **Acceptance Criteria** (agent-executable only):
  - [ ] All above files reference canonical contract path for normative OMO behavior
  - [ ] Duplicated normative passages are replaced with concise adapter wording
  - [ ] `grep -n "omo-agent-contract" AGENTS.md .codex/README.md src/templates/codex/AGENTS.md src/templates/codex/README.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Canonical reference propagation
    Tool: Bash
    Steps: Run grep across docs to confirm canonical contract link appears in all adapter docs
    Expected: Every adapter doc references one canonical contract path
    Evidence: .sisyphus/evidence/task-5-authority-normalization.txt

  Scenario: Residual normative duplication
    Tool: Bash
    Steps: Search for duplicated imperative policy blocks in adapter docs
    Expected: No conflicting policy text remains outside canonical rules contract
    Evidence: .sisyphus/evidence/task-5-authority-normalization-error.txt
  ```

  **Commit**: YES | Message: `docs(codex): normalize authority to rules contract` | Files: `AGENTS.md`, `.codex/README.md`, `src/templates/codex/AGENTS.md`, `src/templates/codex/README.md`

- [x] 6. Codify Cognee Required-Broadly Policy

  **What to do**: Replace inconsistent optional wording with explicit required-broadly lane policy and deterministic fallback/error semantics across rules and runtime docs.
  **Must NOT do**: Do not create contradictory statements where Cognee is both required and optional for the same lane.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: cross-lane policy reconciliation with failure semantics
  - Skills: `[]` — no additional skill needed
  - Omitted: `explore` — discovery is already complete

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 10,13 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.rules/patterns/cognee-gsd-integration.md` — current policy base
  - Pattern: `.codex/agents/gsd-cognee-advisor.md` — advisor behavior
  - Pattern: `.codex/agents/implementer.md` — implementer fallback language
  - Pattern: `src/templates/opencode/get-shit-done/workflows/autonomous.md` — managed autonomous behavior
  - Pattern: `src/templates/opencode/oh-my-opencode.json` — global mapping context

  **Acceptance Criteria** (agent-executable only):
  - [ ] One unambiguous lane-level Cognee policy exists with required/allowed/fallback semantics
  - [ ] Conflicting "optional" wording is removed or explicitly scoped exceptions
  - [ ] `grep -n "Cognee\|required\|fallback" .rules/patterns/cognee-gsd-integration.md .codex/agents/gsd-cognee-advisor.md .codex/agents/implementer.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Required-broadly policy consistency
    Tool: Bash
    Steps: Compare Cognee policy statements across target files using grep output
    Expected: No contradictory policy language for same lanes
    Evidence: .sisyphus/evidence/task-6-cognee-policy.txt

  Scenario: Missing fallback semantics
    Tool: Bash
    Steps: Verify each lane policy includes deterministic behavior for unavailable Cognee
    Expected: Every lane has defined proceed/fail condition
    Evidence: .sisyphus/evidence/task-6-cognee-policy-error.txt
  ```

  **Commit**: YES | Message: `docs(rules): codify cognee required-broadly policy` | Files: `.rules/patterns/cognee-gsd-integration.md`, `.codex/agents/gsd-cognee-advisor.md`, `.codex/agents/implementer.md`, `src/templates/opencode/get-shit-done/workflows/autonomous.md`

- [x] 7. Publish Landing Ownership Contract

  **What to do**: Define and propagate a single landing authority model: which lanes may run `.codex/scripts/land.sh`, when issue closure is allowed, and when PR publication is blocked.
  **Must NOT do**: Do not permit planning/research lanes to publish landing changes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: operational safety and ownership constraints
  - Skills: `[]` — policy and script guidance update
  - Omitted: `metis` — already consulted for gap framing

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 13 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.codex/scripts/land.sh` — actual landing behavior
  - Pattern: `AGENTS.md` — mandatory landing protocol
  - Pattern: `.rules/patterns/operator-workflow.md` — operational loop
  - Pattern: `.codex/workflows/autonomous-execution.md` — autonomous landing posture

  **Acceptance Criteria** (agent-executable only):
  - [ ] Landing authority is explicitly role-scoped in canonical contract and adapter docs
  - [ ] Landing preconditions include verification state and issue status rules
  - [ ] `grep -n "land.sh\|landing\|close" AGENTS.md .rules/patterns/operator-workflow.md .codex/workflows/autonomous-execution.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Single owner landing policy
    Tool: Bash
    Steps: Validate only execution/autonomous lanes are authorized to run landing
    Expected: No document authorizes planning/research lanes for landing
    Evidence: .sisyphus/evidence/task-7-landing-ownership.txt

  Scenario: Premature close path
    Tool: Bash
    Steps: Search for any wording allowing issue close before verification
    Expected: No early-close policy statements remain
    Evidence: .sisyphus/evidence/task-7-landing-ownership-error.txt
  ```

  **Commit**: YES | Message: `docs(workflow): publish single landing ownership contract` | Files: `AGENTS.md`, `.rules/patterns/operator-workflow.md`, `.codex/workflows/autonomous-execution.md`, `src/templates/codex/scripts/land.sh`

- [x] 8. Harden Beads-Worktree Seam Precedence

  **What to do**: Document and enforce deterministic precedence/order between `.beads/hooks/post-checkout`, `.opencode/worktree.jsonc` postCreate hooks, and `.codex/scripts/bootstrap-worktree.sh` idempotent behavior.
  **Must NOT do**: Do not introduce duplicate side effects on double invocation.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: focused seam clarification and hook-safe adjustments
  - Skills: `[]` — direct script/hook consistency task
  - Omitted: `artistry` — not a creative design task

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 14 | Blocked By: 4

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.beads/hooks/post-checkout` — Beads + bootstrap seam
  - Pattern: `.opencode/worktree.jsonc` — OpenCode plugin seam
  - Pattern: `.codex/scripts/bootstrap-worktree.sh` — idempotency surface
  - Pattern: `scripts/hooks/post-checkout` — fallback path
  - Pattern: `tests/integration/bootstrap-worktree.test.ts` — behavior baseline

  **Acceptance Criteria** (agent-executable only):
  - [ ] Precedence order is explicitly documented in canonical contract and runtime docs
  - [ ] Running bootstrap twice remains safe and non-destructive
  - [ ] `pnpm test -- tests/integration/bootstrap-worktree.test.ts`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Hook coexistence happy path
    Tool: Bash
    Steps: Execute bootstrap-worktree integration test suite
    Expected: All tests pass with plugin+hook coexistence expectations
    Evidence: .sisyphus/evidence/task-8-hook-seam.txt

  Scenario: Double invocation edge case
    Tool: Bash
    Steps: Re-run bootstrap test and inspect no duplicate symlink/error side effects
    Expected: Idempotency maintained across repeated runs
    Evidence: .sisyphus/evidence/task-8-hook-seam-error.txt
  ```

  **Commit**: YES | Message: `fix(hooks): codify beads-worktree precedence` | Files: `.beads/hooks/post-checkout`, `.opencode/worktree.jsonc`, `.codex/scripts/bootstrap-worktree.sh`, `scripts/hooks/post-checkout`, `src/templates/root/scripts/hooks/post-checkout`

- [x] 9. Add Contract Drift Detection Tests

  **What to do**: Add integration tests that assert adapter docs/scripts reference canonical OMO contract and fail when contradictory normative blocks appear outside `.rules/patterns/omo-agent-contract.md`.
  **Must NOT do**: Do not rely on manual review for drift detection.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: policy-to-test translation with strict assertions
  - Skills: `[]` — existing vitest patterns are sufficient
  - Omitted: `librarian` — docs lookup not needed

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 12 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/integration/scaffold-snapshots.test.ts` — snapshot assertion style
  - Test: `tests/integration/beads-wrapper.test.ts` — doctrine-string assertion style
  - Test: `tests/integration/doctor.test.ts` — integration validation style
  - Pattern: `src/templates/rules/patterns/omo-agent-contract.md` — canonical authority source

  **Acceptance Criteria** (agent-executable only):
  - [ ] New integration test fails when canonical contract reference is removed from any adapter doc
  - [ ] New integration test fails when duplicate normative authority block is inserted in adapter docs
  - [ ] `pnpm test -- tests/integration/doctor.test.ts`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Drift detection happy path
    Tool: Bash
    Steps: Run targeted integration tests validating canonical references and no duplicate authority text
    Expected: Tests pass with current aligned docs
    Evidence: .sisyphus/evidence/task-9-drift-tests.txt

  Scenario: Contract reference removed
    Tool: Bash
    Steps: Simulate missing canonical reference in test fixture and run drift test
    Expected: Test fails with explicit missing-reference error
    Evidence: .sisyphus/evidence/task-9-drift-tests-error.txt
  ```

  **Commit**: YES | Message: `test(integration): detect omo contract drift` | Files: `tests/integration/doctor.test.ts`, `tests/integration/scaffold-snapshots.test.ts`, `tests/integration/beads-wrapper.test.ts`

- [x] 10. Add Cognee Policy Runtime Verification

  **What to do**: Add tests covering required-broadly Cognee lane policy behavior, including deterministic behavior for available/unavailable Cognee in designated lanes.
  **Must NOT do**: Do not leave pass criteria as "optional if unavailable" without lane qualification.

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: policy-runtime alignment for multi-lane behavior
  - Skills: `[]` — test harness already in repo
  - Omitted: `momus` — final review happens in verification wave

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 14 | Blocked By: 2,6

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.codex/scripts/cognee-bridge.sh` — runtime command behavior
  - Pattern: `.codex/scripts/cognee-brief.sh` — wrapper behavior
  - Pattern: `.codex/scripts/cognee-sync-planning.sh` — planning sync behavior
  - Test: `tests/integration/land-script.test.ts` — Cognee invocation checks
  - Test: `tests/integration/init.test.ts` — script generation baseline

  **Acceptance Criteria** (agent-executable only):
  - [ ] Tests validate lane behavior when Cognee is unavailable vs available
  - [ ] Tests assert explicit outcome messages (continue, block, or fallback) by lane policy
  - [ ] `pnpm test -- tests/integration/land-script.test.ts`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Cognee available path
    Tool: Bash
    Steps: Execute integration tests with Cognee-check success fixture/path
    Expected: Required lanes proceed with Cognee actions recorded
    Evidence: .sisyphus/evidence/task-10-cognee-runtime.txt

  Scenario: Cognee unavailable in required lane
    Tool: Bash
    Steps: Execute integration tests with Cognee-check failure fixture/path for required lane
    Expected: Deterministic fail/redirect per contract, not silent skip
    Evidence: .sisyphus/evidence/task-10-cognee-runtime-error.txt
  ```

  **Commit**: YES | Message: `test(integration): enforce cognee lane policy behavior` | Files: `tests/integration/land-script.test.ts`, `tests/integration/init.test.ts`, `tests/integration/doctor.test.ts`

- [x] 11. Add Handoff Schema Validation Checks

  **What to do**: Add checks that required handoff fields and evidence references are present in designated workflow docs/plan artifacts and match contract schema.
  **Must NOT do**: Do not accept handoff records missing verify command or evidence path.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: constrained validation additions and schema checks
  - Skills: `[]` — straightforward test/document validation
  - Omitted: `oracle` — architecture consultation already complete

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 15 | Blocked By: 3

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/templates/rules/patterns/omo-agent-contract.md` — handoff schema source
  - Pattern: `.rules/patterns/gsd-workflow.md` — handoff lifecycle context
  - Pattern: `.codex/workflows/autonomous-execution.md` — lane transitions
  - Test: `tests/integration/doctor.test.ts` — validation style

  **Acceptance Criteria** (agent-executable only):
  - [ ] Validation checks fail when required handoff fields are absent
  - [ ] Validation checks pass when schema-compliant records are present
  - [ ] `pnpm test -- tests/integration/doctor.test.ts`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Schema-compliant handoff
    Tool: Bash
    Steps: Run validation tests against compliant handoff fixtures/docs
    Expected: Validation passes with all required fields
    Evidence: .sisyphus/evidence/task-11-handoff-validation.txt

  Scenario: Missing verify command field
    Tool: Bash
    Steps: Run validation tests against fixture missing verify command
    Expected: Deterministic failure naming missing field
    Evidence: .sisyphus/evidence/task-11-handoff-validation-error.txt
  ```

  **Commit**: YES | Message: `test(workflow): validate handoff schema compliance` | Files: `tests/integration/doctor.test.ts`, `.rules/patterns/gsd-workflow.md`, `.codex/workflows/autonomous-execution.md`

- [x] 12. Extend Doctor for Alignment Audit

  **What to do**: Expand `doctor` checks to include canonical contract linkage, policy drift detection, and required seam references for OMO alignment.
  **Must NOT do**: Do not make doctor checks dependent on live external network calls.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: command-surface enhancement with deterministic checks
  - Skills: `[]` — existing doctor architecture is sufficient
  - Omitted: `dev-browser` — no browser automation needed

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 15 | Blocked By: 5,9

  **References** (executor has NO interview context — be exhaustive):
  - API/Type: `src/commands/doctor.ts` — doctor check flow
  - API/Type: `src/core/types.ts` — report structures
  - Test: `tests/integration/doctor.test.ts` — expected output style
  - Pattern: `docs/harness-usage.md` — doctor usage expectations

  **Acceptance Criteria** (agent-executable only):
  - [ ] Doctor reports fail/warn when canonical contract reference is missing in required adapter docs
  - [ ] Doctor reports seam misconfiguration for hook/bootstrap precedence violations
  - [ ] `pnpm test -- tests/integration/doctor.test.ts`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Fully aligned repository
    Tool: Bash
    Steps: Run doctor integration tests against aligned fixture/current repo expectations
    Expected: Doctor returns pass with no alignment failures
    Evidence: .sisyphus/evidence/task-12-doctor-alignment.txt

  Scenario: Missing contract reference in adapter doc
    Tool: Bash
    Steps: Run doctor tests against fixture lacking required canonical reference
    Expected: Doctor returns fail/warn with actionable remediation message
    Evidence: .sisyphus/evidence/task-12-doctor-alignment-error.txt
  ```

  **Commit**: YES | Message: `feat(doctor): add omo alignment audit checks` | Files: `src/commands/doctor.ts`, `src/core/types.ts`, `tests/integration/doctor.test.ts`

- [x] 13. Align Operator Workflow and Autonomous Guides

  **What to do**: Update `.rules/patterns/operator-workflow.md` and `.codex/workflows/autonomous-execution.md` to align with canonical contract, landing ownership, and Cognee-required lane policy.
  **Must NOT do**: Do not add new workflow branches that bypass canonical contract rules.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: operational guidance reconciliation
  - Skills: `[]` — markdown contract propagation
  - Omitted: `ultrabrain` — no novel algorithmic problem here

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 15 | Blocked By: 6,7

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.rules/patterns/operator-workflow.md` — canonical operator runbook
  - Pattern: `.codex/workflows/autonomous-execution.md` — autonomous policy
  - Pattern: `src/templates/codex/workflows/autonomous-execution.md` — scaffold source
  - Pattern: `docs/harness-usage.md` — user-facing workflow guidance

  **Acceptance Criteria** (agent-executable only):
  - [ ] Operator and autonomous guides reference canonical contract and no longer conflict on Cognee/landing ownership
  - [ ] Workflow loops retain Beads->GSD->verification->land ordering
  - [ ] `grep -n "omo-agent-contract\|/gsd-next\|land.sh" .rules/patterns/operator-workflow.md .codex/workflows/autonomous-execution.md docs/harness-usage.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Workflow doctrine consistency
    Tool: Bash
    Steps: Compare key workflow statements across operator and autonomous guides via grep
    Expected: No contradictory sequence/ownership statements
    Evidence: .sisyphus/evidence/task-13-workflow-alignment.txt

  Scenario: Cognee policy contradiction
    Tool: Bash
    Steps: Search guides for mixed "optional" and "required" policy for same lane
    Expected: No conflicting lane-level policy statements
    Evidence: .sisyphus/evidence/task-13-workflow-alignment-error.txt
  ```

  **Commit**: YES | Message: `docs(workflow): align operator and autonomous guides` | Files: `.rules/patterns/operator-workflow.md`, `.codex/workflows/autonomous-execution.md`, `src/templates/codex/workflows/autonomous-execution.md`, `docs/harness-usage.md`

- [x] 14. Validate Hook and Global Asset Regression Surface

  **What to do**: Run and capture targeted integration regressions for install-skill, worktree bootstrap, land script, and doctor alignment checks after policy changes.
  **Must NOT do**: Do not skip failing suites; fix or explicitly scope failures before completion.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: multi-surface regression verification
  - Skills: `[]` — existing test commands are sufficient
  - Omitted: `scaff` — scaffolding skill not needed for verification execution

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 15 | Blocked By: 8,10

  **References** (executor has NO interview context — be exhaustive):
  - Test: `tests/integration/install-skill.test.ts`
  - Test: `tests/integration/bootstrap-worktree.test.ts`
  - Test: `tests/integration/land-script.test.ts`
  - Test: `tests/integration/doctor.test.ts`
  - Pattern: `package.json` — authoritative test scripts

  **Acceptance Criteria** (agent-executable only):
  - [ ] `pnpm test -- tests/integration/install-skill.test.ts` passes
  - [ ] `pnpm test -- tests/integration/bootstrap-worktree.test.ts` passes
  - [ ] `pnpm test -- tests/integration/land-script.test.ts` passes
  - [ ] `pnpm test -- tests/integration/doctor.test.ts` passes

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Regression suite happy path
    Tool: Bash
    Steps: Run four targeted integration suites and collect outputs
    Expected: All suites pass with no new policy drift failures
    Evidence: .sisyphus/evidence/task-14-regression-surface.txt

  Scenario: Intentional drift fixture
    Tool: Bash
    Steps: Run doctor/drift tests against known misconfigured fixture or negative case
    Expected: Alignment checks fail with deterministic diagnostics
    Evidence: .sisyphus/evidence/task-14-regression-surface-error.txt
  ```

  **Commit**: YES | Message: `test(integration): verify alignment regression surface` | Files: `.sisyphus/evidence/task-14-regression-surface.txt`, `.sisyphus/evidence/task-14-regression-surface-error.txt`

- [x] 15. Publish Gap Analysis Report and Adoption Playbook

  **What to do**: Publish a consolidated gap-analysis report and phased adoption checklist mapping each identified gap to implemented guardrail/test evidence and rollout order.
  **Must NOT do**: Do not leave unresolved gaps undocumented; every gap must map to status and next action.

  **Recommended Agent Profile**:
  - Category: `writing` — Reason: synthesis and operational handoff documentation
  - Skills: `[]` — markdown synthesis task
  - Omitted: `deep` — heavy analysis is already complete

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: F1-F4 | Blocked By: 11,12,13,14

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `.sisyphus/drafts/omo-tooling-gap-analysis.md` — captured requirements/decisions
  - Pattern: `.sisyphus/plans/omo-tooling-gap-analysis.md` — execution plan
  - Pattern: `.rules/patterns/omo-agent-contract.md` — canonical contract
  - Evidence: `.sisyphus/evidence/task-*.txt` — test/QA evidence corpus

  **Acceptance Criteria** (agent-executable only):
  - [ ] Report includes gap ID, severity, remediation, owner lane, verification command, and evidence path
  - [ ] Adoption playbook includes rollback and escalation conditions
  - [ ] `grep -n "Gap ID\|Severity\|Verification Command\|Evidence" .sisyphus/evidence/task-15-gap-report.md`

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Complete remediation traceability
    Tool: Bash
    Steps: Validate every gap in report maps to guardrail and evidence artifact
    Expected: No orphaned gap entries without remediation/evidence
    Evidence: .sisyphus/evidence/task-15-gap-report.txt

  Scenario: Missing rollout guardrails
    Tool: Bash
    Steps: Check report for rollback/escalation section and lane ownership table
    Expected: Required rollout safety sections present
    Evidence: .sisyphus/evidence/task-15-gap-report-error.txt
  ```

  **Commit**: YES | Message: `docs(audit): publish omo tooling gap report and playbook` | Files: `.sisyphus/evidence/task-15-gap-report.md`, `.sisyphus/evidence/task-15-gap-report.txt`, `.sisyphus/evidence/task-15-gap-report-error.txt`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `docs(rules): add canonical omo agent-tool contract`
- Commit 2: `docs(codex): convert runtime docs to contract adapters`
- Commit 3: `fix(hooks): codify beads-worktree seam precedence`
- Commit 4: `test(integration): add contract drift and cognee policy coverage`
- Commit 5: `docs(workflow): publish gap audit and adoption matrix`

## Success Criteria
- OMO agent-to-tool authority is explicit, singular, and reference-linked.
- Beads/GSD/Cognee/worktree precedence is deterministic and test-validated.
- Landing authority is unambiguous and enforced by docs + script checks.
- Runtime verification catches policy drift, not just missing files.
- Implementers can execute without making policy decisions ad hoc.
