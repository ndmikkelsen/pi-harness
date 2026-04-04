# Codebase Concerns

**Analysis Date:** 2026-04-04

## Reading Guide

- **Status: Confirmed** means the concern is directly evidenced in the current repository state.
- **Status: Plausible** means the risk is evidence-backed but not reproduced as a failing runtime path during this mapping pass.
- Paths below point to the files that future planning or execution should inspect first.

## Tech Debt

**Assistant/runtime surface is still OpenCode- and OMO-shaped, not Pi-shaped:**
- Status: Confirmed
- Issue: The core assistant model only accepts `codex` and `opencode`, the CLI help only exposes those values, and global install support is hard-wired to OpenCode config/skill locations and OMO naming.
- Files: `src/cli.ts`, `src/core/types.ts`, `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/oh-my-opencode.json`, `docs/harness-usage.md`, `.codex/skills/harness/references/ai-harness-command-matrix.md`
- Impact: Pi-native support is not an additive template swap. It requires changing CLI parsing, type definitions, generator selection, install flows, global config ownership, docs, and tests. Leaving this as-is will keep future work anchored to OpenCode/OMO assumptions.
- Fix approach: Introduce a runtime-target abstraction above assistant-specific install/config code. Make OpenCode/OMO a backend adapter instead of the core model, then add Pi-native paths behind the same abstraction.

**Generated-output drift already exists between source templates, dogfooded repo files, and checked-in build artifacts:**
- Status: Confirmed
- Issue: The live repo runtime docs diverge from source templates, and checked-in `dist/` still contains removed planning templates. `src/templates/codex/agents/orchestrator.md` and `src/templates/codex/agents/implementer.md` no longer match `.codex/agents/orchestrator.md` and `.codex/agents/implementer.md`. `src/templates/planning/` is absent and `src/generators/planning.ts` returns `[]`, but `dist/templates/planning/` and `dist/src/templates/planning/` still exist.
- Files: `src/templates/codex/agents/orchestrator.md`, `.codex/agents/orchestrator.md`, `src/templates/codex/agents/implementer.md`, `.codex/agents/implementer.md`, `src/generators/planning.ts`, `scripts/copy-templates.mjs`, `dist/templates/planning/config.json`, `dist/src/templates/planning/STATE.md`, `package.json`, `src/local-launcher.ts`
- Impact: Contributors can update the canonical source and still ship stale behavior because the executable surface prefers `dist/src/cli.js` when it exists. Transition planning can also be misled by live repo docs that no longer represent the template source of truth.
- Fix approach: Add parity checks for `src/templates/**` vs dogfooded runtime files and for source templates vs checked-in `dist/`. Treat stale `dist/` as a failing condition before release, smoke, or launcher install.

**Planning/GSD removal is incomplete at the workflow boundary:**
- Status: Confirmed
- Issue: The generator no longer emits a default `.planning/` tree, and this repo currently only has `.planning/codebase/`, but multiple repo-facing docs and scripts still assume `.planning/STATE.md`, phase plans, and GSD-shaped planning artifacts may exist.
- Files: `.planning/`, `src/generators/planning.ts`, `docs/ai-harness-map.md`, `.codex/agents/implementer.md`, `.codex/agents/orchestrator.md`, `.rules/patterns/operator-workflow.md`, `.rules/patterns/omo-agent-contract.md`, `.codex/scripts/cognee-sync-planning.sh`, `src/templates/codex/scripts/cognee-sync-planning.sh`
- Impact: Future Pi work inherits mixed guidance: "no default planning scaffold" at the generator level, but "review `.planning/STATE.md` first" in agent and workflow docs. That inconsistency is a sharp edge for both humans and automation.
- Fix approach: Decide whether `.planning/` is an optional repo-local surface or a supported generated surface. Then update docs, scripts, and doctor checks to reflect only that decision.

