# Progress

## Work Item
`untracked`

## Status
Completed

## Test Strategy
TDD.
- Cognee brief status: skipped because the issue was already localized to the MCP/tooling scaffold surfaces.

## Inputs Consumed
- `wave.md`
- `.pi/settings.json`
- `.pi/mcp.json`
- `.pi/agents/lead.md`
- `.pi/agents/github-operator.md`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`

## Routing Alignment
- `wave.md` present: yes
- Alignment: aligned
- Notes: kept the fix scoped to the workflow/runtime contract so `lead` can use GitHub MCP in actual Pi runtime, without changing settings beyond the orchestrator profile or broadening into extension/runtime rewrites.

## Execution Surface
shell fallback with reason — local repository implementation and verification only; no MCP-backed action was required to fix the scaffold contract.

## Allowed Files
- `.pi/settings.json`
- `.pi/agents/lead.md`
- `src/templates/pi/settings.json`
- `src/templates/pi/agents/lead.md`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`

## Non-Goals
- no `.pi/extensions/*.ts` changes
- no `.pi/mcp.json` changes
- no changes to `github-operator`
- no attempt to make this API session itself expose `mcp:github`
- no product code or release workflow changes

## Tasks
- [x] Added `mcp:github` to the orchestrator tool profile used by `lead`
- [x] Added `npm:pi-mcp-adapter` as an explicit orchestrator profile package requirement
- [x] Clarified in `lead` guidance that small direct GitHub MCP actions can be handled by `lead`
- [x] Tightened doctor validation for orchestrator MCP support
- [x] Added/updated integration expectations for lead MCP access
- [x] Verified targeted integration suite and typecheck

## Files Changed
- `.pi/settings.json` - added `mcp:github` and `npm:pi-mcp-adapter` to the `orchestrator` tool profile so `lead` can use GitHub MCP directly in Pi runtime.
- `.pi/agents/lead.md` - clarified that `lead` may handle one small direct GitHub MCP action when delegation overhead is higher.
- `src/templates/pi/settings.json` - mirrored orchestrator MCP support into scaffold templates.
- `src/templates/pi/agents/lead.md` - mirrored lead guidance into scaffold templates.
- `src/commands/doctor.ts` - now validates that the orchestrator profile includes `mcp:github` and `npm:pi-mcp-adapter`.
- `tests/integration/doctor.test.ts` - added regression coverage for losing `mcp:github` from the orchestrator profile.
- `tests/integration/init.test.ts` - asserted scaffolded settings expose `mcp:github` for lead.
- `tests/integration/scaffold-snapshots.test.ts` - asserted scaffolded lead guidance and orchestrator capability presence.
- `tests/integration/docs-alignment.test.ts` - asserted updated lead guidance stays mirrored.

## Decisions
- The right fix is scaffold/runtime contract alignment, not shell fallback policy changes.
- `lead` should gain direct GitHub MCP access through the `orchestrator` profile while `github-operator` remains the default bounded helper for richer GitHub workflows.
- This repair improves actual Pi runtime behavior in baked repos, but cannot retroactively add `mcp:github` to this API session’s fixed tool surface.

## Open Questions
- none

## Requested Follow-up
none

## Verification Evidence
- RED intent: without this change, `lead` inherited the `orchestrator` profile without `mcp:github`, which blocked direct GitHub MCP use in scaffolded Pi runtime.
- GREEN: `pnpm test -- tests/integration/doctor.test.ts -t "orchestrator profile loses mcp:github support for lead"`
- REFACTOR: `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts` and `pnpm typecheck`

## Caller Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- `pnpm typecheck`

## Escalate If
- actual Pi runtime still cannot see `mcp:github` after reloading the repo, which would point to runtime login/server/env issues rather than scaffold contract drift
- the team wants `lead` to be the default merger/operator for all GitHub work instead of only small direct MCP actions
