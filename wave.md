# Execution Approach

## Mode
Parallel wave

## Work Item
`pi-harness-vyv.7`

## Knowledge
- Execution Surface target: MCP adapter first when explicitly requested; shell fallback only with explicit reason.
Cognee attempted and unavailable (`DatasetNotFoundError`). Local repo evidence is sufficient.

## Test Strategy
Hybrid, led by TDD on workflow/scaffold drift.
- RED: targeted integration tests fail for missing MCP-first policy, missing GitHub MCP-native helper/capability alignment, and missing doctor/test enforcement.
- GREEN: update policy/routing surfaces, add the MCP-native helper and capability metadata, and extend doctor/tests.
- REFACTOR: mirror dogfood/template updates and keep wording aligned.

## Agents / Chains
Parallel scout wave already completed:
- `code-scout` mapped policy/routing surfaces.
- `code-scout` mapped MCP helper/capability/verification surfaces.

Implementation will stay mostly direct in the main session because the change is tightly coupled across policy, helper, generator, doctor, and test surfaces.

## Delegation Units

### Delegation Unit: policy-routing
- Owner: `lead`
- Goal: add MCP-first policy and routing guidance to canonical workflow files
- Allowed Files:
  - `AGENTS.md`
  - `.pi/SYSTEM.md`
  - `.pi/agents/lead.md`
  - `.pi/skills/subagent-workflow/SKILL.md`
  - `.pi/prompts/feat-change.md`
  - `.pi/prompts/plan-change.md`
  - `.pi/prompts/ship-change.md`
  - `.pi/prompts/review-change.md`
  - template mirrors under `src/templates/pi/`
- Non-Goals:
  - do not add provider-pinned model behavior
- Inputs:
  - `context.md`
  - `docs/pi-subagent-workflow.md`
- Output:
  - updated workflow policy/routing surfaces
- RED:
  - targeted docs/init/scaffold expectations fail because MCP-first wording is absent
- Caller Verification:
  - targeted integration docs/scaffold tests
- Escalate If:
  - policy wording conflicts with existing global-only prompt/serve rules

### Delegation Unit: github-mcp-helper
- Owner: `lead`
- Goal: add a GitHub MCP-native helper and capability metadata
- Allowed Files:
  - `.pi/agents/*github*.md`
  - `.pi/settings.json`
  - `.pi/mcp.json`
  - `src/generators/pi.ts`
  - template mirrors under `src/templates/pi/`
- Non-Goals:
  - do not add shell fallback logic as the default path
- Inputs:
  - `context.md`
  - `plan.md`
- Output:
  - helper/capability surfaces aligned to MCP-first behavior
- RED:
  - init/scaffold tests fail because the helper/profile do not exist
- Caller Verification:
  - targeted integration/init/scaffold tests
- Escalate If:
  - `pi-subagents` MCP tool declaration semantics require a different helper naming or tool shape

### Delegation Unit: doctor-verification
- Owner: `lead`
- Goal: add drift detection and focused tests for MCP-first workflow behavior
- Allowed Files:
  - `src/commands/doctor.ts`
  - `tests/integration/doctor.test.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Non-Goals:
  - do not broaden into unrelated runtime checks
- Inputs:
  - updated policy/helper surfaces
- Output:
  - passing targeted regression coverage
- RED:
  - targeted integration suite fails for missing helper/policy/drift checks
- Caller Verification:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- Escalate If:
  - drift detection needs repo-wide test expansion beyond the targeted workflow suite

## Verification
Initial RED target:
```bash
pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts
```

## Risks
- MCP is extension-backed, so policy alone is insufficient; helper and doctor surfaces must land together.
- A too-generic helper name may blur the distinction between GitHub MCP and open-web research.
- Token-only doctor checks may be too weak if `.pi/mcp.json` structure changes later.
