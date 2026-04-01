## BDD Workflow Pattern

Add or update behavior-first coverage when a change affects user-visible workflows.

- this repo keeps behavior contracts under `apps/cli/features/`
- feature work starts with a `.feature` file and, when the work is non-trivial, a colocated `.plan.md`
- executable BDD specs live next to the feature contract as `.spec.ts`
- keep shared step helpers or support utilities under `apps/cli/features/steps/` or `apps/cli/features/support/`
- keep feature coverage aligned with executable regression tests in `tests/`
- prefer updating existing feature structure over creating parallel roots
- for TypeScript and Vitest repos, run the dedicated BDD lane with `pnpm test:bdd`
- RED means a failing BDD or unit test run that fails for the right reason before production code changes
- GREEN means the smallest implementation needed to satisfy the scenario or test
- REFACTOR keeps both the BDD lane and the regression lane green
