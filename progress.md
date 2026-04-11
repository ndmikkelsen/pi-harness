# Progress

## Work Item
`pi-harness-bur` — Global Pi `/bake` entrypoint for new and existing repos

## Status
Completed

## Test Strategy
Hybrid, BDD-led.
- BDD first: froze the `/bake` vs `/adopt` contract in adoption coverage.
- Then implemented the repo-local bake surface and the thin user-global bootstrap surface in separate slices.
- Then aligned doctor, integration coverage, docs, and repo-name edge cases with narrow TDD verification.
- Cognee was attempted earlier for planning, but local repository evidence stayed authoritative.

## Tasks
- [x] Defined the canonical baked-repo contract: `/bake` is the primary setup surface and `/adopt` remains the conservative compatibility path.
- [x] Added the scaffolded repo-local `.pi/prompts/bake.md` surface and aligned bake/adopt skill/prompt wording.
- [x] Added the thin user-global Pi `/bake` installer path through `pnpm install:local`.
- [x] Updated doctor and integration coverage to enforce the new bake surfaces.
- [x] Updated root/template/dogfood docs to describe the global-first `/bake` story and repo-local authority split.
- [x] Fixed inferred repo-name edge cases so no-arg bake/adoption works from invalid directory basenames.
- [x] Included the repo-local `.envrc` improvement so direnv only mirrors `_GITHUB_PERSONAL_ACCESS_TOKEN` when explicitly set.

## Files Changed
- `scripts/install-local-launcher.ts`, `src/local-launcher.ts` - install the local `pi-harness` launcher and the thin user-global Pi `/bake` extension.
- `src/generators/pi.ts`, `src/templates/pi/prompts/bake.md`, `src/templates/pi/prompts/adopt.md`, `src/templates/pi/skills/bake/SKILL.md` - add and align the baked-repo setup surfaces.
- `src/commands/doctor.ts` - validate the managed bake prompt and related workflow contract.
- `src/core/project-input.ts`, `src/core/strings.ts` - repair inferred names for invalid directory basenames while keeping explicit names strict.
- `README.md`, `docs/bake-usage.md`, `src/templates/root/README.md`, `.pi/prompts/*`, `.pi/skills/bake/SKILL.md`, `.pi/extensions/repo-workflows.ts` - document and dogfood the new bake story.
- `src/templates/pi/mcp.json` - realign the scaffolded MCP baseline with the dogfooded `.pi/mcp.json` so release verification stays green.
- `tests/unit/project-context.test.ts`, `tests/unit/local-launcher.test.ts`, `tests/integration/global-bake-install.test.ts`, `tests/integration/cli-init.test.ts`, `tests/integration/init.test.ts`, `tests/integration/scaffold-snapshots.test.ts`, `tests/integration/cli-doctor.test.ts`, `tests/integration/docs-alignment.test.ts`, `apps/cli/features/adoption/*` - lock the new behavior into BDD/unit/integration coverage.
- `.envrc` - export `GITHUB_PERSONAL_ACCESS_TOKEN` from `_GITHUB_PERSONAL_ACCESS_TOKEN` only when the helper variable is set.

## Verification Evidence
- BDD contract: `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- Targeted suite: `pnpm test -- tests/unit/project-context.test.ts tests/unit/local-launcher.test.ts tests/integration/cli-init.test.ts tests/integration/global-bake-install.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-doctor.test.ts tests/integration/docs-alignment.test.ts`
- Release-prep RED/GREEN: `./scripts/promote.sh` failed first on `tests/integration/docs-alignment.test.ts` because `src/templates/pi/mcp.json` was missing `directTools: true`; `pnpm test -- tests/integration/docs-alignment.test.ts` passed after realigning the template.
- Beads closure:
  - `pi-harness-bur.1` closed with BDD verification
  - `pi-harness-bur.2` closed with scoped scaffold smoke verification
  - `pi-harness-bur.3` closed with installer smoke verification
  - `pi-harness-bur.4` closed with targeted doctor/integration verification
  - `pi-harness-bur.5` closed with docs-alignment verification
  - `pi-harness-bur.6` closed with unit + CLI-init verification
  - parent `pi-harness-bur` closed after the combined targeted bake suite stayed green

## Notes
- The user-global `/bake` surface is intentionally thin and delegates to `pi-harness --init-json`; repo-local prompts, skills, docs, and scripts remain the source of project policy after bake.
- Reviewer focus before or after serve: confirm the baked-repo UX is acceptable when both the global `/bake` extension and repo-local `.pi/prompts/bake.md` exist.
- Unrelated local-only file remains outside git tracking as intended: `STICKYNOTE.md`.
