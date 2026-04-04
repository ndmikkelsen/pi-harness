# Technology Stack

**Analysis Date:** 2026-04-04

## Languages

**Primary:**
- TypeScript 5.8.2 - CLI, scaffold generators, template loading, doctor/install flows, and most tests live under `src/**/*.ts`, `tests/**/*.ts`, and `apps/**/*.ts`; version is declared in `package.json`.

**Secondary:**
- JavaScript (ES modules) - build/smoke scripts and compiled runtime artifacts live in `scripts/*.mjs` and `dist/src/**/*.js`, including `scripts/copy-templates.mjs`, `scripts/dist-smoke.mjs`, and `dist/src/cli.js`.
- Bash - runtime and generated workflow surfaces live in `.codex/scripts/*.sh`, `src/templates/codex/scripts/*.sh`, `src/templates/opencode/get-shit-done/workflows/autonomous.md`, and the launcher emitted by `src/local-launcher.ts`.
- Markdown/YAML/JSONC - scaffold content and policy surfaces are authored in `src/templates/**`, `.rules/**/*.md`, `.codex/**/*.md`, `config/*.yml`, `.pre-commit-config.yaml`, and `src/templates/opencode/oh-my-opencode.json`.

## Runtime

**Environment:**
- Node.js >=22.0.0 - required by `package.json` and used by the compiled CLI entry `dist/src/cli.js`.
- Local shell runtime - required for generated scripts such as `.codex/scripts/land.sh` and `.codex/scripts/bootstrap-worktree.sh`, sourced from `src/templates/codex/scripts/*.sh`.

**Package Manager:**
- pnpm 9.15.4 - pinned in `package.json` via `packageManager`.
- Lockfile: present in `pnpm-lock.yaml`.

## Frameworks

**Core:**
- Commander 13.1.0 - CLI argument parsing in `src/cli.ts`.
- First-party generator/template system - scaffold assembly is composed in `src/generators/index.ts`, `src/generators/*.ts`, and `src/core/template-loader.ts`.
- OpenCode compatibility surface - global skill/defaults installation is implemented in `src/commands/install-skill.ts` and `src/core/opencode-skill.ts`, with managed assets sourced from `src/templates/opencode/**`.

**Testing:**
- Vitest 4.0.18 - unit and integration test runner configured in `vitest.config.ts` and used under `tests/**/*.test.ts`.
- `@amiceli/vitest-cucumber` 6.2.0 - BDD layer for CLI workflows configured in `vitest.bdd.config.ts` and exercised from `apps/cli/features/**/*.spec.ts`.

**Build/Dev:**
- TypeScript compiler (`tsc`) - build and typecheck in `package.json`, outputting to `dist/` per `tsconfig.json`.
- `tsx` 4.19.3 - local dev entry for `src/cli.ts` and the launcher install script in `scripts/install-local-launcher.ts`.
- Custom template copy/smoke scripts - `scripts/copy-templates.mjs` and `scripts/dist-smoke.mjs` validate the built distribution.

## Key Dependencies

**Critical:**
- `commander` ^13.1.0 - the public CLI contract is defined in `src/cli.ts`; every user-facing command path depends on it.
- TypeScript/Vitest toolchain - scaffold correctness depends on `typescript`, `vitest`, and `tsx`, as wired in `package.json`, `tsconfig.json`, `vitest.config.ts`, and `vitest.bdd.config.ts`.
- First-party templates - scaffold content is sourced from `src/templates/**`, then consumed by `src/generators/*.ts` and `src/core/template-loader.ts`.

**Infrastructure:**
- Kamal deploy templates - generated from `src/generators/config.ts` into `config/deploy.yml` and `config/deploy.cognee.yml`.
- OpenCode global runtime assets - emitted by `src/core/opencode-skill.ts` into `~/.opencode/skills/ai-harness/`, `~/.config/opencode/oh-my-opencode.json`, and `~/.config/opencode/get-shit-done/workflows/autonomous.md`.
- Gitleaks + pre-commit - local quality/security hooks are scaffolded from `src/templates/root/pre-commit.yaml` into `.pre-commit-config.yaml` and enforced by `.codex/scripts/land.sh`.

## Configuration

**Environment:**
- Local scaffold environment is generated from `src/templates/root/env.example` and `src/templates/root/envrc`; merge behavior is implemented in `src/generators/root.ts`.
- Default compute/deploy settings are hard-coded in `src/core/policy.ts` and threaded through `src/commands/init.ts` into generated config.
- Worktree-local environment/bootstrap behavior is handled by `.codex/scripts/bootstrap-worktree.sh`, which links shared `.env*` and `.kamal/secrets*` files when a git worktree is detected.

