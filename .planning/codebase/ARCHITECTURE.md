# Architecture

**Analysis Date:** 2026-04-04

## Pattern Overview

**Overall:** Layered scaffold-generator CLI with a dogfooded runtime surface.

**Key Characteristics:**
- `src/cli.ts` is a thin command-line shell; orchestration lives in `src/commands/*.ts`, reusable behavior lives in `src/core/*.ts`, and scaffold composition lives in `src/generators/*.ts`.
- `src/templates/**` is the scaffold source of truth, while checked-in repo files such as `AGENTS.md`, `.codex/**`, `.rules/**`, `config/**`, and `.kamal/secrets.example` are this repository's self-applied outputs of that scaffold.
- `dist/src/**` and `dist/templates/**` are build mirrors, not authoring surfaces; `scripts/copy-templates.mjs` copies `src/templates` into both `dist/src/templates` and `dist/templates`.
- The repo keeps policy and adapter layers separate: `.rules/**` is normative workflow policy, while `AGENTS.md`, `.codex/README.md`, `.codex/workflows/*.md`, and `.codex/agents/*.md` are entrypoint or adapter documents.
- Current assistant support is explicitly dual-target only: `codex` and `opencode` in `src/core/types.ts`, `src/core/assistant.ts`, and `src/cli.ts`.

## Layers

**CLI entry layer:**
- Purpose: Parse user input, dispatch commands, and format command output.
- Location: `src/cli.ts`
- Contains: Commander option parsing, command registration for scaffold, `doctor`, and `install-skill`.
- Depends on: `src/commands/init.ts`, `src/commands/doctor.ts`, `src/commands/install-skill.ts`, `src/core/policy.ts`, `src/core/types.ts`.
- Used by: Local development via `pnpm exec tsx src/cli.ts ...`, installed launcher via `scripts/install-local-launcher.ts`, and the package bin entry `dist/src/cli.js` from `package.json`.

**Command orchestration layer:**
- Purpose: Turn parsed CLI options into coordinated workflows.
- Location: `src/commands/init.ts`, `src/commands/doctor.ts`, `src/commands/install-skill.ts`
- Contains: Scaffold execution, scaffold auditing, and OpenCode global skill/config installation.
- Depends on: Core services in `src/core/*.ts` plus generator composition in `src/generators/index.ts`.
- Used by: `src/cli.ts` only; this keeps top-level CLI code thin.

**Core domain services layer:**
- Purpose: Provide reusable, side-effectful primitives for filesystem writes, template loading, git setup, cleanup manifests, assistant labeling, and OpenCode installation.
- Location: `src/core/*.ts`
- Contains: `src/core/filesystem.ts`, `src/core/template-loader.ts`, `src/core/git.ts`, `src/core/cleanup-manifests.ts`, `src/core/opencode-skill.ts`, `src/core/project-input.ts`, `src/core/port-detection.ts`, `src/core/policy.ts`.
- Depends on: Node filesystem/process APIs plus template assets.
- Used by: Command layer and generator layer.

**Scaffold composition layer:**
- Purpose: Define what gets scaffolded, by concern, without baking every file into one monolithic command.
- Location: `src/generators/index.ts`, `src/generators/root.ts`, `src/generators/codex.ts`, `src/generators/rules.ts`, `src/generators/config.ts`, `src/generators/project-docs.ts`, `src/generators/planning.ts`
- Contains: Arrays of `ManagedEntry` definitions that map scaffold intent to output paths.
- Depends on: `src/core/types.ts` for `ManagedEntry` and `ScaffoldContext`, plus `src/core/template-loader.ts`.
- Used by: `src/commands/init.ts` and `src/commands/doctor.ts`.

**Template source layer:**
- Purpose: Hold canonical scaffold text and scripts that downstream repositories receive.
- Location: `src/templates/**`
- Contains: Root docs under `src/templates/root/**`, rules under `src/templates/rules/**`, runtime assets under `src/templates/codex/**`, OpenCode-specific global assets under `src/templates/opencode/**`, and deploy templates under `src/templates/config/**`.
- Depends on: Token substitution through `src/core/template-loader.ts`.
- Used by: Generator modules and `src/core/opencode-skill.ts`.

