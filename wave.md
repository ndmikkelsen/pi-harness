# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee was attempted with `./scripts/cognee-brief.sh "github mcp adapter add github mcp integration adapter support"`; it returned only generic scaffold guidance, so local repo files plus upstream adapter docs were treated as authoritative. I also inspected `https://github.com/nicobailon/pi-mcp-adapter` and the GitHub MCP server package docs for the project-local `.pi/mcp.json` contract.

## Test Strategy
TDD
- RED: extend scaffold/init/doctor/docs tests to expect `pi-mcp-adapter`, a managed `.pi/mcp.json`, and GitHub MCP setup guidance.
- GREEN: add the managed `.pi/mcp.json`, register `npm:pi-mcp-adapter`, wire template/root/docs parity, and validate the new baseline in `doctor`.
- REFACTOR: keep dogfood/template parity intact and verify the targeted integration suite plus typecheck/build.

## Agents / Chains
Main session only. This change stayed small but crossed scaffold templates, dogfooded runtime files, docs, and doctor checks, so splitting it would have increased overlap risk.

## Verification
Completed with:
- `pnpm test -- tests/integration/init.test.ts tests/integration/cli-init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/doctor.test.ts tests/integration/cli-doctor.test.ts tests/integration/docs-alignment.test.ts`
- `pnpm typecheck`
- `pnpm build`

## Risks
- `pi-mcp-adapter` is project-local runtime configuration, so the tracked scaffold ships only placeholder token wiring and keeps secrets in `.env`.
- The GitHub MCP baseline is intentionally opinionated; repos that do not want it can still edit `.pi/mcp.json`, but this scaffold now assumes GitHub-aware Pi usage by default.
- The adapter relies on Pi restarting or reloading project packages before `/mcp` and the GitHub server are available in-session.

## Result
- Added tracked project-local MCP config at `.pi/mcp.json` and scaffold-template parity at `src/templates/pi/mcp.json`.
- Registered `npm:pi-mcp-adapter` alongside `npm:pi-subagents` in dogfood and template `.pi/settings.json`.
- Added GitHub token placeholders and setup guidance in docs and env templates.
- Extended `doctor` and integration tests to enforce the new baseline.
