# Bake or refresh a repository with pi-harness

Use `/bake` as the canonical Pi-native entrypoint for setup and refresh work. Use `/skill:bake` when you want the same contract explained step by step before running it.

## What `/bake` does by default
1. Let `/bake` auto-detect whether the target is `new` or `existing`.
2. For a greenfield target, run the equivalent of `pi-harness --init-json`.
3. For an existing target, run the equivalent of `pi-harness --mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --init-json` so managed scaffold files refresh and curated legacy AI scaffolding is removed.
4. Finish by reviewing the emitted JSON and running `pi-harness doctor <target>` when you need an explicit audit.

## How to use it
- Run `/bake` with no args for the current directory.
- Run `/bake <path>` to target another directory.
- Run `/skill:bake` when you want guidance, constraints, and follow-up checks before invoking the same native `/bake` flow.
- Keep `/adopt` only as the conservative compatibility path when an older note explicitly wants preserve-existing behavior without `--force` or cleanup auto-confirmation.

## Guardrails
- Prefer `/bake` over raw CLI flags for normal setup and refresh work.
- Keep provider/model setup inside Pi runtime configuration rather than changing scaffold identity.
- Use `/adopt` only when the user explicitly wants existing scaffold files preserved by default.
- After `/bake`, summarize created paths, skipped paths, cleanup actions, and any follow-up gaps.
