# Adopt an existing repository with pi-harness

Use this prompt when you need the conservative existing-repo refresh path or a compatibility alias for older baked-repo notes.

For baked repos, prefer the user-global `/bake` command for execution and `/skill:bake` when you want the contract explained first. Keep `/adopt` for compatibility when the user explicitly asks to adopt or refresh an existing repository, when older notes still reference `/adopt`, or when preserve-existing behavior is the goal.

## Steps
1. Confirm the repository should be treated as `existing`, not `new`.
2. Gather project context first: git state, Beads status, docs, manifests, and any existing `AGENTS.md` or `.pi/*` runtime files.
3. Run `pi-harness --mode existing . --init-json` unless the user explicitly wants a different target path.
4. If curated legacy AI-framework files should be removed, rerun with `--cleanup-manifest legacy-ai-frameworks-v1 --init-json` and review the cleanup actions.
5. Customize only files that `pi-harness` just created unless the user explicitly asks to rewrite preserved files.
6. Finish with `pi-harness doctor .` and summarize created paths, skipped paths, cleanup results, and follow-up gaps.

## Guardrails
- Do not use `--force` by default.
- Do not merge root files unless the user explicitly requests `--merge-root-files`.
- If the user wants the standard bake defaults, point them to the user-global `/bake` command or `/skill:bake` instead of implying a repo-local `/bake` prompt exists.
- Keep provider/model setup inside Pi runtime configuration rather than changing the scaffold identity.
- Preserve existing-repo conservatism: customize only `createdPaths` by default and do not rewrite preserved scaffold files unless the user explicitly asks.
