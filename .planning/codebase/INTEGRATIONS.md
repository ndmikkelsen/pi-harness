# External Integrations

**Analysis Date:** 2026-04-04

## APIs & External Services

**Knowledge and planning:**
- Cognee service - knowledge brief, search, upload, and cognify operations are invoked by first-party shell wrappers in `.codex/scripts/cognee-bridge.sh`, `.codex/scripts/cognee-brief.sh`, `.codex/scripts/cognee-sync-planning.sh`, and `.codex/scripts/sync-planning-to-cognee.sh`.
  - SDK/Client: shell + `curl` against `/health`, `/api/v1/search`, `/api/v1/add`, and `/api/v1/cognify` in `.codex/scripts/cognee-bridge.sh`.
  - Auth: `COGNEE_URL` runtime override; deploy-time secrets include `LLM_API_KEY`, `DB_PASSWORD`, `VECTOR_DB_PASSWORD`, `RELATIONAL_DATABASE`, and `VECTOR_DB_URL` in `config/deploy.cognee.yml`.
  - Observed state: source templates for generated repos live in `src/templates/codex/scripts/cognee-bridge.sh` and `src/templates/config/deploy.cognee.yml`.
  - Migration implication: Pi transition can keep the Cognee HTTP seam mostly intact and replace only the assistant-facing wrappers and policy docs that decide when it is mandatory.

**Source control and code hosting:**
- GitHub - PR creation/update is handled by `gh` from `.codex/scripts/land.sh`; repo docs and tests assume a feature-branch-to-`dev` PR flow in `AGENTS.md`, `.rules/patterns/omo-agent-contract.md`, and `tests/integration/land-script.test.ts`.
  - SDK/Client: GitHub CLI (`gh`) invoked from `.codex/scripts/land.sh`.
  - Auth: external GitHub CLI login/session; no repo-local token handling is implemented.
  - Observed state: GitHub support in `.beads/config.yaml` is only commented integration metadata (`github.org`, `github.repo`), not an active harness integration.
  - Migration implication: GitHub integration is independent of OpenCode/OMO; Pi can reuse `.codex/scripts/land.sh` behavior or replace it with an equivalent branch/PR publisher.

**Assistant runtime and global tooling:**
- OpenCode - the repo installs a global `harness` skill plus managed defaults/workflow into OpenCode home-directory paths through `src/commands/install-skill.ts` and `src/core/opencode-skill.ts`.
  - SDK/Client: first-party filesystem installer writing `~/.opencode/skills/ai-harness/skills/harness/`, `~/.config/opencode/oh-my-opencode.json`, and `~/.config/opencode/get-shit-done/workflows/autonomous.md`.
  - Auth: none in repo code; external OpenCode runtime owns execution credentials.
  - Observed state: this is the main global assistant integration described in `README.md`, `docs/harness-usage.md`, and `src/templates/codex/skills/harness/references/ai-harness-command-matrix.md`.
  - Migration implication: this is one of the clearest Pi replacement seams because there is no equivalent Pi installer, path layout, or `--assistant pi` mode today.

**OpenCode plugin and registry:**
- `kdco/worktree` plugin registry - optional worktree automation is documented in `.codex/README.md`, `docs/harness-usage.md`, and `src/templates/codex/README.md`.
  - SDK/Client: `ocx add kdco/worktree --from https://registry.kdco.dev` documented in multiple repo surfaces; generated config lives at `.opencode/worktree.jsonc` from `src/generators/root.ts`.
  - Auth: external OpenCode/registry auth, not managed by this repo.
  - Migration implication: any Pi-native worktree story replaces `.opencode/worktree.jsonc`, the `ocx` command references, and the OpenCode-specific plugin assumptions while preserving the reusable bootstrap script `.codex/scripts/bootstrap-worktree.sh`.

**Security and developer tooling:**
- Gitleaks - local secret scanning is configured in `.pre-commit-config.yaml` and invoked explicitly from `.codex/scripts/land.sh`.
  - SDK/Client: `gitleaks` CLI.
  - Auth: none.
- pre-commit - hook installation and fallback hook wiring are implemented in `src/core/git.ts` and configured by `.pre-commit-config.yaml`.
  - SDK/Client: `pre-commit` CLI.
  - Auth: none.
