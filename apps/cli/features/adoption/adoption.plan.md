# Adoption feature plan

## Work Item

`pi-harness-bur.1`

## Goal

Freeze the user-visible adoption contract so baked repos keep `bake` as the canonical Pi setup surface while `/adopt` remains the compatibility path for existing-repo refreshes.

## Scenarios covered

- preserve pre-existing root files by default
- merge root scaffold entries only when explicitly requested
- remove curated legacy files through cleanup
- report ambiguous cleanup entries without deleting them
- add the Pi runtime compatibility files to an existing project

## Key assertions

- adopted repos create `.pi/skills/bake/SKILL.md` as the canonical bake surface
- adopted repos still create `.pi/prompts/adopt.md` for conservative `/adopt` compatibility
- the bake skill keeps the `name: bake` contract and existing-repo adoption guidance
- the adopt prompt keeps the existing-repo `pi-harness --mode existing . --init-json` path
- no OpenCode or OMO compatibility files are generated

## Red → Green → Refactor

- RED: `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts` after wiring the new bake/adopt contract checks into the adoption steps, expecting the spec to fail until the shared assertion helper exists.
- GREEN: implement the smallest shared helper in `apps/cli/features/steps/adoption.steps.ts` so the adoption scenarios assert the canonical bake surface and `/adopt` compatibility from real generated files.
- REFACTOR: keep the checks shared across the existing-project scenarios so the contract stays consistent without duplicating assertions.

## Notes

- Cognee was skipped for this slice because the issue is bounded to existing BDD assets and local repository evidence is sufficient.
- `apps/cli/features/init/init.plan.md` does not need changes for this slice because the new-project contract already covers the same generated Pi bake assets from the init side.
