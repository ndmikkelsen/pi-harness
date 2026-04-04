# Codebase Structure

**Analysis Date:** 2026-04-04

## Directory Layout

```text
pi-harness/
├── src/                    # Canonical TypeScript source: commands, core logic, generators, templates
├── dist/                   # Built JavaScript plus mirrored templates consumed by the installed CLI
├── .codex/                 # Dogfooded generated runtime surface for Codex/OpenCode workflows
├── .rules/                 # Dogfooded generated workflow and policy documents
├── apps/                   # BDD feature suites for the CLI app
├── tests/                  # Unit and integration regression tests
├── docs/                   # Hand-authored explanatory product and migration docs
├── scripts/                # Build helpers, smoke checks, and local launcher installer
├── config/                 # Checked-in deploy templates in generated-output form
├── .kamal/                 # Deploy secret example plus local secret location
├── .beads/                 # Live project-local Beads tracker state and git hook integration
├── .planning/              # Repo-local planning workspace; currently used for codebase maps
├── .sisyphus/              # Historical plan/evidence archive from prior workflow change streams
├── .opencode/              # Local OpenCode plugin/config workspace; not generator source
├── AGENTS.md               # Repo-level adapter guide generated from `src/templates/codex/AGENTS.md`
├── README.md               # Product/readme surface for this repo
├── package.json            # Node package manifest and command scripts
├── tsconfig.json           # TypeScript build config
├── vitest.config.ts        # Unit/integration test config
└── vitest.bdd.config.ts    # BDD-oriented test config
```

## Directory Purposes

**`src/`:**
- Purpose: Canonical authoring surface for the product.
- Contains: CLI entrypoint in `src/cli.ts`, orchestration in `src/commands/*.ts`, reusable services in `src/core/*.ts`, scaffold definitions in `src/generators/*.ts`, and scaffold content in `src/templates/**`.
- Key files: `src/cli.ts`, `src/commands/init.ts`, `src/commands/doctor.ts`, `src/commands/install-skill.ts`, `src/core/template-loader.ts`, `src/generators/index.ts`.
- Edit rule: If a change should affect downstream generated repositories, start here.

**`src/commands/`:**
- Purpose: Command-specific orchestration.
- Contains: `init`, `doctor`, and `install-skill` command implementations.
- Key files: `src/commands/init.ts`, `src/commands/doctor.ts`, `src/commands/install-skill.ts`.
- Layout rule: New CLI commands belong here, with `src/cli.ts` only wiring them into Commander.

**`src/core/`:**
- Purpose: Shared implementation details that commands and generators reuse.
- Contains: Filesystem application logic, template loading, git integration, cleanup manifests, assistant metadata, and OpenCode install helpers.
- Key files: `src/core/filesystem.ts`, `src/core/git.ts`, `src/core/template-loader.ts`, `src/core/opencode-skill.ts`, `src/core/types.ts`, `src/core/cleanup-manifests.ts`.
- Layout rule: Put reusable non-template behavior here instead of embedding it into command files.

**`src/generators/`:**
- Purpose: Map scaffold concerns to output paths.
- Contains: Concern-oriented generators rather than one giant scaffold file.
- Key files: `src/generators/root.ts`, `src/generators/codex.ts`, `src/generators/rules.ts`, `src/generators/config.ts`, `src/generators/project-docs.ts`, `src/generators/planning.ts`.
- Layout rule: Add or move scaffold outputs here when changing what a repo receives.

**`src/templates/`:**
- Purpose: Canonical source text for generated docs, runtime scripts, deploy assets, and OpenCode global files.
- Contains: `src/templates/root/**`, `src/templates/codex/**`, `src/templates/rules/**`, `src/templates/config/**`, `src/templates/project-docs/**`, and `src/templates/opencode/**`.
- Key files: `src/templates/codex/AGENTS.md`, `src/templates/codex/README.md`, `src/templates/rules/patterns/omo-agent-contract.md`, `src/templates/opencode/oh-my-opencode.json`, `src/templates/root/opencode-worktree.jsonc`.
- Edit rule: This is the source of truth for scaffold content. Do not edit `dist/templates/**`, `dist/src/templates/**`, `.codex/**`, `.rules/**`, or root dogfooded outputs first.

