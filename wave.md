# Execution Approach

## Mode
Saved chain

## Work Item
`untracked`

Beads status:
- `bd ready --json` returned `[]`, so no active ready issue was available to claim for this request.

## Knowledge
- Cognee: skipped.
- Reason: the bug is already localized by repository evidence from targeted reads, so a Cognee brief would add overhead without reducing uncertainty.
- Repository evidence already consumed:
  - `README.md`
  - `.pi/skills/bake/SKILL.md`
  - `src/generators/root.ts`
  - `src/templates/root/env.example`
  - `src/templates/root/env.example-append.md`
  - `tests/integration/cli-init.test.ts`
  - `tests/integration/init.test.ts`
  - `apps/cli/features/adoption/adoption.spec.ts`
  - `apps/cli/features/steps/adoption.steps.ts`

## Test Strategy
Hybrid, led by a real RED -> GREEN -> REFACTOR loop.

Expected path:
- RED: add or tighten focused regression coverage proving existing-repo root-file merging duplicates `.env.example` entries when the repo already contains scaffold-equivalent variables.
- GREEN: change the `.env.example` merge behavior to append only genuinely missing entries.
- REFACTOR: keep the merge rule readable and aligned with existing root-file merge behavior without broadening scope.

## Decision Rationale
- This is an implementation request with code and tests, so a delegated execution path is preferred over broad main-session editing.
- The project already provides the `ship-change` saved chain for exactly this `explore -> plan -> build -> review` workflow.
- Direct mode was rejected because the task touches behavior, merge semantics, and regression coverage across multiple files, and the structured artifacts from the saved chain are worth the overhead.

## Routing Signals
Hard triggers present:
- implementation request with real code/test work
- structured artifacts are useful (`context.md`, `plan.md`, `progress.md`, `review.md`)
- multiple roles and verification stages are involved

Soft triggers present:
- more than 3 files are likely relevant
- acceptance should be pinned down through existing BDD/integration coverage
- the next best step is specialist recon/planning/implementation rather than more lead-session digging

Why this split is safe:
- the saved chain keeps ownership explicit by role
- the likely file fence is compact and local to root-file merge logic plus targeted regression tests
- no MCP path is required; execution is local repository work

## Agents / Chains
- `ship-change` (project saved chain)
  - `explore`: confirm the precise failing merge path and bounded file fence
  - `plan`: choose the narrowest RED coverage and implementation slice
  - `build`: implement the fix within the fenced files
  - `review`: validate scope, risks, and caller verification

## Delegation Units

### Delegation Unit: explore-plan-build-review-env-example-merge
- Owner: `ship-change`
- Goal: fix `.env.example` merge behavior so existing-repo bake refreshes do not duplicate scaffold entries already present in the file.
- Allowed Files:
  - `src/generators/root.ts`
  - `src/templates/root/env.example-append.md`
  - `tests/integration/cli-init.test.ts`
  - `tests/integration/init.test.ts`
  - `apps/cli/features/adoption/adoption.spec.ts`
  - `apps/cli/features/steps/adoption.steps.ts`
- Non-Goals:
  - do not change provider/model runtime policy
  - do not broaden into unrelated bake/adopt cleanup behavior
  - do not change `.env.example` placeholder values except as required by the merge contract
  - do not run project-wide verification in child steps beyond narrow scoped RED/GREEN checks
- Inputs:
  - `wave.md`
  - targeted reads already identified above
- Output:
  - `context.md`, `plan.md`, `progress.md`, `review.md`
- RED:
  - choose the narrowest failing regression that demonstrates duplicate `.env.example` entries during existing-repo merge mode
- Caller Verification:
  - rerun the scoped tests selected by the chain, then confirm merged `.env.example` keeps existing content without duplicate scaffold keys
- Escalate If:
  - fixing the bug requires changing shared scaffold contracts outside the bounded root merge/test surfaces
  - the duplication is actually caused by a different layer than `src/generators/root.ts`

## Verification
Expected caller-side verification will be a focused test command selected by the chain, likely around:
- `tests/integration/cli-init.test.ts`
- `tests/integration/init.test.ts`
- any targeted adoption BDD coverage if needed

## Risks
- A naive duplicate filter could incorrectly preserve stale scaffold values when the intent is to add newer required keys only.
- Existing tests currently prove append behavior, but may not yet distinguish append-without-duplication from blind block append.
- The merge behavior should stay narrow so it does not accidentally reorder or normalize user-managed `.env.example` content.