**Dogfooded runtime and policy layer:**
- Purpose: Exercise the scaffold in this repository itself so repo-local docs, scripts, and rules stay aligned with generated output.
- Location: `AGENTS.md`, `.codex/**`, `.rules/**`, `config/**`, `.kamal/secrets.example`, `STICKYNOTE.example.md`
- Contains: Runtime scripts in `.codex/scripts/*.sh`, role briefs in `.codex/agents/*.md`, workflow docs in `.codex/workflows/*.md`, the normative OMO contract in `.rules/patterns/omo-agent-contract.md`, and deploy templates in `config/*.yml`.
- Depends on: `src/templates/**` and generator outputs staying current.
- Used by: Humans, Codex/OpenCode/OMO workflows, and regression tests such as `tests/integration/docs-alignment.test.ts`.

**Verification layer:**
- Purpose: Prove scaffold behavior, docs alignment, and worktree/runtime contracts.
- Location: `tests/integration/*.test.ts`, `tests/unit/*.test.ts`, `apps/cli/features/**`
- Contains: Unit tests for internals, integration tests for scaffold outputs, and BDD specs for CLI user journeys.
- Depends on: Source modules, checked-in dogfooded outputs, and temporary filesystem fixtures.
- Used by: `pnpm test`, `pnpm test:bdd`, and `pnpm test:smoke:dist` from `package.json`.

## Data Flow

**Scaffold generation flow:**

1. `src/cli.ts` parses CLI options and dispatches to `runInit(...)` in `src/commands/init.ts`.
2. `src/commands/init.ts` resolves project identity and mode through `src/core/project-input.ts`, resolves optional port values through `src/core/port-detection.ts`, and builds a `ScaffoldContext` from `src/core/types.ts`.
3. `src/generators/index.ts` expands that context into `ManagedEntry[]` by composing root, `.codex`, rules, config, and project-doc generators.
4. `src/core/filesystem.ts` applies entries with preserve-by-default behavior, optional `.gitignore` and `.env.example` merge support, and execute-bit handling for scripts.
5. `src/core/git.ts` optionally initializes git and wires worktree bootstrap hooks toward `.codex/scripts/bootstrap-worktree.sh` and `.beads/hooks/post-checkout`.

**Doctor/audit flow:**

1. `src/cli.ts` dispatches `doctor` to `src/commands/doctor.ts`.
2. `src/commands/doctor.ts` reconstructs the expected scaffold file set from the same generator pipeline used by `init`.
3. It then validates the target repository for missing outputs, execute bits, stale GSD artifacts, missing OMO references, and broken runtime seams such as `.opencode/worktree.jsonc` and `.beads/hooks/post-checkout`.
4. The result is a policy-aware report that treats OMO alignment as a first-class architectural contract, not just a docs nicety.

**Global OpenCode install flow:**

1. `src/cli.ts` dispatches `install-skill` to `src/commands/install-skill.ts`.
2. `src/commands/install-skill.ts` delegates path calculation and generated file definitions to `src/core/opencode-skill.ts`.
3. Templates under `src/templates/codex/skills/harness/**` and `src/templates/opencode/**` are written into global OpenCode locations such as `~/.opencode/skills/ai-harness/` and `~/.config/opencode/oh-my-opencode.json`.
4. The installed workflow remains an entrypoint only; it points back to repo-local sources of truth in `.rules/**` and `.codex/workflows/autonomous-execution.md`.

**Template build flow:**

1. `pnpm build` runs `tsc -p tsconfig.json` and then `node scripts/copy-templates.mjs` from `package.json`.
2. `scripts/copy-templates.mjs` mirrors `src/templates/**` into `dist/src/templates/**` and `dist/templates/**`.
3. `src/core/template-loader.ts` searches both source and built template roots so local development, compiled execution, and smoke tests can all resolve the same logical template paths.

**Planning/Cognee sync flow:**

1. Repo-local planning artifacts remain outside the scaffold pipeline; `src/generators/planning.ts` intentionally returns an empty array.
2. The runtime still ships planning-sync adapters in `.codex/scripts/cognee-sync-planning.sh` and `.codex/scripts/sync-planning-to-cognee.sh`.
3. Those scripts upload `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/ROADMAP.md`, and `.planning/phases/**` when they exist.
4. This means `.planning/` is not scaffolded, but the runtime still preserves a compatibility seam for repositories that already have a GSD-era planning tree.