**OpenCode global install behavior is spread across code, templates, docs, and tests with no replacement seam for OMO:**
- Status: Confirmed
- Issue: The current global install path writes the `harness` skill under `~/.opencode/skills/ai-harness/`, updates `~/.config/opencode/oh-my-opencode.json`, and installs `~/.config/opencode/get-shit-done/workflows/autonomous.md`. Those locations and file formats are encoded repeatedly.
- Files: `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/get-shit-done/workflows/autonomous.md`, `src/templates/opencode/oh-my-opencode.json`, `README.md`, `docs/harness-usage.md`, `tests/integration/install-skill.test.ts`, `tests/integration/cli-install-skill.test.ts`
- Impact: Replacing OMO is cross-cutting. A Pi-native replacement needs a new global config model, new workflow install target, and new docs/tests; there is no current adapter boundary that isolates that change.
- Fix approach: Extract install target, config schema, and workflow payload behind an explicit runtime backend interface. Keep OpenCode/OMO support as one implementation and add Pi as another.

## Known Bugs

**Stale planning scaffold is still present in checked-in `dist/`:**
- Status: Confirmed
- Symptoms: `dist/templates/planning/config.json` still declares `"governance": "GSD"`, and `dist/src/templates/planning/STATE.md` still exists even though `src/generators/planning.ts` emits no planning entries and `src/templates/planning/` does not exist.
- Files: `dist/templates/planning/config.json`, `dist/src/templates/planning/STATE.md`, `src/generators/planning.ts`, `scripts/copy-templates.mjs`
- Trigger: Any path that executes the already-built CLI without a rebuild, including the local launcher from `src/local-launcher.ts`.
- Workaround: Rebuild `dist/` before trusting generated output, but the current repo state still carries the stale artifact.

**Live agent docs in `.codex/agents/` are out of sync with current templates:**
- Status: Confirmed
- Symptoms: `.codex/agents/implementer.md` still tells the reader to review `.planning/STATE.md`, while `src/templates/codex/agents/implementer.md` now refers to active issue and repo-local handoff context. `.codex/agents/orchestrator.md` still centers `.planning/`, while `src/templates/codex/agents/orchestrator.md` now centers active issue and repo-local handoff/plan context.
- Files: `.codex/agents/implementer.md`, `src/templates/codex/agents/implementer.md`, `.codex/agents/orchestrator.md`, `src/templates/codex/agents/orchestrator.md`
- Trigger: Using the dogfooded repo docs directly instead of regenerating from source templates.
- Workaround: Prefer `src/templates/codex/agents/*.md` when auditing intended behavior until the dogfooded files are reconciled.

## Security Considerations

**Cognee bridge disables TLS verification for every network call:**
- Status: Confirmed
- Risk: The bridge uses `curl -sk` for health, search, upload, and cognify calls, which accepts invalid or spoofed TLS certificates.
- Files: `.codex/scripts/cognee-bridge.sh`, `src/templates/codex/scripts/cognee-bridge.sh`
- Current mitigation: Internal hostnames and short timeouts reduce operational friction, but they do not provide certificate validation.
- Recommendations: Remove `-k` by default, add an explicit insecure-mode flag or environment variable for lab environments, and fail loudly when HTTPS validation breaks.

**Worktree bootstrap propagates local secrets into every worktree and auto-runs `direnv allow`:**
- Status: Confirmed
- Risk: Fresh worktrees automatically symlink `.env`, `.env.local`, `.env.*.local`, `.kamal/secrets`, and `.kamal/secrets.*` from the main worktree, then call `direnv allow` when `.envrc` is present.
- Files: `.codex/scripts/bootstrap-worktree.sh`, `scripts/hooks/post-checkout`, `.beads/hooks/post-checkout`, `.gitignore`
- Current mitigation: `.gitignore` excludes the common secret paths, and the workflow docs describe the behavior.
- Recommendations: Make secret linking opt-in, or gate it behind an explicit environment variable. At minimum, print the linked secret paths and skip automatic `direnv allow` unless the user opts in.

