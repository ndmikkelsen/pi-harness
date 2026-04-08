## Git Workflow Pattern

Use safe branch-based collaboration by default.

- create feature branches early and avoid working directly on `main` or `dev`
- land feature work by pushing the feature branch upstream and opening or updating a pull request to `dev`
- keep promotion from `dev` to `main` as a separate release step
- use conventional commit messages
- do not overwrite or revert unrelated user changes in a dirty worktree
- avoid destructive git commands unless they are explicitly requested and understood

## Worktrees

- prefer repo-local `git worktree` usage plus `./.codex/scripts/bootstrap-worktree.sh` so each fresh worktree seeds the same local runtime state
- keep `scripts/hooks/post-checkout` and `.beads/hooks/post-checkout` available as the fallback bootstrap path when the primary worktree flow is unavailable or you want manual control
