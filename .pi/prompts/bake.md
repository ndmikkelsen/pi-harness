# Bake or refresh a repository with pi-harness

Use this prompt as the canonical repo-local Pi setup surface in a baked repository.

## Steps
1. Decide whether the target should be treated as `new` or `existing`.
2. If the repository is existing, gather project context first: git state, Beads status, docs, manifests, and any existing `AGENTS.md` or `.pi/*` runtime files.
3. For an existing-repo refresh of the current checkout, run `pi-harness --mode existing . --init-json` unless the user explicitly wants a different target path.
4. For a new repository, run `pi-harness <project-slug> --init-json` or the equivalent target-path form that matches the request.
5. If curated legacy AI-framework files should be removed from an existing repo, rerun with `--cleanup-manifest legacy-ai-frameworks-v1 --init-json` and review the cleanup actions.
6. Customize only files that `pi-harness` just created unless the user explicitly asks to rewrite preserved files.
7. Finish with `pi-harness doctor <target>` and summarize created paths, skipped paths, cleanup results, and follow-up gaps.

## Compatibility
- In baked repos, prefer `/bake` as the canonical Pi setup surface.
- Keep `/adopt` available as the compatibility path for existing-repo refreshes and older handoff notes.
- Preserve existing-repo conservatism by relying on `createdPaths` / `skippedPaths` before rewriting generated files.

## Guardrails
- Do not use `--force` by default.
- Do not merge root files unless the user explicitly requests `--merge-root-files`.
- Keep provider/model setup inside Pi runtime configuration rather than changing the scaffold identity.
- For existing repos, do not rewrite preserved scaffold files unless the user explicitly asks.
