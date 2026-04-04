# Testing Patterns

**Analysis Date:** 2026-04-04

## Test Framework

**Runner:**
- Vitest `^4.0.18` from `package.json`.
- Source/integration config: `vitest.config.ts`
- BDD config: `vitest.bdd.config.ts`

**Assertion Library:**
- Vitest built-ins via `expect`, `describe`, `it`, `beforeAll`, and `afterAll`.

**Run Commands:**
```bash
pnpm test              # Run unit and integration regression tests in `tests/**/*.test.ts`
pnpm test:bdd          # Run BDD specs in `apps/cli/features/**/*.spec.ts`
pnpm test:watch        # Watch the default Vitest suite
pnpm test:bdd:watch    # Watch the BDD suite
pnpm test:smoke:dist   # Build `dist/` and smoke-test the compiled CLI/scripts
pnpm typecheck         # Type-level verification used alongside tests
```

## Test File Organization

**Location:**
- Unit and integration tests live under `tests/`.
- Behavior-first executable specs live under `apps/cli/features/`.
- Script/build smoke checks live in `scripts/` and are executed by package scripts rather than the default Vitest suite.

**Naming:**
- `tests/unit/*.test.ts` for focused helpers such as `tests/unit/template-loader.test.ts`, `tests/unit/project-context.test.ts`, and `tests/unit/opencode-skill.test.ts`.
- `tests/integration/*.test.ts` for command, script, and scaffold regression tests such as `tests/integration/init.test.ts`, `tests/integration/doctor.test.ts`, and `tests/integration/land-script.test.ts`.
- `apps/cli/features/<feature>/<feature>.feature` plus `<feature>.spec.ts` for BDD, for example `apps/cli/features/init/init.feature` and `apps/cli/features/init/init.spec.ts`.
- Shared BDD helpers live under `apps/cli/features/steps/` and `apps/cli/features/support/`.

**Structure:**
```text
tests/
├── unit/
│   ├── cleanup.test.ts
│   ├── local-launcher.test.ts
│   ├── opencode-skill.test.ts
│   ├── port-detection.test.ts
│   ├── project-context.test.ts
│   └── template-loader.test.ts
├── integration/
│   ├── init.test.ts
│   ├── doctor.test.ts
│   ├── install-skill.test.ts
│   ├── bootstrap-worktree.test.ts
│   ├── land-script.test.ts
│   ├── scaffold-snapshots.test.ts
│   └── __snapshots__/
└──
apps/cli/features/
├── adoption/
│   ├── adoption.feature
│   └── adoption.spec.ts
├── init/
│   ├── init.feature
│   └── init.spec.ts
├── steps/
│   ├── adoption.steps.ts
│   ├── init.steps.ts
│   └── index.ts
└── support/
    └── world.ts
```

## Test Structure

**Suite Organization:**
```typescript
// `tests/integration/init.test.ts`
describe('runInit', () => {
  it('creates the scaffold for a new project', async () => {
    const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-'));
    const result = await runInit({ /* ... */ });

    expect(result.createdPaths).toContain('.codex/README.md');
  });
});
```

**BDD Organization:**
```typescript
// `apps/cli/features/init/init.spec.ts`
const feature = await loadFeature('apps/cli/features/init/init.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Create a new project scaffold into a new directory', ({ Given, When, Then, And }) => {
    // step wiring through `apps/cli/features/steps/init.steps.ts`
  });
});
```

**Patterns:**
- Setup is usually per-test using `mkdtemp(...)`, fresh directories, and real filesystem state.
- Cleanup is explicit with `rm(..., { recursive: true, force: true })` or BDD `afterAll(...)` disposal in `apps/cli/features/init/init.spec.ts` and `apps/cli/features/adoption/adoption.spec.ts`.
- Assertions are file-content oriented: `toContain`, `toBe`, `toEqual(expect.arrayContaining(...))`, and `rejects.toThrow()` dominate.
- Tests prefer end-to-end command execution or public function calls over internal implementation peeking.

## Mocking

**Framework:**
- No module-mocking pattern is detected. There is no `vi.mock`, `vi.spyOn`, or Jest mock usage in `tests/` or `apps/`.

