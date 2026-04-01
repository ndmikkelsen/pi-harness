# State Tracker

Generated on: 2026-03-31

## Current Status

- Milestone: v1.0
- Active phase: None
- Status: Complete

## Active Context

- Current focus: v1.0 remains complete while post-v1.0 ergonomics now auto-wire worktree bootstrap hooks for new and adopted repos, and the optional Cognee deploy path is now live, queryable, and documented for repeatable operator use.
- Current branch: `feat/workflow-orientation`
- Active Beads epic: None
- Latest artifact reviewed: `src/core/git.ts`

## Recent Decisions

- Renamed the project from `scaiff` to `ai-harness` across package metadata, docs, templates, and tests.
- Renamed the global OpenCode skill to `harness` and installed it under `~/.opencode/skills/ai-harness/skills/harness/`.
- Applied the scaffold to this repository in preserve-by-default existing mode so runtime docs and planning artifacts live alongside the source code.
- Created Beads epics/tasks for Phases 2 and 3 and aligned them to dedicated GSD phase workspaces.
- Verified the Phase 2 dogfood loop with self-hosted dry-run adoption, repo doctor, sample existing-repo adoption, full tests, and dist smoke validation.
- Chose a local-use distribution model: `ai-harness` is used on local developer machines and is not planned for package-manager publication.
- Generated repos now record an `ai-harness` scaffold baseline and generation date in `.planning/STATE.md`.
- Phase 3 made the local install/update path and the no-alias `scaiff` migration stance explicit.
- v1.0 closes with all core flows and quality gates satisfied through the Phase 1-3 delivery arc.
- The canonical operator runbook now lives in `.rules/patterns/operator-workflow.md` and uses `/gsd-next` plus `/gsd-resume-work` as the default interactive GSD entrypoints.
- `/land` is scoped to feature-branch closeout only: push the feature branch, open or update the PR to `dev`, and never touch `main`.
- This repo is adopting a Muninn-style executable BDD lane with `.feature`, `.plan.md`, and `.spec.ts` under `apps/cli/features/` plus `pnpm test:bdd`.
- `ai-harness install-skill --assistant opencode` now owns both the global `harness` skill refresh and the managed OpenCode `/gsd-autonomous` workflow refresh.
- The optional Cognee deploy template now pins the published `cognee/cognee:latest@sha256:eba227c33dd7f5eb997a0072f418792fd8aaa8873e9bb12240915d4e69396970` image because the upstream release tags are not consistently published to Docker Hub; this keeps downstream deploys reproducible while still picking up the newer migration fixes from upstream main.
- The optional Cognee pgvector deploy flow now sets `ENABLE_BACKEND_ACCESS_CONTROL=false` alongside `REQUIRE_AUTHENTICATION=false` so single-tenant installs do not boot into unsupported multi-user handler validation.
- The optional Cognee deploy flow now follows the hardened sibling-repo pattern more closely: it pins the published image digest, probes `/health`, extends kamal-proxy `response_timeout` to `300`, sets `LLM_MODEL=gpt-4o-mini`, and forces `VECTOR_DATASET_DATABASE_HANDLER=pgvector`.
- With a funded `LLM_API_KEY` injected through `.kamal/secrets`, the committed Cognee deploy now passes end-to-end verification: `/health` and `/api/v1/settings` return `200`, `/api/v1/add` and `/api/v1/cognify` complete successfully, and `/api/v1/search` returns a grounded answer from the uploaded smoke dataset.
- `ai-harness` now auto-wires post-checkout worktree bootstrap for both fresh scaffolds and existing-repo adoption: prefer `pre-commit` when the scaffolded hook config is present, patch the active `core.hooksPath` when a repo uses custom hooks such as Beads, and fall back to a direct `.git/hooks/post-checkout` shim when needed.

## Open Questions

- Which additional shared GSD files, if any, should be managed through the same versioned OpenCode override mechanism beyond `autonomous.md`?
- Which v2 ergonomics improvements should land first after the workflow UX pass: refresh flow, merge/update help, or richer doctor/adoption guidance?

## Next Actions

- Merge the worktree-bootstrap automation to `dev`, then verify a fresh `git worktree add ...` inherits the local `.env*` and `.kamal/secrets*` links without manual setup.
- Merge the worktree-bootstrap automation to `dev`, then verify a fresh `git worktree add ...` inherits the local `.env*` and `.kamal/secrets*` links without manual setup.
- Capture any future Cognee provider changes by updating both `config/deploy.cognee.yml` and `.rules/patterns/deployment.md` so the live verification contract stays accurate.
