# Progress

## Work Item
`pi-harness-vyv.7`

## Status
Completed

## Test Strategy
Hybrid
- Cognee unavailable (`DatasetNotFoundError`), so local repo evidence drove the work.
- RED: extend targeted init/scaffold/docs/doctor tests to expect MCP-first policy, a GitHub MCP-native helper, and drift detection.
- GREEN: implement MCP-first policy/routing guidance, scaffold the GitHub MCP helper, add capability metadata, and make doctor pass the updated suite.
- REFACTOR: align dogfood/template surfaces, add the same wording to the parallel-wave route, and tighten doctor coverage for `github-mcp` tool requirements.

## Inputs Consumed
- Execution Surface: repo policy + helper path now target `mcp:github` first for explicit GitHub MCP requests; no shell fallback was implemented as the default path.
- `context.md`
- `plan.md`
- `wave.md`
- Beads issue `pi-harness-vyv.7`
- workflow docs, prompts, agents, settings, generator, doctor, and targeted integration tests

## Allowed Files
- `AGENTS.md`
- `.pi/*` workflow/runtime surfaces related to MCP-first behavior
- `src/templates/pi/*` mirrored workflow/runtime surfaces
- `src/templates/root/README.md`
- `README.md`
- `docs/pi-subagent-workflow.md`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/cli-init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`

## Non-Goals
- No provider/model pinning in scaffolded agent files
- No shell fallback as the default implementation path for explicit MCP requests
- No broad runtime redesign beyond MCP-first workflow persistence

## Tasks
- [x] Create and claim Beads feature `pi-harness-vyv.7` with aligned child tasks
- [x] Add MCP-first policy to canonical workflow surfaces
- [x] Add the `github-operator` MCP-native helper and scaffold it
- [x] Add `github-mcp` capability metadata in `.pi/settings.json`
- [x] Extend doctor for MCP policy/helper/profile/config drift
- [x] Align targeted integration tests and scaffold parity checks
- [x] Address review follow-up by adding MCP-first guidance to `/parallel-wave` and tightening `github-mcp` tool validation

## Files Changed
- `AGENTS.md`, `src/templates/pi/AGENTS.md` - canonical MCP-first workflow policy
- `.pi/SYSTEM.md`, `src/templates/pi/SYSTEM.md` - runtime-level MCP-first rule
- `.pi/agents/lead.md`, `src/templates/pi/agents/lead.md` - MCP-aware routing guidance and helper list
- `.pi/skills/subagent-workflow/SKILL.md`, template mirror - artifact/contract guidance for MCP execution surface
- `.pi/prompts/{feat-change,plan-change,ship-change,review-change,parallel-wave}.md`, template mirrors - routed MCP-first prompt guidance
- `.pi/agents/github-operator.md`, `src/templates/pi/agents/github-operator.md` - GitHub MCP-native helper
- `.pi/settings.json`, `src/templates/pi/settings.json` - `github-mcp` tool profile
- `src/generators/pi.ts` - scaffold the new helper
- `src/commands/doctor.ts` - MCP-first policy/helper/profile/config drift detection
- `README.md`, `src/templates/root/README.md`, `docs/pi-subagent-workflow.md` - explain GitHub MCP helper usage
- `tests/integration/{init,cli-init,scaffold-snapshots,docs-alignment,doctor}.test.ts` - focused verification coverage

## Decisions
- Use `github-operator` as the MCP-native helper name because it covers PRs, issues, branches, and repo metadata better than a research-only name.
- Reuse `investigate-fast` as the model profile to avoid introducing unnecessary new model-profile taxonomy.
- Keep MCP config unchanged in `.pi/mcp.json`; the important change is helper/profile/policy coupling and drift detection.

## Open Questions
- Whether future MCP-backed domains should follow the same `*-operator` naming pattern.
- Whether doctor should eventually parse `.pi/mcp.json` structurally instead of relying on token checks.

## Requested Follow-up
none

## Verification Evidence
- RED/updated suite: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- GREEN/refined suite: `pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/beads-wrapper.test.ts tests/integration/doctor.test.ts`
- Type safety: `pnpm typecheck`

## Caller Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/beads-wrapper.test.ts tests/integration/doctor.test.ts`
- `pnpm typecheck`

## Escalate If
- Pi MCP tool declaration semantics require a more specific `mcp:github/...` surface than the current helper declaration.
- Future work needs automatic model switching rather than runtime-facing advisory `modelProfile` guidance.