**Optional Cognee deploy template assumes a trusted network and disables auth/access control:**
- Status: Confirmed
- Risk: The deploy template hard-codes `REQUIRE_AUTHENTICATION: "false"` and `ENABLE_BACKEND_ACCESS_CONTROL: "false"`.
- Files: `config/deploy.cognee.yml`, `.rules/patterns/deployment.md`, `src/templates/config/deploy.cognee.yml`
- Current mitigation: The docs frame this as an internal compute-lan service behind Traefik/kamal-proxy and emphasize repo-driven secrets handling.
- Recommendations: Keep this template clearly labeled internal-only, require an explicit opt-in to generate it, and add a hardened alternative for any Pi-native or non-LAN deployment path.

## Performance Bottlenecks

**Landing always runs the full verification stack sequentially:**
- Status: Confirmed
- Problem: Landing runs `pnpm typecheck`, `pnpm test`, `pnpm test:bdd`, `pnpm test:smoke:dist`, and `gitleaks` when available, regardless of the change scope.
- Files: `.codex/scripts/land.sh`, `package.json`
- Cause: The landing script is a single, unconditional gate for all runtime, docs, scaffold, and install changes.
- Improvement path: Split fast scoped checks from full release checks, or drive the landing gate from changed-path classification. Keep a full gate for release or dedicated CI, not every small documentation refresh.

**OpenCode install and runtime policy text is duplicated across many repo-facing docs:**
- Status: Confirmed
- Problem: The same install and runtime guidance is repeated across root docs, `.codex` docs, skill refs, templates, and tests.
- Files: `README.md`, `docs/harness-usage.md`, `.codex/README.md`, `.codex/skills/harness/SKILL.md`, `.codex/skills/harness/references/ai-harness-command-matrix.md`, `src/templates/codex/README.md`, `src/templates/codex/skills/harness/SKILL.md`, `tests/integration/docs-alignment.test.ts`, `tests/integration/install-skill.test.ts`
- Cause: One concept is represented in many independent markdown files instead of being generated from a smaller number of shared fragments.
- Improvement path: Consolidate repeated prose into fewer owned templates or generate repeated sections from shared snippets so Pi migration does not require synchronized edits across every doc/test surface.

## Fragile Areas

**`oh-my-opencode.json` merge policy preserves unrelated keys but overwrites managed agent/category names:**
- Status: Confirmed
- Files: `src/core/opencode-skill.ts`, `tests/integration/install-skill.test.ts`
- Why fragile: Reinstall keeps custom top-level keys but forcibly rewrites generated `agents` and `categories` entries. That is acceptable for managed OpenCode defaults today, but it will silently overwrite user tuning or Pi migration experiments if they reuse the same names.
- Safe modification: Change merge behavior only with explicit migration semantics and tests that define which keys are user-owned vs tool-owned.
- Test coverage: Current tests verify overwrite behavior for managed keys and preservation for unrelated keys, but only for the OpenCode path.

**Doctor does not scan all live repo-facing runtime docs for stale workflow assumptions:**
- Status: Confirmed
- Files: `src/commands/doctor.ts`, `.codex/agents/implementer.md`, `.codex/agents/orchestrator.md`, `tests/integration/doctor.test.ts`
- Why fragile: `runDoctor()` checks `AGENTS.md`, `.codex/README.md`, `.codex/workflows/autonomous-execution.md`, selected rules files, and worktree hooks, but it does not scan `.codex/agents/*.md`. The live repo already has stale planning references in those files without failing doctor.
- Safe modification: Expand doctor coverage to all generated user-facing docs under `.codex/`, especially agent briefs.
- Test coverage: The doctor suite proves stale GSD tokens are caught in rules/workflow docs, but it does not assert parity or stale-token scanning for `.codex/agents/*.md`.

**Launcher behavior depends on committed `dist/` state when it exists:**
- Status: Confirmed
- Files: `src/local-launcher.ts`, `package.json`, `scripts/dist-smoke.mjs`
- Why fragile: The launcher executes `dist/src/cli.js` before attempting a rebuild or source fallback. Any stale checked-in build artifact becomes the effective runtime even when source files say otherwise.
- Safe modification: Prefer rebuilding when source is newer than `dist/`, or make smoke/parity checks fail when committed `dist/` disagrees with source.
- Test coverage: Smoke tests verify that `dist/` exists and is runnable, not that it matches the current source tree.

## Scaling Limits

