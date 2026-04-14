# Execution Approach

## Mode
Parallel wave

## Work Item
- Feature: `pi-harness-vyv.6`
- Active task: `pi-harness-vyv.6.1`

## Knowledge
Cognee attempted and unavailable (`DatasetNotFoundError: No datasets found`). Repository evidence from workflow docs, agent prompts, settings, extension glue, and doctor/tests is sufficient for local execution.

## Test Strategy
TDD with focused scaffold/runtime verification.
- RED: add targeted integration expectations for capability profiles, role-workflow registration, structured handoff guidance, and doctor drift detection.
- GREEN: update workflow docs/prompts/settings/extension/doctor to satisfy the new expectations.
- REFACTOR: align templates, docs, and doctor checks while keeping the targeted suite green.

## Agents / Chains
Parallel scout wave completed for design:
- `code-scout` mapped structured handoff + bounded collaboration surfaces.
- `code-scout` mapped capability profile + tool alignment + doctor surfaces.

Planned implementation waves:
1. `pi-harness-vyv.6.2` — workflow contract + bounded collaboration
2. `pi-harness-vyv.6.3` — capability profiles + tool alignment + doctor
3. `pi-harness-vyv.6.4` — verification + scaffold parity

## Delegation Units

### Delegation Unit: design-contract
- Owner: `lead`
- Goal: convert the user request into a Beads-backed design spec and bounded wave plan
- Allowed Files:
  - `plan.md`
  - `wave.md`
  - `docs/pi-agentic-workflow-design.md`
- Non-Goals:
  - do not change scaffold/runtime code yet
- Inputs:
  - `README.md`
  - `docs/pi-subagent-workflow.md`
  - `.pi/settings.json`
  - `.pi/extensions/role-workflow.ts`
  - `src/commands/doctor.ts`
- Output:
  - updated planning/design artifacts
- RED:
  - none; planning artifact wave
- Caller Verification:
  - artifacts reflect Beads IDs, waves, and acceptance criteria
- Escalate If:
  - the design requires unsupported runtime hooks

### Delegation Unit: implementation-wave-2
- Owner: `lead` with bounded child support
- Goal: add the structured handoff contract and bounded collaboration semantics
- Allowed Files:
  - workflow docs/skills/prompts
  - role/helper prompts
  - saved chain guidance
- Non-Goals:
  - do not add provider-pinned model IDs
- Inputs:
  - `docs/pi-agentic-workflow-design.md`
  - `plan.md`
- Output:
  - updated workflow contract surfaces
- RED:
  - targeted docs/init/scaffold tests fail for missing structured handoff content
- Caller Verification:
  - targeted integration tests covering docs + scaffold alignment
- Escalate If:
  - role recursion would exceed bounded depth or touch build fanout

### Delegation Unit: implementation-wave-3
- Owner: `lead` with bounded child support
- Goal: add capability profiles, tool alignment, and doctor drift detection
- Allowed Files:
  - `.pi/settings.json`
  - `.pi/extensions/role-workflow.ts`
  - helper agent prompts
  - `src/commands/doctor.ts`
  - mirrored template surfaces
- Non-Goals:
  - do not enforce provider-specific model resolution in scaffold files
- Inputs:
  - `docs/pi-agentic-workflow-design.md`
  - targeted RED tests
- Output:
  - runtime-facing capability profile baseline
- RED:
  - targeted init/doctor tests fail for missing web-access package, role-workflow registration, and profile tokens
- Caller Verification:
  - targeted integration/doctor suite
- Escalate If:
  - profile resolution requires unsupported extension APIs

### Delegation Unit: implementation-wave-4
- Owner: `lead`
- Goal: align verification, scaffold parity, and docs
- Allowed Files:
  - `tests/integration/*`
  - any changed mirrored template files needed for parity
- Non-Goals:
  - do not broaden into project-wide behavior changes unrelated to workflow assets
- Inputs:
  - completed waves 2 and 3
- Output:
  - passing targeted verification
- RED:
  - already observed in targeted integration failures
- Caller Verification:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- Escalate If:
  - failures point to unrelated scaffold regressions

## Verification
Current RED observed with:

```bash
pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts
```

## Risks
- Main-session model selection may remain advisory/profile-based because the extension API exposes tool + thinking control but not a direct model setter.
- Role recursion must stay bounded; `build` remains leaf-based.
- Dogfood/template drift is the main maintenance risk, so parity checks must land in the same change.
