# Review Verdict

## Work Item
`pi-harness-vyv.7`

## Summary
This re-review looks materially better than the prior pass.

The MCP-first policy is now coherent across the requested canonical surfaces: `AGENTS.md`, `.pi/SYSTEM.md`, `.pi/agents/lead.md`, `.pi/skills/subagent-workflow/SKILL.md`, and the routing prompts now include the missing `/parallel-wave` guidance alongside `feat-change`, `plan-change`, `ship-change`, and `review-change`.

The GitHub helper/config path is also coherent at the scoped level:
- `.pi/agents/github-operator.md` explicitly declares `mcp:github`
- `.pi/settings.json` now has a dedicated `github-mcp` tool profile with `npm:pi-mcp-adapter`
- `.pi/mcp.json` keeps the GitHub server wiring, token interpolation, `directTools: true`, and `lifecycle: "lazy"`
- `src/generators/pi.ts` scaffolds the helper
- `src/commands/doctor.ts` now checks the helper/profile/config coupling instead of only the older partial baseline

Targeted integration coverage also moved in the right direction. `init`, `cli-init`, `scaffold-snapshots`, `docs-alignment`, and `doctor` all encode the new helper/policy baseline, and `doctor.test.ts` now includes the follow-up cases that were previously missing.

Net: I do not see a remaining code-level coherence blocker in the requested scope. The only meaningful remaining risks are:
1. `doctor` still relies on substring checks for `.pi/mcp.json` and some prompt/policy drift, so semantically broken but text-preserving config changes could still slip through.
2. The handoff still does not include attached passing command output, so final closure should wait for caller-side verification of the focused suite and typecheck.

## Inputs Consumed
Artifacts reviewed:
- `bd show pi-harness-vyv.7 --json`
- `context.md`
- `plan.md`
- `wave.md`
- `progress.md`
- previous `review.md`

Scoped file reads:
- `AGENTS.md`
- `.pi/SYSTEM.md`
- `.pi/agents/lead.md`
- `.pi/skills/subagent-workflow/SKILL.md`
- `.pi/prompts/feat-change.md`
- `.pi/prompts/plan-change.md`
- `.pi/prompts/ship-change.md`
- `.pi/prompts/review-change.md`
- `.pi/prompts/parallel-wave.md`
- `.pi/agents/github-operator.md`
- `.pi/settings.json`
- `.pi/mcp.json`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/cli-init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`

Read-only commands reviewed:
- `git status --short`
- `git diff -- ...` across the scoped workflow/helper/doctor/test files
- `git log --oneline --decorate -n 5`
- targeted grep across integration tests for MCP/helper coverage

## Handoff Compliance
Mostly compliant in the reviewed slice.

Validated:
- Active Beads issue context is carried consistently as `pi-harness-vyv.7`.
- Cognee fallback is recorded as unavailable and local repo evidence was used.
- `progress.md` is now issue-specific, includes Allowed Files / Non-Goals / Decisions / verification commands, and reflects the latest follow-up.
- Reviewed changes stay within the documented scope for this issue.

Minor miss:
- `progress.md` still does not carry an explicit `Execution Surface` field even though the subagent-workflow contract calls for it when MCP policy matters.

## Test-First Trace
Mostly evident, with one remaining evidence gap.

What is evident:
- `plan.md` chooses a hybrid strategy led by targeted TDD-style integration drift checks.
- `progress.md` now records RED, GREEN, and REFACTOR intent plus the focused command set.
- The changed tests line up with the implementation delta:
  - policy/routing expectations in `init` and snapshot/docs coverage
  - helper/profile/config drift checks in `doctor`
  - scaffold path coverage in `cli-init`
- The latest follow-up specifically addressed the prior review gaps: `/parallel-wave` guidance and tighter `github-mcp` tool validation.

What is still not directly evidenced:
- No test transcript is attached in-repo, so I can validate the shape of RED -> GREEN -> REFACTOR, but not independently confirm the final pass without caller-side execution.

## Decisions
The caller can treat these points as validated:
- The MCP-first workflow policy is now consistently represented across the requested routing and canonical instruction surfaces.
- The repository now has an explicit GitHub MCP-native helper path instead of relying on implicit shell fallback.
- Helper/config drift detection is coherent at the requested scope: helper file, tool profile, package requirement, MCP server wiring, direct tools, and lazy lifecycle are all checked.
- Scaffold generation includes the new helper and the targeted integration suite was updated to encode that baseline.
- The latest follow-up resolved the prior prompt-routing coherence gap around `/parallel-wave`.

## Open Questions
- Do we want a later hardening pass where `doctor` parses `.pi/mcp.json` structurally instead of relying on token checks?
- Do we want to attach focused test/typecheck output to the Beads closeout, or is caller-run verification at close time sufficient for this repository?

## Requested Follow-up
Owner: caller
Scope: read-only verification evidence for
- `tests/integration/init.test.ts`
- `tests/integration/cli-init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `src/commands/doctor.ts` via `pnpm typecheck`

Provide current output for:
```bash
pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts
pnpm typecheck
```

## Risks
- **Substring-based drift detection:** `doctor` still checks `.pi/mcp.json` and some policy surfaces via string presence, so structurally wrong but text-preserving edits could evade detection.
- **Verification-evidence risk:** the reviewed artifacts name the intended verification commands, but they do not include the actual passing output yet.

## Gaps
- No structural `.pi/mcp.json` validation yet.
- No attached focused test/typecheck transcript yet.
- Minor artifact-contract gap: MCP-related handoff notes still omit an explicit `Execution Surface` field.

## Caller Verification
```bash
pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts
pnpm typecheck
```

## Escalate If
- The focused suite or typecheck fails.
- A live Pi runtime check shows `mcp:github` is not actually exposed via the current `directTools` semantics.
- The repository now requires structural MCP config validation rather than the current token-based doctor checks; that should go back to planning as a deliberate hardening slice.