**Patterns:**
```typescript
// `tests/integration/cli-init.test.ts`
await writeFile(path.join(binDir, 'pre-commit'), '#!/usr/bin/env bash ...');
const result = await execFile(process.execPath, [tsxCli, 'src/cli.ts', '--assistant', 'codex', targetDir], {
  env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ''}` }
});
```

```typescript
// `tests/integration/land-script.test.ts`
await writeFile(path.join(binDir, 'gh'), '#!/usr/bin/env bash ...');
await writeFile(path.join(binDir, 'pnpm'), '#!/usr/bin/env bash ...');
const result = await execFile(path.join(repoDir, '.codex', 'scripts', 'land.sh'), [], { /* ... */ });
```

**What to Mock:**
- Prefer process-level seams by creating temporary files, temporary repos, and stub executables on `PATH`.
- Fake external CLIs (`gh`, `pnpm`, `pre-commit`, `bd`) with short shell scripts when the contract being tested is command orchestration.

**What NOT to Mock:**
- Do not mock the filesystem, Git, or the public command functions when the test is about scaffold behavior. The existing suite intentionally exercises real temp directories, real `git` repos/worktrees, and real shell execution.
- Do not replace generated document content with hand-built fixtures unless the test is specifically about merge or alignment logic.

## Fixtures and Factories

**Test Data:**
```typescript
// `apps/cli/features/support/world.ts`
export async function createCliFeatureWorld(prefix: string): Promise<CliFeatureWorld> {
  return {
    workspace: await mkdtemp(path.join(os.tmpdir(), prefix))
  };
}
```

```typescript
// `tests/integration/scaffold-snapshots.test.ts`
async function snapshotForProject(rootDir: string, includeCodex: boolean) {
  return {
    files: await collectFiles(rootDir),
    'README.md': await readFile(path.join(rootDir, 'README.md'), 'utf8'),
    '.codex/README.md': await readFile(path.join(rootDir, '.codex', 'README.md'), 'utf8')
  };
}
```

**Location:**
- BDD shared world/fixture helpers: `apps/cli/features/support/world.ts`
- Step-specific fixture creation: `apps/cli/features/steps/*.steps.ts`
- Per-file integration fixtures stay local to the spec, for example `createLandFixture()` in `tests/integration/land-script.test.ts` and `collectFiles()` in `tests/integration/scaffold-snapshots.test.ts`.

## Coverage

**Requirements:**
- None enforced. `vitest.config.ts` and `vitest.bdd.config.ts` do not define coverage thresholds or reporting.
- The practical quality gate is command-specific: `pnpm typecheck`, `pnpm test`, `pnpm test:bdd`, and `pnpm test:smoke:dist` as documented in `.codex/README.md` and exercised by `tests/integration/land-script.test.ts`.

**View Coverage:**
```bash
Not configured
```

## Test Types

**Unit Tests:**
- Cover deterministic pure helpers and small domain modules.
- Examples:
  - `tests/unit/template-loader.test.ts` covers token substitution, newline normalization, and path traversal rejection.
  - `tests/unit/project-context.test.ts` covers project-name and mode inference.
  - `tests/unit/port-detection.test.ts` covers port-validation failures.
  - `tests/unit/opencode-skill.test.ts` covers OpenCode install entry construction.

**Integration Tests:**
- Cover full command behavior with real temp directories and generated files.
- Examples:
  - `tests/integration/init.test.ts` validates new-project creation, existing-repo adoption, cleanup behavior, worktree bootstrap files, and legacy-artifact removal.
  - `tests/integration/doctor.test.ts` validates OMO alignment checks, stale GSD detection, executable bit warnings, and deprecated artifact warnings.
  - `tests/integration/install-skill.test.ts` validates generated global skill files, merged `oh-my-opencode.json`, and managed workflow content.

**CLI Tests:**
- Execute `tsx src/cli.ts ...` as a subprocess to verify human-readable output and JSON output, for example `tests/integration/cli-help.test.ts`, `tests/integration/cli-init.test.ts`, `tests/integration/cli-doctor.test.ts`, and `tests/integration/cli-install-skill.test.ts`.

**Script Tests:**
- Exercise shipped shell scripts directly with temp repos and stubbed binaries.
- Examples:
  - `tests/integration/bootstrap-worktree.test.ts` runs `.codex/scripts/bootstrap-worktree.sh` and `.beads/hooks/post-checkout`.
  - `tests/integration/land-script.test.ts` runs `.codex/scripts/land.sh` and validates branch/PR behavior.

**BDD Tests:**
- Cover user-visible scaffold workflows through `.feature` files and cucumber-style steps.
- `apps/cli/features/init/*` covers new-project creation and dry-run behavior.
- `apps/cli/features/adoption/*` covers preserve-by-default adoption, root-file merge opt-in, cleanup reporting, and assistant-target selection.

**Smoke / Dist Tests:**
- `scripts/dist-smoke.mjs` validates the compiled CLI in `dist/src/cli.js`, verifies template copies under `dist/src/templates`, and runs both scaffold and install-skill smoke flows.
- `pnpm test:smoke:dist` is the only built-artifact verification lane defined in `package.json`.

**E2E/UI Tests:**
- Not used. There is no browser/UI layer in this repository.

## How Template And Scaffold Behavior Is Verified

**Source-template verification:**
- `tests/unit/template-loader.test.ts` verifies template lookup from `src/templates/**`, token substitution, and path-safety rules.
- `tests/integration/docs-alignment.test.ts` compares live repo docs and `src/templates/**` documents to ensure OMO/Cognee/landing guidance stays synchronized.
- `tests/integration/scaffold-snapshots.test.ts` generates full scaffolds with `runInit()` and snapshots emitted files plus selected document contents.

**Generator/adoption verification:**
- `tests/integration/init.test.ts` and `apps/cli/features/adoption/*` verify `createdPaths`, `skippedPaths`, cleanup removal, and preserve-by-default behavior.
- `tests/integration/doctor.test.ts` verifies the generated repo is auditable against current OMO alignment and stale-GSD rules.

**Built-dist verification:**
- `scripts/dist-smoke.mjs` checks that `dist/src/cli.js` exists, `dist/src/templates` exists, and the built CLI can run `--help`, scaffold dry-run/new-project flows, and `install-skill`.
- `tests/unit/local-launcher.test.ts` verifies the launcher prefers `dist/src/cli.js` and falls back to `src/cli.ts` only when needed.

**Important boundary:**
- Most tests validate source behavior through `runInit()` or `tsx src/cli.ts ...`.
- Only `pnpm test:smoke:dist` and launcher tests validate the built `dist/` surface directly.

## Common Patterns

**Async Testing:**
```typescript
const workspace = await mkdtemp(path.join(os.tmpdir(), 'ai-harness-'));
const result = await runInit({ /* ... */ });
await expect(readFile(path.join(workspace, 'app', '.planning', 'STATE.md'), 'utf8')).rejects.toThrow();
```

**Error Testing:**
```typescript
// `tests/unit/port-detection.test.ts`
expect(() =>
  resolvePorts({ detectPorts: false, doltPort: 5432, cogneeDbPort: 5432, /* ... */ })
).toThrow('must be different');
```

**Snapshot Testing:**
```typescript
// `tests/integration/scaffold-snapshots.test.ts`
expect(result).toMatchSnapshot();
```

## Notable Gaps And Fragile Areas For Pi Transition

**No Pi-specific test surface exists:**
- `src/core/types.ts` only allows `'codex' | 'opencode'`.
- `src/cli.ts` only parses `auto`, `codex`, and `opencode`.
- `src/commands/install-skill.ts` throws unless the assistant is `opencode`.
- There are no tests for a `pi` assistant mode, Pi-specific runtime artifacts, or a Pi-managed global config path.

**OMO assumptions are actively enforced by tests:**
- `tests/integration/doctor.test.ts` and `tests/integration/docs-alignment.test.ts` fail if OMO references disappear from `AGENTS.md`, `.codex/README.md`, `.rules/patterns/omo-agent-contract.md`, or `.codex/workflows/autonomous-execution.md`.
- A Pi migration will need coordinated test rewrites, not just code changes.

**Built-artifact coverage is smoke-level only:**
- `scripts/dist-smoke.mjs` proves that compiled artifacts run, but it does not diff `dist/templates` against `src/templates` or assert every generated document path.
- A migration that changes generated runtime text could pass source tests while still leaving stale copied artifacts if `pnpm build` is skipped.

**Global OpenCode install path dominates integration coverage:**
- `tests/integration/install-skill.test.ts` heavily validates `oh-my-opencode.json` and `get-shit-done/workflows/autonomous.md`.
- There is no parallel install test seam for a future Pi runtime, so any replacement will need a new test matrix rather than minor edits.

**Coverage reporting is absent:**
- No threshold catches untested migration code automatically.
- Future Pi work should assume missing tests unless explicitly added.

**Planning-surface changes have no existing default scaffold tests:**
- `src/generators/planning.ts` returns `[]`, and current tests mostly assert the absence of default `.planning` files.
- If Pi reintroduces a different planning/runtime surface, new tests will be required because the current suite is optimized for “no default planning scaffold.”

---

*Testing analysis: 2026-04-04*
