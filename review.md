# Review Verdict

## Work Item
`untracked`

## Summary
The implementation appears correct for the scoped fix.

What looks solid:
- `lead` now gets GitHub MCP access through the `orchestrator` tool profile in both repo-local runtime settings and scaffold templates (`.pi/settings.json`, `src/templates/pi/settings.json`).
- The runtime contract actually uses that profile: `lead` still declares `toolProfile: orchestrator`, and `.pi/extensions/role-workflow.ts` merges profile tools with agent frontmatter tools before setting active tools.
- Existing GitHub helper behavior is preserved. `github-operator` remains present, unchanged, MCP-first, and still the default route for explicit GitHub/MCP work, with `lead` only allowed to do small direct MCP actions when delegation overhead is higher.
- Verification coverage is reasonably strong for a scaffold/runtime-contract change: doctor regression, scaffold/init assertions, snapshot assertions, and docs-alignment checks all moved with the change.

What is weaker:
- `plan.md` in the repo is stale and unrelated to this work item, so the handoff trace relies on `wave.md` and `progress.md`, not a task-matching plan artifact.
- I found no regression test that specifically removes `npm:pi-mcp-adapter` from the `orchestrator` profile, even though `doctor.ts` now validates that requirement.
- RED/GREEN execution is described in `progress.md`, but this review did not have stored command output proving those commands were actually run.

## Inputs Consumed
Artifacts and files reviewed:
- `wave.md`
- `plan.md`
- `progress.md`
- `.pi/settings.json`
- `.pi/agents/lead.md`
- `.pi/agents/github-operator.md`
- `.pi/extensions/role-workflow.ts`
- `.pi/mcp.json`
- `src/templates/pi/settings.json`
- `src/templates/pi/agents/lead.md`
- `src/templates/pi/agents/github-operator.md`
- `src/generators/pi.ts`
- `src/commands/doctor.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `README.md`
- `src/templates/root/README.md`

Read-only commands reviewed:
- `git status --short`
- `git diff -- .pi/settings.json .pi/agents/lead.md src/templates/pi/settings.json src/templates/pi/agents/lead.md src/commands/doctor.ts tests/integration/doctor.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts`

## Routing Alignment
- `wave.md` present: yes
- Alignment: aligned
- Notes: the implementation stayed inside the wave-scoped contract: settings/profile change, lead guidance clarification, doctor coverage, and scaffold/template parity. However, `plan.md` is not for this work item, so artifact traceability is only partially aligned and should be cleaned up by `lead` if strict handoff hygiene is required.

## Execution Surface
shell fallback with reason — read-only repository inspection and git diff review; no MCP-native review action was required.

## Handoff Compliance
Mostly compliant.
- The changed files stayed inside the file fence implied by `wave.md`/`progress.md`.
- Non-goals were honored: no `.pi/mcp.json` changes, no `github-operator` edits, no extension rewrites.
- The current routing contract was respected.

Handoff gaps:
- `plan.md` does not describe this task.
- There is an unrelated untracked `github.md` in the worktree, which is harmless to the fix itself but adds workflow noise.

## Test-First Trace
Scoped TDD is evident, but not fully proven.
- RED intent is visible from the newly added negative doctor regression: `fails when the orchestrator profile loses mcp:github support for lead`.
- GREEN is visible in the paired settings/template changes plus doctor enforcement.
- REFACTOR coverage is visible in broader scaffold/init/docs tests.

What is missing is execution evidence: the artifact trail states the RED/GREEN/REFACTOR commands were run, but this review only saw the assertions and diffs, not test output.

## Decisions
The caller can treat these points as validated:
- `lead` now inherits `mcp:github` via the `orchestrator` capability profile in both repo-local and template settings.
- The scaffold/runtime contract path is real, not just documentation: `role-workflow` resolves tool-profile tools into the active role tool set.
- `github-operator` behavior remains preserved as the default GitHub MCP helper.
- The change is covered by multiple static/integration checks, so regressions in settings, scaffold output, or lead guidance are likely to surface.

## Open Questions
- Were the claimed verification commands actually run successfully in this session? The artifacts say yes, but no command output was preserved.
- Should there also be an explicit regression test for losing `npm:pi-mcp-adapter` from `orchestrator`, since `doctor.ts` now treats that as required?

## Requested Follow-up
none

## Risks
- A future edit could remove `npm:pi-mcp-adapter` from `orchestrator` without tripping a dedicated regression test; only the doctor implementation currently guards that path.
- This fix does not guarantee live runtime success if Pi is not logged in, the GitHub MCP server is unavailable, or env/config is missing outside the scaffold contract.
- Stale workflow artifacts (`plan.md`, untracked `github.md`) may confuse later routing or review.

## Gaps
- No task-specific `plan.md` for this work item.
- No stored evidence of actual RED/GREEN/REFACTOR command execution.
- No dedicated negative test for the new orchestrator package requirement.
- No end-to-end runtime check proving a reloaded Pi session exposes `mcp:github` to `lead` after role activation.

## Caller Verification
Run the scoped suite the handoff names:
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`

If you want the narrowest live check after that, reload Pi in a scaffolded repo, switch to `lead`, and confirm the capability prompt/resolved tools include `mcp:github`.

## Escalate If
- the scoped integration suite fails,
- `doctor` no longer reports loss of `mcp:github` from `orchestrator`,
- `github-operator` stops being the default GitHub/MCP helper route,
- or a reloaded Pi runtime still cannot expose `mcp:github` to `lead`, which would indicate a deeper runtime/config issue beyond this scaffold fix.
