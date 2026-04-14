# Implementation Plan

## Work Item
`pi-harness-vyv.7` — enforce MCP-first workflow for explicit MCP requests.

Acceptance criteria:
- `AGENTS.md`, `.pi/SYSTEM.md`, and workflow guidance state that explicit MCP requests should use the MCP adapter first
- the workflow has a GitHub MCP-capable helper or equivalent repo-local path that explicitly declares MCP usage instead of implicit shell fallback
- runtime capability/profile guidance and doctor checks cover MCP adapter/package/server/helper drift
- dogfood `.pi/*`, scaffold templates, docs, and verification remain aligned

## Knowledge Inputs
- Cognee brief attempted and unavailable (`DatasetNotFoundError`)
- Beads feature: `pi-harness-vyv.7`
- Parallel scout findings captured in `context.md`

## Inputs Consumed
- Execution Surface
  - target policy: explicit MCP requests should use the MCP adapter first; shell fallback only when MCP is unavailable and stated explicitly
- `context.md`
- `AGENTS.md`
- `.pi/SYSTEM.md`
- `.pi/settings.json`
- `.pi/mcp.json`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- targeted integration tests

## Goal
Make explicit MCP requests route through the MCP adapter first, with explicit fallback behavior and drift detection.

## Approach
1. Add MCP-first policy and routing guidance in canonical workflow files.
2. Add a dedicated GitHub MCP-native helper plus matching capability profile metadata.
3. Wire the helper into scaffold generation/templates and extend doctor + targeted tests.
4. Verify with the narrowest focused suite, then close the Beads tasks.

## Test Strategy
Hybrid, led by TDD on integration drift checks.

## RED
Run the targeted workflow verification suite after updating tests to expect MCP-first behavior:

```bash
pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts
```

## GREEN
Implement the smallest changes that make the targeted suite pass:
- policy/routing wording
- a GitHub MCP-native helper with explicit MCP tool declaration
- capability profile entry in `.pi/settings.json`
- generator + doctor + tests updated to match

## REFACTOR
- align wording between dogfood and templates
- keep helper/tool/profile naming consistent
- avoid duplicating policy text more than necessary

## Delegation Units

### Delegation Unit: mcp-policy-routing
- Owner: `lead`
- Goal: add canonical MCP-first workflow guidance
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
  - no provider/model pinning
- Inputs:
  - `context.md`
- Output:
  - updated policy/routing surfaces
- Dependency:
  - none
- RED:
  - targeted docs/scaffold expectations fail because MCP-first wording is absent
- GREEN Target:
  - concise MCP-first rule appears in canonical and routed workflow surfaces
- Caller Verification:
  - targeted docs-alignment/init/scaffold suite
- Escalate If:
  - wording conflicts with existing prompt-native `/serve` or global-only `/bake` rules

### Delegation Unit: github-mcp-helper
- Owner: `lead`
- Goal: add a GitHub MCP-native helper and capability profile
- Allowed Files:
  - `.pi/agents/github-operator.md`
  - `.pi/settings.json`
  - `.pi/mcp.json`
  - `src/generators/pi.ts`
  - template mirrors under `src/templates/pi/`
- Non-Goals:
  - do not make shell fallback the default path
- Inputs:
  - `context.md`
- Output:
  - explicit GitHub MCP helper + scaffold wiring
- Dependency:
  - helper naming and profile choice settled
- RED:
  - targeted init/scaffold tests fail because the helper/profile are absent
- GREEN Target:
  - helper exists, is scaffolded, and uses `mcp:github`
- Caller Verification:
  - targeted init/scaffold suite
- Escalate If:
  - direct MCP tool declaration needs a more specific `mcp:github/...` shape

### Delegation Unit: mcp-drift-detection
- Owner: `lead`
- Goal: extend doctor and focused tests
- Allowed Files:
  - `src/commands/doctor.ts`
  - `tests/integration/doctor.test.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Non-Goals:
  - no unrelated doctor broadening
- Inputs:
  - completed policy/helper changes
- Output:
  - passing focused regression suite
- Dependency:
  - policy/helper changes merged locally first
- RED:
  - targeted suite fails for missing helper/policy/drift detection
- GREEN Target:
  - doctor and tests enforce MCP-first baseline
- Caller Verification:
  - targeted test suite + `pnpm typecheck`
- Escalate If:
  - drift detection requires new project-wide test infrastructure

## Requested Follow-up
none

## Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- then broader caller sweep if needed:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- `pnpm typecheck`

## Risks
- Helper naming could need refinement if `github-operator` is too broad or too narrow.
- Doctor may need structural JSON checks if token checks prove too brittle.
- If a user asks for MCP but the session lacks the adapter/server connection, the workflow must be explicit about fallback rather than silently substituting shell tools.
