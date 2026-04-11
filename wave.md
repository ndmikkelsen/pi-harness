# Execution Approach

## Mode
Direct bugfix

## Work Item
pi-harness-4mj — fix generated global `/bake` extension escaping so `pnpm install:local` emits parseable TypeScript.

## Knowledge
- `bd ready --json` returned `[]`, so the bug was created and claimed as `pi-harness-4mj`.
- Cognee brief was attempted and unavailable because datasets are not seeded.
- The generated extension in `~/.pi/agent/extensions/pi-harness-bake/index.ts` was emitting under-escaped backslashes, producing `if (char === '\')` as `if (char === '")` in the installed file and causing Pi startup to fail.

## Test Strategy
TDD, narrow regression-first.
- RED: add tests proving the rendered global extension preserves escaped backslashes and can be parsed/imported after generation.
- GREEN: fix the escaping in `renderGlobalBakeExtension`.
- REFACTOR: rebuild and reinstall locally, then import the installed extension to confirm the real artifact parses.

## Verification
- `pnpm test -- tests/unit/local-launcher.test.ts tests/integration/global-bake-install.test.ts`
- `pnpm typecheck`
- `pnpm build`
- `pnpm install:local`
- `node node_modules/tsx/dist/cli.mjs -e 'import("/Users/naynay/.pi/agent/extensions/pi-harness-bake/index.ts")'`

## Risks
- Low: fix is isolated to generated extension escaping and targeted tests now cover the installed artifact path.
