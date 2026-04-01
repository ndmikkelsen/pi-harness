# CLI BDD Workflow Guide

This repository uses executable Gherkin for user-visible CLI behavior.

## File Shape

- `apps/cli/features/<domain>/<feature>.feature` - behavior contract in Gherkin
- `apps/cli/features/<domain>/<feature>.plan.md` - implementation notes and scenario mapping
- `apps/cli/features/<domain>/<feature>.spec.ts` - executable BDD spec using `@amiceli/vitest-cucumber`
- `apps/cli/features/steps/*.steps.ts` - shared helpers for reusable feature steps
- `apps/cli/features/support/*.ts` - shared world and fixtures

## Workflow

1. Write or update the `.feature` file first.
2. Add or update the colocated `.plan.md` when the work is non-trivial.
3. Write a failing `.spec.ts` scenario or supporting unit test.
4. Implement the smallest change that makes the scenario pass.
5. Refactor while keeping both BDD and regression lanes green.

## Commands

```bash
pnpm test
pnpm test:bdd
pnpm test -- tests/integration/init.test.ts
pnpm test:bdd -- apps/cli/features/init/init.spec.ts
```

Use the BDD lane for end-to-end CLI behavior. Keep deep edge cases and lower-level assertions in `tests/`.
