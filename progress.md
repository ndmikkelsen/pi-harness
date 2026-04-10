# Progress

## Work Item
untracked

## Status
Completed

## Summary
Resolved the `feat/bake` vs `origin/dev` merge conflicts by keeping the merged scaffold baseline consistent across runtime docs, templates, generator wiring, doctor checks, and integration coverage.

## Files Reconciled
- `AGENTS.md`, `README.md`, `docs/bake-usage.md`
- `.pi/prompts/serve.md`, `.pi/skills/bake/SKILL.md`
- `src/generators/pi.ts`, `src/commands/doctor.ts`
- `src/templates/pi/AGENTS.md`, `src/templates/pi/prompts/serve.md`, `src/templates/pi/skills/bake/SKILL.md`, `src/templates/root/README.md`, `src/templates/rules/patterns/git-workflow.md`
- `tests/integration/bootstrap-worktree.test.ts`, `tests/integration/cli-init.test.ts`, `tests/integration/docs-alignment.test.ts`, `tests/integration/doctor.test.ts`, `tests/integration/init.test.ts`, `tests/integration/scaffold-snapshots.test.ts`

## Notes
- Preserved the `feat/bake` scaffold direction while keeping the `dev` additions for GitHub MCP support and the separate `/promote` workflow.
- Replaced stale conflicting session artifacts with a current merge-resolution handoff.
- `bd ready --json` returned `[]`; this remains untracked.