- direnv - worktree bootstrap attempts `direnv allow` when `.envrc` exists in `.codex/scripts/bootstrap-worktree.sh`.
  - SDK/Client: `direnv` CLI.
  - Auth: local shell trust; no repo-local secret retrieval logic.

## Data Storage

**Databases:**
- Beads local state - the scaffold generates `.beads/config.yaml` and assumes Beads owns project-local tracker state in `.beads/`; docs in `AGENTS.md`, `.rules/patterns/beads-integration.md`, and `.codex/workflows/autonomous-execution.md` drive native `bd` usage.
  - Connection: CLI/local filesystem, not an app-managed connection string.
  - Client: `bd` CLI.
- Optional Cognee relational/vector database - `config/deploy.cognee.yml` provisions a `pgvector/pgvector:pg17` accessory database for Cognee with host, DB name, and secret wiring.
  - Connection: secrets and clear env in `config/deploy.cognee.yml` (`DB_HOST`, `DB_PORT`, `VECTOR_DB_HOST`, `VECTOR_DB_PORT`, `RELATIONAL_DATABASE`, `VECTOR_DB_URL`).
  - Client: Cognee container defined by `.codex/docker/Dockerfile.cognee`.

**File Storage:**
- Local filesystem only for the CLI/scaffold itself - generated files are written by `src/core/filesystem.ts` into target repositories.
- NFS-backed Postgres volume for optional Cognee deploy - `/mnt/nfs/databases/ai-harness/cognee` in `config/deploy.cognee.yml`.

**Caching:**
- None detected in `src/`, `.codex/`, `config/`, or docs.

## Authentication & Identity

**Auth Provider:**
- No first-party application auth provider is implemented because this repo is a local CLI, not an end-user service, per `README.md` and `docs/migration-plan.md`.
  - Implementation: external CLIs and deployed services handle their own auth boundaries.

**Identity-bearing integrations:**
- SSH identity for compute-host operations is encoded via `src/core/policy.ts` and generated into `config/deploy.yml`, `config/deploy.cognee.yml`, and `src/core/port-detection.ts` using `~/.ssh/z3r0Layer-main`.
- GitHub identity is delegated to the local `gh` session used by `.codex/scripts/land.sh`.
- OpenCode identity/config is delegated to the user home directory via `src/core/opencode-skill.ts` and `src/commands/install-skill.ts`.

## Monitoring & Observability

**Error Tracking:**
- None detected as a service integration. No Sentry, Honeycomb, Datadog, or similar package/config appears in `package.json`, `src/`, `.codex/`, or `config/`.

**Logs:**
- Script stdout/stderr is the primary observability channel. See `.codex/scripts/cognee-bridge.sh`, `.codex/scripts/bootstrap-worktree.sh`, `.codex/scripts/land.sh`, and the human-readable report formatters in `src/commands/init.ts` and `src/commands/install-skill.ts`.
- Health checks for optional Cognee deploy are configured in `config/deploy.cognee.yml` (`/health` with proxy healthcheck).

## CI/CD & Deployment

**Hosting:**
- No CI service is wired in-repo; no `.github/workflows/` or equivalent pipeline config is present.
- Optional deployment target is a compute host at `10.10.20.138` behind Harbor/Kamal, sourced from `src/core/policy.ts`, `config/deploy.yml`, and `config/deploy.cognee.yml`.

**CI Pipeline:**
- None detected as an external hosted pipeline.
- Local release/landing flow is embodied in `.codex/scripts/land.sh`, which runs `pnpm typecheck`, `pnpm test`, `pnpm test:bdd`, `pnpm test:smoke:dist`, `gitleaks`, `git push`, and `gh pr create/view`.
- Local build validation of the distribution is implemented in `scripts/dist-smoke.mjs`.

## Environment Configuration

**Required env vars:**
- `COGNEE_URL` - optional runtime override used by `.codex/scripts/cognee-bridge.sh`; default is `https://ai-harness-cognee.apps.compute.lan` in the self-scaffolded repo and `https://{{APP_SLUG}}-cognee.apps.compute.lan` in `src/templates/codex/scripts/cognee-bridge.sh`.
- `KAMAL_REGISTRY_PASSWORD` - referenced by `config/deploy.yml` and `config/deploy.cognee.yml`.
- `DB_PASSWORD`, `VECTOR_DB_PASSWORD`, `RELATIONAL_DATABASE`, `VECTOR_DB_URL`, `LLM_API_KEY` - required by `config/deploy.cognee.yml` for the optional Cognee service.
- `SUPERMEMORY_API_KEY` - optional detection point in `src/commands/install-skill.ts` for OpenCode memory plugin guidance.
- `AI_HARNESS_REPO` - optional launcher override used by the wrapper rendered in `src/local-launcher.ts`.