**`dist/`:**
- Purpose: Built artifact tree for the local launcher and package bin.
- Contains: Compiled JS in `dist/src/**`, declaration files, sourcemaps, and mirrored templates in both `dist/src/templates/**` and `dist/templates/**`.
- Key files: `dist/src/cli.js`, `dist/src/core/template-loader.js`, `dist/src/templates/**`, `dist/templates/**`.
- Generated: Yes.
- Committed: Yes.
- Edit rule: Never author directly here. Rebuild with `pnpm build` after source/template changes.

**`.codex/`:**
- Purpose: Dogfooded runtime surface that downstream repos also receive.
- Contains: Runtime scripts in `.codex/scripts/*.sh`, role briefs in `.codex/agents/*.md`, workflow docs in `.codex/workflows/*.md`, the repo setup skill in `.codex/skills/harness/**`, and `Dockerfile.cognee` in `.codex/docker/`.
- Key files: `.codex/README.md`, `.codex/scripts/bootstrap-worktree.sh`, `.codex/scripts/cognee-sync-planning.sh`, `.codex/workflows/autonomous-execution.md`, `.codex/skills/harness/SKILL.md`.
- Source of truth: The matching files under `src/templates/codex/**`.

**`.rules/`:**
- Purpose: Dogfooded workflow and architecture policy surface.
- Contains: Index and pattern docs; no executable code.
- Key files: `.rules/index.md`, `.rules/patterns/operator-workflow.md`, `.rules/patterns/omo-agent-contract.md`, `.rules/patterns/beads-integration.md`, `.rules/patterns/git-workflow.md`.
- Source of truth: `src/templates/rules/**`.
- Layout rule: Treat these as normative policy documents, not implementation code.

**`apps/`:**
- Purpose: App-scoped BDD executable specifications.
- Contains: `apps/cli/features/**` with `.feature`, `.plan.md`, `.spec.ts`, steps, and support helpers.
- Key files: `apps/cli/features/init/init.feature`, `apps/cli/features/init/init.spec.ts`, `apps/cli/features/adoption/adoption.feature`, `apps/cli/features/steps/*.ts`.
- Layout rule: User-visible CLI behavior belongs here first when following the repo's BDD guidance.

**`tests/`:**
- Purpose: Unit and integration regressions outside the BDD feature hierarchy.
- Contains: `tests/unit/*.test.ts` for internals and `tests/integration/*.test.ts` for filesystem, CLI, docs alignment, and runtime seams.
- Key files: `tests/unit/template-loader.test.ts`, `tests/integration/bootstrap-worktree.test.ts`, `tests/integration/install-skill.test.ts`, `tests/integration/docs-alignment.test.ts`, `tests/integration/doctor.test.ts`.
- Layout rule: Shared runtime, migration seams, and contract-level behavior usually belong here.

**`docs/`:**
- Purpose: Hand-authored product and migration explanation.
- Contains: Architecture/product docs that explain the current system but are not generator sources.
- Key files: `docs/ai-harness-map.md`, `docs/ai-harness-premise.md`, `docs/architecture.md`, `docs/harness-usage.md`, `docs/migration-plan.md`.
- Layout rule: Update these when repo behavior changes, but change scaffold templates separately if the same guidance must ship downstream.

**`scripts/`:**
- Purpose: Local build and developer tooling.
- Contains: `scripts/copy-templates.mjs`, `scripts/dist-smoke.mjs`, `scripts/install-local-launcher.ts`, and `scripts/hooks/post-checkout`.
- Key files: `scripts/copy-templates.mjs`, `scripts/dist-smoke.mjs`, `scripts/install-local-launcher.ts`.
- Layout rule: Keep these focused on repo maintenance, not scaffold content.

**`config/`:**
- Purpose: Checked-in deploy template outputs for this repo.
- Contains: `config/deploy.yml` and `config/deploy.cognee.yml`.
- Key files: `config/deploy.yml`, `config/deploy.cognee.yml`.
- Source of truth: `src/templates/config/**` plus `src/generators/config.ts`.
- Edit rule: For scaffold-shipped deploy changes, update template source first, then rebuild or reapply.

**`.kamal/`:**
- Purpose: Kamal secrets/example surface.
- Contains: `.kamal/secrets.example` plus a local `.kamal/secrets` file.
- Key files: `.kamal/secrets.example`.
- Source of truth for the example: `src/templates/config/secrets.example` via `src/generators/config.ts`.
- Security note: Treat `.kamal/secrets` as local secret state, not documentation.