**Build:**
- `tsconfig.json` controls ESM (`module: NodeNext`), declaration output, source maps, and `dist/` output.
- `package.json` defines `build`, `dev`, `typecheck`, `test`, `test:bdd`, and `test:smoke:dist`.
- `scripts/dist-smoke.mjs` requires `dist/src/cli.js` and `dist/src/templates`, so built artifacts are part of the supported local distribution path.

## CLI and Generated Template Surfaces

**Runtime entrypoints:**
- `src/cli.ts` is the source CLI entrypoint.
- `dist/src/cli.js` is the packaged runtime entrypoint exposed by `package.json#bin`.
- `src/index.ts` is the library export surface for `runInit`, `runDoctor`, and `runInstallSkill`.
- `src/local-launcher.ts` and `scripts/install-local-launcher.ts` install a local `ai-harness` wrapper into `~/.local/bin/`.

**Generated-template surfaces:**
- `src/templates/**` is the canonical scaffold source, as stated in `README.md`, `docs/ai-harness-premise.md`, and `docs/architecture.md`.
- `src/generators/codex.ts`, `src/generators/config.ts`, `src/generators/root.ts`, and `src/generators/rules.ts` map template content into generated repo files such as `.codex/**`, `.rules/**`, `.opencode/worktree.jsonc`, `.kamal/secrets.example`, and `config/*.yml`.
- `dist/src/templates/**` is the built mirror consumed by compiled code; `scripts/dist-smoke.mjs` validates that this mirror exists.

## Migration-Relevant Notes

**Observed current state:**
- The source-of-truth repo surface has already moved away from default GSD scaffolding: `src/generators/rules.ts` emits `.rules/patterns/operator-workflow.md` and `.rules/patterns/omo-agent-contract.md`, while `docs/ai-harness-premise.md`, `docs/ai-harness-map.md`, and `docs/migration-plan.md` all describe `.codex/` + Beads + Cognee as the active foundation.
- The public CLI still models assistants as only `codex` or `opencode` in `src/core/types.ts` and validates only those values in `src/cli.ts`; there is no Pi-specific runtime target today.
- The OpenCode/OMO-specific install path remains first-class: `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/oh-my-opencode.json`, and `docs/harness-usage.md` all target OpenCode home-directory assets.

**Migration implications:**
- A Pi-oriented transition does not need to replace the scaffold core first; it needs to replace the assistant-specific seams currently anchored in `src/core/types.ts`, `src/cli.ts`, `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/**`, and `.opencode/worktree.jsonc` generation in `src/generators/root.ts`.
- OMO policy is not isolated to one file. It is enforced in `.rules/patterns/omo-agent-contract.md` and then referenced from `AGENTS.md`, `.codex/README.md`, `.codex/workflows/autonomous-execution.md`, `.codex/skills/harness/**/*.md`, and doctor/test coverage such as `src/commands/doctor.ts`, `tests/integration/docs-alignment.test.ts`, and `tests/integration/doctor.test.ts`.
- The built `dist/` artifact is materially relevant to migration planning because the launcher and published bin prefer `dist/src/cli.js`. Current built output is not fully aligned with source: `dist/src/generators/rules.js` still emits `gsd-workflow.md` and `cognee-gsd-integration.md`, and `dist/src/templates/root/README.md` still mentions GSD and `.planning/`, while the current source equivalents in `src/generators/rules.ts` and `src/templates/root/README.md` have already moved to OMO-only guidance.

## Platform Requirements

**Development:**
- Local Node 22+ plus pnpm are required by `package.json`.
- Git, pre-commit, and shell tooling are expected by `src/core/git.ts`, `.pre-commit-config.yaml`, and `.codex/scripts/*.sh`.
- Optional local tools materially shape behavior: `bd`, `direnv`, `gitleaks`, `gh`, `ocx`, and `ssh` are all referenced in generated scripts and docs such as `.codex/scripts/bootstrap-worktree.sh`, `.codex/scripts/land.sh`, and `docs/harness-usage.md`.

**Production:**
- This repo is a local-use CLI, not a long-running service, per `README.md` and `docs/migration-plan.md`.
- The only service-shaped runtime that ships here is the optional Cognee deployment template backed by `config/deploy.cognee.yml` and `.codex/docker/Dockerfile.cognee`, targeting compute host `10.10.20.138` and registry `harbor.compute.lan` from `src/core/policy.ts`.

---

*Stack analysis: 2026-04-04*
