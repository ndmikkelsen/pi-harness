# Plan

## Work Item
pi-harness-cw9 — Pi-native `/bake` auto-detects repo mode and refreshes repos to the pi-harness baseline.

## Acceptance Criteria
1. `/bake` decides `new` vs `existing` automatically for the current directory or an explicit target path.
2. Existing-repo `/bake` runs refresh managed scaffold files and remove curated legacy AI scaffolding so the result matches the supported pi-harness baseline.
3. Baked repos expose a native Pi `/bake` entrypoint instead of requiring raw CLI flags.
4. `/skill:bake` guidance points to the same native `/bake` contract.
5. Generated docs, prompts, skills, scripts, and tests verify the new behavior.

## Test Strategy
Hybrid, integration-led RED -> GREEN -> REFACTOR.
- RED: targeted integration/unit tests for cleanup confirmation, global `/bake` extension generation, scaffolded repo `/bake` script/extension output, and docs alignment.
- GREEN: implement cleanup auto-confirm support, native `/bake` script + extension, and update docs/prompts/skills.
- REFACTOR: align doctor checks and repo/template copies, then rerun the narrow verification slice.

## Planned Steps
1. Add targeted RED coverage for cleanup auto-confirm and native `/bake` outputs.
2. Extend cleanup/init plumbing with an explicit auto-confirm option for curated cleanup manifests.
3. Implement smart `/bake` defaults in the installed global Pi extension.
4. Add scaffolded repo-native `/bake` support (`scripts/bake.sh` + `.pi/extensions/repo-workflows.ts`).
5. Update bake docs/prompts/skills/README/doctor guidance to make `/bake` and `/skill:bake` canonical.
6. Run targeted verification, update progress artifacts, and close the Beads issue only after passing.

## Notes
- `bd ready --json` returned no ready work, so this feature was created and claimed as `pi-harness-cw9`.
- Cognee brief was attempted but unavailable because datasets are not seeded.
