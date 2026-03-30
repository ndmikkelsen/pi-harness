# Migration Notes

## Completed changes

- renamed the project from `scaiff` to `ai-harness`
- renamed the global OpenCode skill from `scaiff-repo-setup` to `harness`
- updated package metadata, CLI help, launcher naming, templates, docs, and tests to match the new names
- added a dedicated `install-skill` command and global skill bundle installer
- applied the scaffold back onto this repository in preserve-by-default existing mode

## Behavior that stayed stable

- new-project scaffolding and existing-repo adoption share the same generator pipeline
- existing repositories preserve pre-existing managed files by default
- curated cleanup remains opt-in via `--cleanup-manifest legacy-ai-frameworks-v1`
- Codex and OpenCode continue to share one `.codex/` runtime surface
- local verification still centers on `pnpm typecheck`, `pnpm test`, and `pnpm test:smoke:dist`

## Current migration follow-up

- current supported install path is local checkout based: `pnpm install`, `pnpm build`, `pnpm install:local`, and `ai-harness install-skill --assistant opencode`
- `ai-harness` is intentionally a local-use tool for developer machines; there is no package-manager or registry publication path planned
- downstream repos should treat each scaffold or refresh as pinned to the `ai-harness` version and source commit used for that run
- generated repos now start with a scaffold baseline note in `.planning/STATE.md`; refresh PRs should record the old and new `ai-harness` versions as part of the handoff
- there is no separate `scaiff` compatibility alias; older references should move to `ai-harness` and the `harness` skill directly
- keep source templates, self-scaffolded repo files, and built `dist/` assets aligned as the product evolves