**Runtime installation is machine-local and OpenCode-global, with no coexistence model for Pi-native installs:**
- Status: Confirmed
- Current capacity: One local launcher under `~/.local/bin/ai-harness` plus one OpenCode skill/defaults/workflow installation under `~/.opencode/` and `~/.config/opencode/`.
- Limit: Pi-native runtime support cannot coexist cleanly with the current model because install roots, config filenames, and workflow directories are all OpenCode-specific.
- Files: `src/local-launcher.ts`, `src/core/opencode-skill.ts`, `docs/harness-usage.md`, `.codex/skills/harness/references/ai-harness-command-matrix.md`
- Scaling path: Introduce runtime-specific install roots and a versioned manifest of what each backend owns, so OpenCode compatibility and Pi-native support can coexist during migration.

## Dependencies at Risk

**OpenCode/OMO ecosystem contracts are pinned into templates and install flows:**
- Status: Confirmed
- Risk: The OpenCode defaults template points to an `oh-my-openagent` schema URL on the upstream `dev` branch, the install flow depends on `opencode-supermemory`, and the repo contains an OpenCode plugin footprint under `.opencode/package.json`.
- Files: `src/templates/opencode/oh-my-opencode.json`, `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `.opencode/package.json`, `.opencode/bun.lock`
- Impact: Upstream schema changes, plugin changes, or an OMO replacement will break local assumptions quickly because the repository does not own these contracts.
- Migration plan: Move external config/schema ownership behind a backend adapter and stop hard-coding upstream dev-branch schema URLs into the default template set.

## Missing Critical Features

**No Pi-native assistant target, doctor path, or global install path exists:**
- Status: Confirmed
- Problem: Assistant parsing, types, docs, tests, and install code only support `codex` and `opencode`, and `install-skill` explicitly rejects anything other than `opencode`.
- Blocks: Introducing Pi-native scaffold generation, doctor validation, or runtime installation without extending almost every OpenCode/OMO-specific surface first.

**No automated parity guard exists for source templates vs dogfooded repo files vs checked-in `dist/`:**
- Status: Confirmed
- Problem: The repo already shows drift, but there is no single test that asserts parity between `src/templates/**`, repo-local generated docs under `.codex/`, and `dist/**`.
- Blocks: Safe deprecation of OMO assumptions, because stale docs and build artifacts can survive even when source templates are updated.

## Test Coverage Gaps

**Agent-doc parity and live-doc stale-token coverage are missing:**
- Status: Confirmed
- What's not tested: Matching content between `src/templates/codex/agents/*.md` and `.codex/agents/*.md`, plus stale planning/GSD tokens in live agent docs.
- Files: `src/templates/codex/agents/orchestrator.md`, `src/templates/codex/agents/implementer.md`, `.codex/agents/orchestrator.md`, `.codex/agents/implementer.md`, `tests/integration/docs-alignment.test.ts`, `tests/integration/doctor.test.ts`
- Risk: Future migration work can leave misleading agent instructions in the live repo while tests still pass.
- Priority: High

**`dist/` parity is not validated, only smoke-tested:**
- Status: Confirmed
- What's not tested: Whether `dist/templates/**` matches `src/templates/**` after template removals or refactors.
- Files: `scripts/copy-templates.mjs`, `scripts/dist-smoke.mjs`, `tests/integration/init.test.ts`
- Risk: The executable build artifact can retain removed legacy surfaces, including GSD-era planning files, without a failing test.
- Priority: High

**Secret-handling and transport-hardening behaviors lack explicit regression tests:**
- Status: Plausible
- What's not tested: Failure behavior for verified TLS in Cognee calls, opt-in vs automatic secret propagation into worktrees, and hardening expectations for the internal-only deploy template.
- Files: `.codex/scripts/cognee-bridge.sh`, `.codex/scripts/bootstrap-worktree.sh`, `config/deploy.cognee.yml`, `tests/integration/bootstrap-worktree.test.ts`
- Risk: Hardening work can regress silently because current tests mostly prove operational behavior, not explicit security posture.
- Priority: Medium

---

*Concerns audit: 2026-04-04*
