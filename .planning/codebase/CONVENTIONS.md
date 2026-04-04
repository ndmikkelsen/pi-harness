# Coding Conventions

**Analysis Date:** 2026-04-04

## Naming Patterns

**Files:**
- Use lower-case kebab-case filenames for source and tests, for example `src/core/project-input.ts`, `src/core/template-loader.ts`, `tests/integration/scaffold-snapshots.test.ts`, and `apps/cli/features/steps/adoption.steps.ts`.
- Use `.test.ts` for unit/integration regression files under `tests/` and `.spec.ts` for executable BDD specs under `apps/cli/features/`.
- Use `.feature` for behavior contracts, for example `apps/cli/features/init/init.feature` and `apps/cli/features/adoption/adoption.feature`.

**Functions:**
- Use camelCase for functions and helpers, for example `resolveProjectInput` in `src/core/project-input.ts`, `applyManagedEntries` in `src/core/filesystem.ts`, and `formatInstallSkillReport` in `src/commands/install-skill.ts`.
- Thin parsing helpers near the CLI also use camelCase, for example `parseMode`, `parseAssistant`, and `parseDoctorAssistant` in `src/cli.ts`.
- Internal generator helpers are named for the rendered file or concern, for example `operatorWorkflow`, `beadsIntegration`, `codexReadme`, and `opencodeWorktreeConfig` in `src/generators/rules.ts` and `src/generators/codex.ts`.

**Variables:**
- Use descriptive camelCase locals for paths and derived state, for example `targetDir`, `createdPaths`, `cleanupManifestId`, `openCodeDefaultsPath`, and `hasDisabledRecoveryHook` in `src/commands/init.ts` and `src/commands/install-skill.ts`.
- Use SCREAMING_SNAKE_CASE only for exported constants and top-level policy values, for example `AI_HARNESS_VERSION` in `src/core/harness-release.ts`, `DEFAULT_POLICY` in `src/core/policy.ts`, and `OPENCODE_SKILL_NAME` in `src/core/opencode-skill.ts`.

**Types:**
- Use PascalCase for interfaces and type aliases, for example `ScaffoldContext`, `InitResult`, `DoctorResult`, and `CleanupManifestEntry` in `src/core/types.ts`.
- Union types are used instead of stringly-typed free-form values where the domain is fixed, for example `AssistantTarget = 'codex' | 'opencode'` in `src/core/types.ts`.

## Code Style

**Formatting:**
- Tool used: Not detected. No `eslint.config.*`, `.eslintrc*`, `.prettierrc*`, or `biome.json` is present at repo root.
- Observed style in `src/cli.ts`, `src/core/template-loader.ts`, and `src/commands/doctor.ts` is:
  - 2-space indentation
  - semicolons required
  - single quotes
  - trailing commas in multiline objects/arrays only when TypeScript emits them naturally
  - explicit blank lines between import groups and between logical blocks
- Treat the existing source formatting as the de facto convention because there is no formatter config enforcing it.

**Linting:**
- Tool used: Not detected.
- Effective guardrails come from `tsconfig.json` and tests, not lint rules.
- `tsconfig.json` enforces strict TypeScript mode, `forceConsistentCasingInFileNames`, `moduleResolution: "NodeNext"`, and ESM output under `dist/`.

**TypeScript/ESM specifics:**
- Import built-ins through the `node:` prefix, for example `import path from 'node:path';` in `src/commands/init.ts` and `import { readFileSync } from 'node:fs';` in `src/core/template-loader.ts`.
- Use explicit `.js` extensions in internal imports because the repo targets NodeNext ESM, for example `import { buildManagedEntries } from '../generators/index.js';` in `src/commands/init.ts`.
- Prefer named exports over default exports across `src/`, for example `runInit`, `runDoctor`, and `runInstallSkill`.

## Import Organization

**Order:**
1. Node built-ins from `node:*`
2. Third-party packages
3. Repo-internal imports

**Examples:**
- `src/cli.ts` imports `commander` after a blank line following the shebang, then internal modules.
- `src/commands/install-skill.ts` imports Node built-ins first, then `../core/...` modules, then internal types.
- `apps/cli/features/steps/adoption.steps.ts` imports Node built-ins, then `vitest`, then source modules from `src/`.

**Path Aliases:**
- Not detected. All internal imports are relative.

## Error Handling

**Patterns:**
- Reject invalid CLI/user input by throwing explicit `Error` or `InvalidArgumentError` with user-readable messages, for example:
  - `src/cli.ts` rejects unsupported `--mode` and `--assistant` values.
  - `src/core/project-input.ts` rejects non-empty new targets and invalid project names.
  - `src/core/template-loader.ts` rejects path traversal and missing templates.
  - `src/core/port-detection.ts` rejects duplicate or out-of-range ports.