**State Management:**
- `ScaffoldContext` in `src/core/types.ts` is the single per-run state object passed through generators.
- The scaffold itself is mostly file-based state: managed outputs on disk, repo-local Beads state in `.beads/**`, optional OpenCode config in `.opencode/worktree.jsonc`, and optional repo-local planning state in `.planning/**`.
- Preserve-by-default adoption in `src/core/filesystem.ts` means existing files are stateful inputs, not disposable outputs.

## Key Abstractions

**Managed scaffold entry:**
- Purpose: Represent every generated directory or file in one uniform model.
- Examples: `ManagedEntry`, `ManagedFile`, and `ScaffoldContext` in `src/core/types.ts`; consumers in `src/generators/*.ts` and `src/core/filesystem.ts`.
- Pattern: Declarative file graph plus shared apply logic.

**Template-path indirection:**
- Purpose: Decouple logical scaffold paths from whether the CLI runs from source or `dist/`.
- Examples: `loadTemplate(...)` and `resolveTemplatePath(...)` in `src/core/template-loader.ts`; mirrored templates from `scripts/copy-templates.mjs`.
- Pattern: Multi-root template resolution with token substitution and newline normalization.

**Runtime/policy split:**
- Purpose: Keep workflow law separate from assistant-specific adapters.
- Examples: Normative contract in `.rules/patterns/omo-agent-contract.md`; adapters in `AGENTS.md`, `.codex/README.md`, `.codex/workflows/autonomous-execution.md`, `.codex/agents/orchestrator.md`.
- Pattern: One normative policy layer plus many entrypoint docs that must reference it.

**Worktree bootstrap seam:**
- Purpose: Seed local worktree state while keeping Beads and optional OpenCode plugin hooks aligned.
- Examples: `.codex/scripts/bootstrap-worktree.sh`, `.beads/hooks/post-checkout`, `scripts/hooks/post-checkout`, `.opencode/worktree.jsonc`, and `src/core/git.ts`.
- Pattern: Idempotent bootstrap script invoked from multiple trigger points.

**Legacy-cleanup seam:**
- Purpose: Remove known obsolete workflow artifacts only when explicitly requested.
- Examples: `src/core/cleanup-manifests.ts`, `src/core/cleanup.ts`, and CLI exposure in `src/commands/init.ts`.
- Pattern: Curated manifest, not heuristic deletion.

**Assistant-global install seam:**
- Purpose: Bridge repo-local scaffold content into assistant-global config locations.
- Examples: `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/oh-my-opencode.json`, and `src/templates/opencode/get-shit-done/workflows/autonomous.md`.
- Pattern: Provider-specific installer that writes global config and workflow entrypoints.

**Pi migration seam:**
- Purpose: Identify the exact places where Pi-native concepts must replace OpenCode/OMO assumptions.
- Examples: assistant union types in `src/core/types.ts`, assistant display helpers in `src/core/assistant.ts`, CLI parsing in `src/cli.ts`, OpenCode-only install logic in `src/commands/install-skill.ts`, and OpenCode template payloads in `src/templates/opencode/**`.
- Pattern: Tight assistant/provider branching at the edges, with the shared `.codex/` and generator pipeline largely provider-agnostic.

## Entry Points

**CLI binary:**
- Location: `src/cli.ts`
- Triggers: `pnpm exec tsx src/cli.ts ...`, `dist/src/cli.js` via `package.json`, and the local launcher rendered by `src/local-launcher.ts`.
- Responsibilities: Accept scaffold, doctor, and install commands; validate assistant/mode values; print JSON or human-readable results.

**Local launcher installer:**
- Location: `scripts/install-local-launcher.ts`
- Triggers: `pnpm install:local`
- Responsibilities: Write `~/.local/bin/ai-harness` using the shell wrapper from `src/local-launcher.ts` so the repo checkout behaves like an installed tool.

**Global skill installer:**
- Location: `src/commands/install-skill.ts`
- Triggers: `ai-harness install-skill --assistant opencode`
- Responsibilities: Refresh the global `harness` skill, managed OpenCode defaults, and managed autonomous workflow.

