## AI Workflow Scaffold

- Read `.rules/patterns/git-workflow.md` before committing.
- Read `.rules/patterns/env-security.md` before adding environment variables.
- Use `.planning/PROJECT.md` as the living product definition.
- Run `gitleaks detect --source . --no-git` before environment-related commits.
- Run Beads commands through `./.claude/scripts/bd` and initialize new repositories with `bd init`.
- On a fresh worktree, run `./.claude/scripts/bootstrap-worktree.sh` once before starting.
- Prefer reusable role briefs in `.claude/agents` and `.agents`.
- Use `.claude/commands` as a bounded command surface for quality gates and routines.