- Keep command-level failures structured when the command is an auditor instead of a mutator. `src/commands/doctor.ts` returns `DoctorResult` with `pass|warn|fail` plus grouped issues rather than throwing on every finding.
- Centralize CLI fatal output in one place. `src/cli.ts` ends with `program.parseAsync(...).catch(...)`, converts unknown failures to a single message, and sets `process.exitCode = 1`.
- Preserve machine-readable failure signaling in JSON modes. `src/cli.ts` sets `process.exitCode` when `runInit` returns blocked cleanup or when `runDoctor` returns `fail`.

**Observed design rule:**
- Use exceptions for invalid inputs and impossible states.
- Use structured return values for expected audit/adoption outcomes such as `createdPaths`, `skippedPaths`, `cleanup.actions`, and `DoctorIssue[]`.

## Logging

**Framework:**
- None in application code. No logger package is used in `src/`.

**Patterns:**
- Commands write final reports directly to stdout/stderr in `src/cli.ts`.
- Tests capture behavior through return values, generated files, and child-process stdout rather than log interception.
- Shell/script behavior is verified by inspecting generated text or stubbed command logs, for example `tests/integration/land-script.test.ts` captures fake `gh` and `pnpm` output into temp files.

## Comments

**When to Comment:**
- Comments are sparse and usually reserved for one of two cases:
  - intentional fallthrough/continue behavior, for example `// continue` in `src/commands/install-skill.ts` and `src/core/template-loader.ts`
  - terse separator comments in tests or scripts when setup is non-obvious
- Prefer clear naming over explanatory comments.

**JSDoc/TSDoc:**
- Not used in `src/`.

## Function Design

**Size:**
- Keep pure helpers small and local when they serve one transformation, for example `looksLikePath` and `directoryHasFiles` in `src/core/project-input.ts` or `mergeUniqueLines` in `src/generators/root.ts`.
- Keep command functions as orchestration entrypoints, for example `runInit` in `src/commands/init.ts` and `runInstallSkill` in `src/commands/install-skill.ts`.
- One notable exception is `runDoctor` in `src/commands/doctor.ts`, which is intentionally large because it aggregates many alignment checks in one place. Treat it as the single doctor policy engine rather than splitting parallel rule systems elsewhere.

**Parameters:**
- Pass explicit options objects into top-level commands and helpers, for example `InitCommandOptions`, `DoctorCommandOptions`, `RunCleanupOptions`, and `ApplyManagedEntriesOptions` in `src/core/types.ts`.
- Avoid positional boolean soup outside private helper scopes.

**Return Values:**
- Return structured result objects with enough detail for both CLI text and JSON output, for example `InitResult`, `DoctorResult`, and `InstallSkillResult` in `src/core/types.ts`.
- Use `string | null` merge helpers to signal no-op versus updated content, for example `mergeOpenCodeDefaults` in `src/core/opencode-skill.ts` and root-file merges in `src/generators/root.ts`.

## Module Design

**Boundaries:**
- `src/cli.ts` is the command-line shell only: parse args, call command modules, print output.
- `src/commands/*.ts` orchestrates workflows and owns report formatting.
- `src/core/*.ts` holds reusable domain logic such as filesystem writes, cleanup, template loading, project-name normalization, and global-skill path helpers.
- `src/generators/*.ts` maps scaffold concerns to `ManagedEntry[]`. Follow the existing concern split: `root`, `codex`, `rules`, `config`, and `project-docs`.
- `src/templates/**` is the canonical scaffold source. Generator code should load from here through `loadTemplate()` instead of embedding large text blobs.
- `scripts/` contains build/distribution helpers, not product logic. `scripts/copy-templates.mjs` mirrors templates into built output and `scripts/dist-smoke.mjs` exercises compiled CLI artifacts.

**Exports:**
- Export only the functions/types that define the module contract.
- Re-export selected command APIs from `src/index.ts`.

**Barrel Files:**
- Minimal usage only. `src/index.ts` is a public surface barrel; `apps/cli/features/steps/index.ts` re-exports step groups for BDD wiring.

## Workflow Conventions That Materially Affect Development

**Enforced by docs and reinforced by tests:**
- Treat `.rules/patterns/omo-agent-contract.md` as normative policy. This is stated in `AGENTS.md`, `.codex/README.md`, `.rules/patterns/operator-workflow.md`, and tested by `tests/integration/docs-alignment.test.ts` plus `tests/integration/doctor.test.ts`.
- Use feature branches and PRs to `dev`, not direct `main`/`dev` pushes. This is documented in `.rules/patterns/git-workflow.md`, `AGENTS.md`, and exercised by `tests/integration/land-script.test.ts`.
- Start from Beads when available: `bd ready --json`, then `bd update <id> --claim --json`, then verify before `bd close`. This is documented in `README.md`, `AGENTS.md`, `.rules/patterns/operator-workflow.md`, and `.rules/patterns/beads-integration.md`.
- For planning/research lanes, attempt Cognee before broad exploration. This is documented in `.rules/patterns/operator-workflow.md` and `.rules/patterns/omo-agent-contract.md`.
- Existing-repo adoption is preserve-by-default. Customize only files listed in `createdPaths`; leave `skippedPaths` alone unless the user explicitly wants managed file regeneration. This is documented in `docs/harness-usage.md` and encoded in `src/core/filesystem.ts`.

