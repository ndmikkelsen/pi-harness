# Execution Approach

## Mode
Direct bugfix closeout

## Work Item
pi-harness-4mj — fix generated global `/bake` extension escaping and land it through `dev` and `main`.

## Knowledge
- The installed global extension was failing Pi startup with an unterminated string constant.
- PR #19 to `dev` initially conflicted because `fix/bake` was behind `origin/dev`.
- The code merged cleanly with `origin/dev`; only tracked handoff artifacts required manual resolution.

## Test Strategy
TDD, narrow regression-first.
- Focus verification on the generated global extension and installed artifact parse path.
- Refresh the branch with `origin/dev`, then continue the normal serve/promote workflow.

## Verification
- `pnpm test -- tests/unit/local-launcher.test.ts tests/integration/global-bake-install.test.ts`
- `pnpm typecheck`
- `pnpm build`
- `pnpm install:local`
- `node node_modules/tsx/dist/cli.mjs -e 'import("/Users/naynay/.pi/agent/extensions/pi-harness-bake/index.ts")'`

## Risks
- Low: remaining work is release plumbing after the refreshed branch push.
