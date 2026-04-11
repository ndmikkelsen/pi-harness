# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee skipped. This was a scoped regression fix around `/bake` name inference in git worktrees, and local source/tests were sufficient.

## Test Strategy
TDD.
- RED: add coverage proving no-arg `/bake` in a linked git worktree should use the canonical repo slug, not the worktree directory name.
- GREEN: infer the scaffold name from git's common directory when the target is a worktree root.
- REFACTOR: keep non-git and explicit-name flows unchanged, then verify with narrow unit/integration runs.

## Agents / Chains
Main session only. The fix is localized to project-input inference plus targeted tests.

## Verification
- `pnpm test -- tests/unit/project-context.test.ts tests/integration/cli-init.test.ts`
- `pnpm build`
- `node dist/src/cli.js --skip-git --init-json`
- `node dist/src/cli.js --mode existing --force --cleanup-manifest legacy-ai-frameworks-v1 --cleanup-confirm-all --dry-run --init-json`

## Risks
- Git worktree detection depends on `git rev-parse --show-toplevel` and `--git-common-dir`; non-git or unusual bare-repo paths intentionally fall back to the target directory basename.
