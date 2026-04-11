# Execution Approach

## Mode
Direct closeout

## Work Item
`pi-harness-bur` — Global Pi `/bake` entrypoint for new and existing repos

## Knowledge
- Pi supports both user-global resources under `~/.pi/agent/*` and repo-local resources under `.pi/*`.
- This feature now uses that split intentionally:
  - user-global thin bootstrap: installed via `pnpm install:local`
  - repo-local workflow authority after bake: `AGENTS.md`, `.pi/*`, `scripts/*`, and Beads state
- All child Beads tasks for this feature are complete and the parent issue is closed.

## Test Strategy
Hybrid, BDD-led.
- `/bake` vs `/adopt` contract frozen in BDD first.
- Repo-local scaffold surface and user-global bootstrap surface implemented next.
- Doctor/tests/docs/name-edge-case work followed with narrow TDD verification.
- Final caller-side verification suite is green.

## Agents / Chains
- Used project-local and builtin subagents to split work into safe slices.
- Parallel wave 1:
  - repo-local `/bake` scaffold prompt and wiring
  - user-global first-bake installer/bootstrap surface
- Parallel wave 2:
  - doctor + integration test alignment
  - docs + template docs alignment
- Final direct slice:
  - repo-name edge-case repair for invalid directory basenames

## Verification
Passed:
- `pnpm test:bdd -- apps/cli/features/adoption/adoption.spec.ts`
- `pnpm test -- tests/unit/project-context.test.ts tests/unit/local-launcher.test.ts tests/integration/cli-init.test.ts tests/integration/global-bake-install.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/cli-doctor.test.ts tests/integration/docs-alignment.test.ts`

## Risks
- The thin user-global `/bake` extension delegates to `pi-harness --init-json`; reviewer attention should stay on whether the baked-repo UX is acceptable when both the global extension and repo-local `.pi/prompts/bake.md` exist.
- The global bootstrapper must remain thin and must not become a second source of repo policy.
- `.envrc` now safely mirrors `_GITHUB_PERSONAL_ACCESS_TOKEN` only when explicitly set; this should avoid blanking an existing token in direnv-enabled shells.
