# Adopt an existing repository with pi-harness

Use this prompt when you need to scaffold or refresh an existing repository.

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
- Keep provider/model setup inside Pi runtime configuration rather than changing the scaffold identity.
