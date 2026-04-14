# Code Context

## Work Item
`pi-harness-vyv.7` — enforce MCP-first workflow for explicit MCP requests.

## Knowledge Brief
Cognee attempted via `./scripts/cognee-brief.sh "Persist MCP-first workflow behavior when users explicitly request MCP adapter usage"` and was unavailable: `DatasetNotFoundError: No datasets found`.

## Inputs Consumed
- Execution Surface: MCP-first policy feature design; no MCP call executed during planning
- `AGENTS.md`
- `.pi/SYSTEM.md`
- `.pi/agents/lead.md`
- `.pi/skills/subagent-workflow/SKILL.md`
- `.pi/prompts/feat-change.md`
- `.pi/prompts/plan-change.md`
- `.pi/prompts/ship-change.md`
- `.pi/prompts/review-change.md`
- `.pi/settings.json`
- `.pi/mcp.json`
- `src/commands/doctor.ts`
- `src/generators/pi.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`

## Files Retrieved
- Policy/routing surfaces:
  - `AGENTS.md`
  - `.pi/SYSTEM.md`
  - `.pi/agents/lead.md`
  - `.pi/skills/subagent-workflow/SKILL.md`
  - `.pi/prompts/feat-change.md`
  - `.pi/prompts/plan-change.md`
  - `.pi/prompts/ship-change.md`
  - `.pi/prompts/review-change.md`
- Capability/runtime surfaces:
  - `.pi/settings.json`
  - `.pi/mcp.json`
  - `.pi/agents/web-researcher.md`
- Scaffold/runtime verification surfaces:
  - `src/generators/pi.ts`
  - `src/commands/doctor.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
  - `tests/integration/doctor.test.ts`

## Key Contracts
- Explicit MCP requests should use the MCP adapter first.
- Shell/CLI fallback should only happen when MCP is unavailable and that fallback must be stated explicitly.
- Provider/model selection must remain in Pi runtime, not scaffolded agent files.
- MCP is extension-backed (`npm:pi-mcp-adapter`) and GitHub is configured in `.pi/mcp.json`.
- A durable solution should be reflected in dogfood `.pi/*`, templates, doctor, and integration coverage.

## Test Surface
Hybrid, led by TDD on scaffold/runtime drift.
- RED targets:
  - `tests/integration/doctor.test.ts`
  - `tests/integration/init.test.ts`
  - `tests/integration/scaffold-snapshots.test.ts`
  - `tests/integration/docs-alignment.test.ts`
- Expected narrower verification after changes:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`

## Constraints
- Keep provider/model binding in Pi runtime.
- Use the MCP adapter path explicitly when user intent requires it.
- Avoid silent fallback to `gh`, shell, or API workarounds.
- Keep changes mirrored between dogfood and templates.

## Decisions
- This should be tracked in Beads as `pi-harness-vyv.7` with child tasks `.1` through `.3`.
- The smallest durable implementation is policy + routing guidance + GitHub MCP-native helper + doctor/tests.
- A dedicated helper is better than hoping all general helpers infer MCP-first behavior.

## Open Questions
- Should the helper be named `github-operator` or `github-researcher`? (`github-operator` fits general repo operations better.)
- Should helper output use `research.md` or a GitHub-specific artifact name?
- Should doctor parse `.pi/mcp.json` structurally or continue using token checks?

## Requested Follow-up
none

## Caller Verification
- RED/implementation verification path:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`

## Escalate If
- Pi MCP direct-tool exposure requires helper/tool declarations that the current `pi-subagents` contract cannot support cleanly.
- The implementation would require runtime model auto-switching rather than advisory model profiles.
