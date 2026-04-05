## BDD Workflow Pattern

Add or update behavior-first coverage when a change affects user-visible workflows.

- prefer the repository's existing `.feature` layout instead of inventing a new parallel structure
- in app-based repos, favor app-local feature directories such as `apps/<app>/features/`
- start user-visible feature work with a `.feature` file and, when needed, a colocated `.plan.md`
- colocate executable BDD specs as `.spec.ts` beside the feature contract
- keep step helpers and support code close to shared test infrastructure instead of ad hoc `.features/` roots
- pair feature coverage with executable regression tests where practical
- for TypeScript and Vitest repos, provide a dedicated BDD lane such as `pnpm test:bdd`
- observe RED before production changes, keep GREEN minimal, and keep REFACTOR inside the tested behavior envelope
