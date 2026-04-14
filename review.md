# Review Verdict

## Work Item
`pi-harness-vyv.6`

## Summary
The workflow expansion is coherent and internally consistent across dogfood `.pi/*`, scaffold templates, runtime settings, and doctor/test coverage. The main strengths are the new structured handoff contract, bounded middle-tier collaboration rules, runtime-facing capability profiles, and the new doctor checks for role-workflow registration plus web-access/tool-profile drift.

## Test-First Trace
- RED observed with targeted integration expectations before implementation via:
  - `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- GREEN confirmed after updating workflow assets, settings, extension logic, and doctor enforcement.
- REFACTOR completed by mirroring dogfood/template files and tightening related docs/prompts/skills.

## Inputs Consumed
- `git diff`
- `plan.md`
- `wave.md`
- `docs/pi-agentic-workflow-design.md`
- targeted verification output recorded in the session

## Handoff Compliance
- Structured handoff sections now appear across the shared workflow skill, role prompts, helper prompts, and the planning/review prompts.
- Ownership boundaries stay explicit through `Allowed Files`, `Non-Goals`, `Requested Follow-up`, and `Escalate If`.
- `build` remains leaf-based while `lead`, `explore`, `plan`, and `review` gain bounded collaboration rather than open-ended recursion.

## Risks
- `modelProfile` is intentionally advisory/runtime-facing; the extension API still does not directly set the active model, so real provider/model binding remains a user-runtime concern.
- `role-workflow.ts` now depends on `.pi/settings.json` as structured JSON. If users heavily customize that file, malformed JSON will break profile loading and doctor will fail as intended.
- The workflow surface is broader now, so future drift between dogfood and template files will be costly unless the current targeted verification stays in regular use.

## Gaps
- No dedicated BDD feature was added because the shipped behavior is scaffold/runtime-asset alignment rather than a new CLI user journey.
- `review.md` is caller-authored here because the delegated review run returned an empty artifact.

## Caller Verification
- `pnpm typecheck`
- `pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/beads-wrapper.test.ts tests/integration/doctor.test.ts`

## Escalate If
Return to planning if future work needs automatic runtime model switching rather than advisory capability profiles, because that may require Pi extension APIs beyond the current scaffold contract.