**Secrets location:**
- Local repo secrets are expected through ignored env files and direnv-managed shell state; generation/merge behavior is defined in `src/generators/root.ts`, `.gitignore`, and `.codex/scripts/bootstrap-worktree.sh`.
- Deploy secrets live in `.kamal/secrets` and related `.kamal/secrets.*` files; only `.kamal/secrets.example` is committed, and real secrets are explicitly ignored per `.gitignore` and `.rules/patterns/deployment.md`.
- OpenCode global config lives in `~/.config/opencode/`; the repo writes managed defaults there but does not store credentials in-repo.

## Webhooks & Callbacks

**Incoming:**
- None detected. This repo does not expose webhook endpoints.

**Outgoing:**
- Cognee HTTP calls from `.codex/scripts/cognee-bridge.sh` to `/health`, `/api/v1/search`, `/api/v1/add`, and `/api/v1/cognify`.
- GitHub PR and query calls through `gh` in `.codex/scripts/land.sh`.
- SSH calls to the compute host from `src/core/port-detection.ts` when `--detect-ports` is enabled.

## Trust Boundaries and Replacement Points

**Observed trust boundaries:**
- First-party TypeScript code does not talk directly to hosted APIs; it shells out or writes config for external systems. The main boundaries are `bd`, `gh`, `pre-commit`, `gitleaks`, `ssh`, `ocx`, and `curl`, as seen in `src/core/git.ts`, `src/core/port-detection.ts`, and `.codex/scripts/*.sh`.
- Secrets are intentionally kept out of repo-authored runtime files. Placeholder-only scaffolding is generated in `src/generators/config.ts` and `src/generators/root.ts`, while real values are expected from ignored `.env*` files or `.kamal/secrets*`.
- The repo-local `.beads/config.yaml` only documents possible Jira/Linear/GitHub metadata keys; the harness does not configure those integrations itself.

**Likely Pi-transition replacement points:**
- Assistant selection and CLI surface: `src/core/types.ts` and `src/cli.ts` only allow `codex` and `opencode`; Pi needs a new assistant target or a replacement abstraction.
- OpenCode global installer: `src/commands/install-skill.ts`, `src/core/opencode-skill.ts`, `src/templates/opencode/oh-my-opencode.json`, and `src/templates/opencode/get-shit-done/workflows/autonomous.md` are explicitly OpenCode/OMO-specific.
- OMO authority layer: `.rules/patterns/omo-agent-contract.md` is the normative policy source, and `AGENTS.md`, `.codex/README.md`, `.codex/workflows/autonomous-execution.md`, and `.codex/skills/harness/**/*.md` all depend on it.
- OpenCode worktree path: `.opencode/worktree.jsonc`, `ocx add kdco/worktree --from https://registry.kdco.dev`, and related docs in `.codex/README.md` and `docs/harness-usage.md` are all OpenCode-specific seams that Pi would need to replace or retire.
- Oh-my-openagent lineage: `src/templates/opencode/oh-my-opencode.json` still points at the external schema URL `https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json`, and `src/commands/install-skill.ts` still carries explicit oh-my-opencode/supermemory compatibility guidance.

**Implied-by-docs vs implemented-in-code:**
- Pi/OMP integration is not implemented in the current repo-local code. No `pi` assistant option, Pi-specific installer, Pi config path, or Pi runtime docs are present in `src/`, `.codex/`, or `docs/`.
- Beads GitHub/Jira/Linear integration is implied by `.beads/config.yaml` comments only; the scaffold does not actively configure or invoke those providers.

**Build artifact caveat:**
- The shipped local runtime prefers `dist/src/cli.js` through `package.json#bin` and the launcher from `src/local-launcher.ts`, so `dist/` materially participates in integrations.
- Current source and built output are not fully aligned: `dist/src/generators/rules.js` still references `gsd-workflow.md` and `cognee-gsd-integration.md`, and `dist/src/templates/root/README.md` still describes GSD-era planning scaffolding, while current source moved to OMO-only guidance in `src/generators/rules.ts` and `src/templates/root/README.md`.

---

*Integration audit: 2026-04-04*
