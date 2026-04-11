# Review

## Verdict
Pass for `pi-harness-cw9`.

## What changed
- `/bake` is now a Pi-native execution path in both the installed global extension and baked repos.
- Existing-repo native bake runs now refresh managed scaffold files and auto-confirm curated legacy AI-scaffolding cleanup.
- `/skill:bake` guidance now points at the same native `/bake` contract.
- Generated docs/templates/doctor checks match the new contract.

## Risks
- The aggressive cleanup behavior is intentionally scoped to the curated `legacy-ai-frameworks-v1` manifest plus explicit `--cleanup-confirm-all`; conservative fallback still exists through `/adopt` and raw CLI usage.
- Custom advanced flag combinations beyond the default `/bake` flow still depend on users choosing the explicit fallback path.

## Caller-side checks
- Run `/bake` in an empty directory and confirm it emits new-project scaffold JSON.
- Run `/bake` in an existing repo containing curated legacy AI scaffolding and confirm only pi-harness baseline files remain.
- Run `pi-harness doctor <target>` after bake when you want an explicit audit.

## Verification evidence
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- `pnpm test:smoke:dist`

## Beads / Cognee
- Active Beads issue: `pi-harness-cw9`
- Cognee brief fallback recorded because datasets are missing.