**`.beads/`:**
- Purpose: Live repo-local issue tracker state and git hook integration.
- Contains: `config.yaml`, Beads README, hook scripts, local tracker database/log files, and runtime state.
- Key files: `.beads/config.yaml`, `.beads/hooks/post-checkout`, `.beads/README.md`.
- Layout rule: This is active tool state, not scaffold source. The generator only creates selected Beads starter files through `src/generators/root.ts`.

**`.planning/`:**
- Purpose: Repo-local planning workspace.
- Contains: Currently `.planning/codebase/**`; runtime scripts still support legacy `.planning/PROJECT.md`, `.planning/STATE.md`, and `.planning/phases/**` if present.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md` once written; compatibility consumers in `.codex/scripts/cognee-sync-planning.sh`.
- Layout rule: `src/generators/planning.ts` does not scaffold this tree by default.

**`.sisyphus/`:**
- Purpose: Historical plan and evidence archive from prior operational work.
- Contains: `.sisyphus/plans/*.md`, `.sisyphus/evidence/**`, and supporting README files.
- Key files: `.sisyphus/plans/omo-tooling-gap-analysis.md`, `.sisyphus/plans/remove-gsd-omo-supermemory.md`, `.sisyphus/evidence/task-15-gap-report.md`.
- Layout rule: Useful as migration evidence, but not part of the scaffold generator path.

**`.opencode/`:**
- Purpose: Local OpenCode workspace for this repository.
- Contains: `.opencode/worktree.jsonc` plus local package metadata and local dependency state such as `.opencode/package.json`, `.opencode/bun.lock`, and `.opencode/node_modules/`.
- Key files: `.opencode/worktree.jsonc`, `.opencode/package.json`.
- Source of truth for the scaffolded worktree config: `src/templates/root/opencode-worktree.jsonc` via `src/generators/root.ts`.
- Layout rule: Treat `.opencode/worktree.jsonc` as active local config, but treat the rest of `.opencode/` as local support material rather than generator source.

## Key File Locations

**Entry Points:**
- `src/cli.ts`: Main source CLI entrypoint.
- `dist/src/cli.js`: Built CLI entry used by the package bin and local launcher.
- `scripts/install-local-launcher.ts`: Installs the local `ai-harness` shell wrapper.
- `src/commands/install-skill.ts`: Writes global OpenCode skill/config assets.

**Configuration:**
- `package.json`: Scripts, bin path, Node engine, and dependency declarations.
- `tsconfig.json`: TypeScript compilation rules.
- `vitest.config.ts`: Unit/integration test runner configuration.
- `vitest.bdd.config.ts`: BDD runner configuration for `apps/cli/features/**`.
- `config/deploy.yml`: Starter deploy template output.
- `config/deploy.cognee.yml`: Concrete Cognee service deploy template output.

**Core Logic:**
- `src/core/filesystem.ts`: Preserve-by-default managed file application.
- `src/core/template-loader.ts`: Template resolution across source and built mirrors.
- `src/core/git.ts`: Git initialization and worktree hook wiring.
- `src/core/opencode-skill.ts`: OpenCode global file definitions and path rules.
- `src/generators/index.ts`: Full scaffold assembly.

**Testing:**
- `tests/unit/*.test.ts`: Internal logic tests.
- `tests/integration/*.test.ts`: CLI/runtime/doc alignment and migration seam tests.
- `apps/cli/features/**/*.feature`: Human-readable behavior specs.
- `apps/cli/features/**/*.spec.ts`: Executable BDD runners.

## Naming Conventions

**Files:**
- TypeScript source uses kebab-case filenames by concern, for example `src/core/template-loader.ts`, `src/commands/install-skill.ts`, and `src/generators/project-docs.ts`.
- Tests use `*.test.ts`, for example `tests/integration/doctor.test.ts` and `tests/unit/template-loader.test.ts`.
- BDD files are grouped by domain as `.feature`, `.plan.md`, and `.spec.ts`, for example `apps/cli/features/init/init.feature`, `apps/cli/features/init/init.plan.md`, and `apps/cli/features/init/init.spec.ts`.
- Template files mirror downstream output names and relative paths, for example `src/templates/codex/AGENTS.md` -> `AGENTS.md`, `src/templates/rules/patterns/omo-agent-contract.md` -> `.rules/patterns/omo-agent-contract.md`, and `src/templates/root/opencode-worktree.jsonc` -> `.opencode/worktree.jsonc`.

**Directories:**
- Runtime code is organized by role under `src/commands/`, `src/core/`, and `src/generators/`.
- Template content is organized by downstream destination under `src/templates/root/`, `src/templates/codex/`, `src/templates/rules/`, `src/templates/config/`, and `src/templates/opencode/`.
- Executable specs are app-scoped under `apps/<app>/features/<domain>/`.
- Checked-in dogfooded scaffold outputs live at repo root under `.codex/`, `.rules/`, `config/`, `.kamal/`, and `AGENTS.md`.

## Where to Add New Code

**New Feature:**
- Primary code: Start in `src/commands/*.ts` if it is a new CLI command, or `src/core/*.ts` if it is shared logic.
- Scaffold outputs: Add or change `src/generators/*.ts` and the corresponding `src/templates/**` files.
- Tests: Add unit or integration coverage in `tests/unit/` or `tests/integration/`; add BDD specs in `apps/cli/features/<domain>/` when the change is user-visible.

**New Component/Module:**
- Implementation: `src/core/` for reusable services, `src/generators/` for scaffold mapping, `src/commands/` for top-level command orchestration.
- Guidance: If the module produces downstream files, pair it with templates under `src/templates/**` and keep repo-local dogfooded outputs aligned.

**Utilities:**
- Shared helpers: `src/core/`.
- Build/dev-only helpers: `scripts/`.
- Do not hide reusable template-related behavior in `scripts/`; keep template logic in `src/core/template-loader.ts` or generator files.

**Migration-specific placement guidance:**
- Pi-native assistant/provider work belongs at the edge, next to `src/core/opencode-skill.ts`, `src/commands/install-skill.ts`, and `src/templates/opencode/**`, because that is where OpenCode-specific global assumptions currently live.
- If Pi replaces OMO doctrine, change the normative rule source at `src/templates/rules/patterns/omo-agent-contract.md` and the enforcement logic in `src/commands/doctor.ts` together; do not leave old contract names reachable.
- If Pi replaces the OpenCode worktree path, update `src/templates/root/opencode-worktree.jsonc`, `.codex/scripts/bootstrap-worktree.sh`, `.beads/hooks/post-checkout`, `src/core/git.ts`, and the matching integration tests in one cutover.
- If Pi removes legacy planning assumptions, update `.codex/scripts/cognee-sync-planning.sh` together with workflow docs under `.codex/workflows/*.md` and `.rules/patterns/*.md`; that script still references `.planning/STATE.md`-style files.

## Special Directories

**`dist/`:**
- Purpose: Built package/runtime artifact tree.
- Generated: Yes.
- Committed: Yes.
- Safe edit rule: Rebuild from `src/**`; never hand-edit.

**`dist/src/templates/` and `dist/templates/`:**
- Purpose: Mirrored copies of `src/templates/**` for compiled execution and smoke tests.
- Generated: Yes, by `scripts/copy-templates.mjs`.
- Committed: Yes.
- Safe edit rule: Keep aligned by rebuilding; editing one mirror creates drift immediately.

**`.codex/` and `.rules/`:**
- Purpose: Dogfooded scaffold outputs used by this repo today.
- Generated: Yes, conceptually, from `src/templates/**` plus generators.
- Committed: Yes.
- Safe edit rule: If the same change should ship downstream, edit template source first and then refresh the dogfooded copy.

**`.beads/`:**
- Purpose: Active tracker state and hook runtime.
- Generated: Tool-managed and partially scaffold-seeded.
- Committed: Yes.
- Safe edit rule: Treat as live operational state; avoid using it as a template source.

**`.planning/`:**
- Purpose: Repo-local planning and analysis workspace.
- Generated: No, not by the current scaffold.
- Committed: Repo-dependent; present here for mapping outputs.
- Safe edit rule: Do not assume it exists downstream just because runtime scripts can consume it.

**`.sisyphus/`:**
- Purpose: Historical plan/evidence corpus.
- Generated: No.
- Committed: Yes.
- Safe edit rule: Reference for migration context only; not runtime.

**`.opencode/`:**
- Purpose: Local OpenCode support files and optional worktree plugin config.
- Generated: `.opencode/worktree.jsonc` is scaffold-generated; other contents are local environment support.
- Committed: Mixed; `worktree.jsonc`, `package.json`, and `bun.lock` are present, while `node_modules/` is local dependency state.
- Safe edit rule: Change the scaffolded worktree config via `src/templates/root/opencode-worktree.jsonc`; treat local package/dependency contents as support material.

**`node_modules/`:**
- Purpose: Installed dependencies for the repo.
- Generated: Yes.
- Committed: No.
- Safe edit rule: Never treat as a source surface.

---

*Structure analysis: 2026-04-04*