**Documented but not hard-enforced by code:**
- `docs/harness-usage.md` and `.codex/skills/harness/SKILL.md` tell operators to gather context before adopting an existing repo. The CLI itself does not perform repo research; it relies on the operator to do so.
- `.rules/patterns/operator-workflow.md` says RED-GREEN-REFACTOR for user-visible behavior. The repo follows that pattern in BDD/tests, but there is no automation that prevents direct implementation-first edits.

**Current-state conflict to record:**
- Global development rules outside this repo describe a pytest-style BDD folder shape under `apps/<app>/features/<domain>/`. The executable repo-local pattern is Vitest plus cucumber-style `.feature`/`.spec.ts` files under `apps/cli/features/`. For this repository, follow the repo-local executable pattern.

## Scaffold Source And Generated Artifact Propagation

**Canonical rule:**
- Edit `src/templates/**` first when changing scaffold text or managed docs. This is stated in `.rules/index.md`, `AGENTS.md`, `.codex/README.md`, and `docs/ai-harness-premise.md`.
- Update the relevant generator mapping in `src/generators/**` when the file list, output path, merge behavior, or template token wiring changes.
- Rebuild `dist/` after source/template changes with `pnpm build`. `package.json` wires this to `tsc -p tsconfig.json && node scripts/copy-templates.mjs`.
- `scripts/copy-templates.mjs` copies `src/templates` into both `dist/src/templates` and `dist/templates`.

**Practical propagation path:**
1. Change source template or generator under `src/`.
2. Run `pnpm build` so `dist/src/**`, `dist/src/templates/**`, and `dist/templates/**` match source.
3. Validate source behavior with `pnpm test` and `pnpm test:bdd`.
4. Validate built behavior with `pnpm test:smoke:dist`.
5. Dogfood against the current repo with `ai-harness --mode existing . --init-json` and `ai-harness doctor . --assistant codex` or `--assistant opencode` as documented in `AGENTS.md` and `.codex/README.md`.

## Legacy Assumptions Versus Emerging Pi Direction

**Still encoded as current convention:**
- Assistant selection is still only `'codex' | 'opencode'` in `src/core/types.ts` and `src/cli.ts`.
- Global skill installation only supports OpenCode in `src/commands/install-skill.ts`.
- OpenCode-specific global config paths are first-class in `src/core/opencode-skill.ts`: `~/.opencode/skills`, `~/.config/opencode/oh-my-opencode.json`, and `~/.config/opencode/get-shit-done/workflows/autonomous.md`.
- The generated OpenCode defaults file still targets the oh-my-openagent schema in `src/templates/opencode/oh-my-opencode.json`.
- OMO lane authority remains the repo’s normative workflow model in `.rules/patterns/omo-agent-contract.md`, `AGENTS.md`, `.codex/README.md`, and `.codex/workflows/autonomous-execution.md`.

**Migration-oriented direction already visible:**
- GSD-era planning is treated as legacy and no default `.planning/` scaffold is emitted. `src/generators/planning.ts` returns an empty array, while `src/core/cleanup-manifests.ts` marks `.planning` and GSD rule files as prompt-before-delete legacy artifacts.
- Codex and OpenCode already share one `.codex/` runtime surface. That consolidation is implemented in `src/generators/codex.ts` and reinforced by `docs/ai-harness-premise.md`.
- Doctor and docs-alignment checks actively reject stale GSD references, for example in `src/commands/doctor.ts` and `tests/integration/docs-alignment.test.ts`.

**What this means for a Pi replacement for OMO/OpenCode:**
- The codebase currently has no Pi-specific assistant contract, CLI option, global install path, or test fixture. A Pi transition is not a documentation-only swap.
- Any Pi replacement work will need a full-cutover update across at least `src/core/types.ts`, `src/cli.ts`, `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/**`, `AGENTS.md`, `.codex/README.md`, `.rules/patterns/omo-agent-contract.md`, and the corresponding integration tests.
- The repo currently treats OMO alignment as enforced behavior, not historical commentary. `src/commands/doctor.ts` and `tests/integration/doctor.test.ts` will fail until those invariants are deliberately rewritten.

---

*Convention analysis: 2026-04-04*
