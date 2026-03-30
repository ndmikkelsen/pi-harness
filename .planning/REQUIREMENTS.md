# Requirements: AI Harness

## v1 Requirements

### Core Flows

- [x] Bootstrap a new repository with the full AI workflow scaffold from `ai-harness`.
- [x] Adopt an existing repository without overwriting pre-existing managed files unless explicitly forced.
- [x] Generate a shared Codex/OpenCode runtime surface, planning docs, rules, deploy templates, and local handoff guidance.
- [x] Install a global OpenCode skill named `harness` that drives the `ai-harness` CLI against the current repo.
- [x] Audit a scaffolded repository with `ai-harness doctor`.

### Quality Gates

- [x] Keep scaffold generation modular and covered by unit and integration tests.
- [x] Keep generated `dist/` templates aligned with source templates.
- [x] Preserve placeholder-only secret values in `.env.example` and related templates.

## v2 Requirements

- Improve local installation and refresh ergonomics beyond the current checkout + `install:local` flow.
- Improve merge and update ergonomics for existing scaffold files beyond root-file merges.
- Add richer inspection and repo-adoption assistance beyond `doctor` and `init-json`.

## Out of Scope

- Heuristic deletion of legacy AI files outside curated cleanup manifests.
- Direct secret retrieval or storage in scaffolded example files.
- Remote infrastructure mutation outside repo-driven deploy workflows.

## Traceability

| Requirement | Phase | Status |
| --- | --- | --- |
| CORE-01 Safe new-project scaffold | Phase 1 | Done |
| CORE-02 Existing-repo adoption | Phase 1 | Done |
| CORE-03 Shared Codex/OpenCode runtime | Phase 1 | Done |
| CORE-04 Global `harness` skill install | Phase 2 | Done |
| CORE-05 Self-hosted scaffold adoption | Phase 2 | Done |
| CORE-06 Local-use distribution and migration hardening | Phase 3 | Done |

## Notes

- Current scope is derived from `README.md`, `docs/ai-harness-premise.md`, `docs/ai-harness-map.md`, and the active CLI/test surface.