**Dogfooded runtime surface:**
- Location: `.codex/scripts/*.sh`, `.codex/workflows/*.md`, `.codex/agents/*.md`, `AGENTS.md`
- Triggers: Human operators, Codex/OpenCode sessions, worktree creation, and landing flow.
- Responsibilities: Execute worktree setup, Cognee bridging, planning sync, landing, and role guidance.

**Build output surface:**
- Location: `dist/src/**`, `dist/templates/**`
- Triggers: `pnpm build` and `pnpm test:smoke:dist`
- Responsibilities: Ship compiled CLI code and mirrored templates for launcher/bin execution.

## Error Handling

**Strategy:** Fail hard for invalid command usage or broken local assumptions; degrade gracefully when optional external workflow systems are unavailable.

**Patterns:**
- `src/cli.ts` and Commander reject unsupported assistant/mode values early.
- `src/commands/init.ts` rejects invalid cleanup-manifest usage for non-existing mode combinations.
- `src/commands/doctor.ts` returns structured `pass`/`warn`/`fail` groups instead of throwing for repository drift; this is the main truth-telling mechanism for architectural misalignment.
- `src/core/filesystem.ts` preserves existing files unless `--force` or a narrow merge path is requested.
- `.codex/scripts/bootstrap-worktree.sh` and `.beads/hooks/post-checkout` are intentionally tolerant of missing optional inputs and reruns.
- `.codex/scripts/cognee-bridge.sh` and `.codex/scripts/cognee-sync-planning.sh` treat Cognee unavailability as an explicit skip path, not a crash.
- `src/commands/install-skill.ts` only supports `opencode`; unsupported assistant targets are rejected immediately.

## Cross-Cutting Concerns

**Logging:** Minimal human-readable command output dominates. Most runtime shell scripts print small deterministic summaries, for example `.codex/scripts/bootstrap-worktree.sh` and `.codex/scripts/cognee-sync-planning.sh`.

**Validation:**
- Input validation lives in `src/cli.ts` and `src/core/project-input.ts`.
- Scaffold correctness validation lives in `src/commands/doctor.ts`.
- Documentation/rule alignment is regression-tested in `tests/integration/docs-alignment.test.ts`.
- Worktree seam behavior is regression-tested in `tests/integration/bootstrap-worktree.test.ts`.

**Authentication:**
- Secrets are intentionally excluded from the generator source; `.kamal/secrets.example` is placeholder-only and `.kamal/secrets` is local secret state.
- Cognee authentication is environment-driven through `.codex/scripts/cognee-bridge.sh` and repo-local `.env`/`.envrc` usage.
- Global OpenCode behavior depends on machine-local config roots such as `~/.opencode` and `~/.config/opencode`, which is a major non-Pi seam.

**Migration-relevant architecture notes:**
- The shared scaffold core is already mostly independent of OpenCode: `src/generators/codex.ts`, `src/generators/rules.ts`, `src/generators/config.ts`, and `src/core/filesystem.ts` do not need OpenCode-specific knowledge to function.
- The highest-friction replacement zone for Pi is the OpenCode installer path: `src/core/opencode-skill.ts`, `src/commands/install-skill.ts`, `src/templates/opencode/**`, the repo-local `.opencode/worktree.jsonc`, and docs/tests that assert `oh-my-opencode.json` and `get-shit-done/workflows/autonomous.md`.
- The second replacement zone is OMO doctrine itself: `.rules/patterns/omo-agent-contract.md`, its template mirror at `src/templates/rules/patterns/omo-agent-contract.md`, and `src/commands/doctor.ts` all assume OMO terminology and required sections.
- The third replacement zone is lingering GSD compatibility in planning sync: `.codex/scripts/cognee-sync-planning.sh` still looks for legacy `.planning` filenames and phase directories even though `src/generators/planning.ts` emits no planning scaffold.
- The most reusable seam for a Pi transition is the existing `.codex/` runtime surface. If Pi becomes the operator shell, the likely architectural move is to preserve the shared scaffold/generator pipeline while replacing the provider-specific edges listed above in one cutover.

---

*Architecture analysis: 2026-04-04*
