## Git Workflow Pattern

Use safe branch-based collaboration by default.

- create feature branches early and avoid working directly on `main` or `dev`
- land feature work by pushing the feature branch upstream and ensuring a pull request to `dev` exists
- keep promotion from `dev` to `main` as a separate release step
- use conventional commit messages
- do not overwrite or revert unrelated user changes in a dirty worktree
- avoid destructive git commands unless they are explicitly requested and understood

## Worktrees

- for OpenCode-first workflows, prefer `kdco/worktree` plus the scaffolded `.opencode/worktree.jsonc` so worktree creation also runs `./.codex/scripts/bootstrap-worktree.sh --quiet`
- keep `git worktree` plus `scripts/hooks/post-checkout` as the fallback path when the plugin is unavailable or you want manual control
