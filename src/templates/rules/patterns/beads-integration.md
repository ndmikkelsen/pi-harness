## Beads Integration Pattern

Use native `bd` commands for Beads.

`operator-workflow.md` is the canonical interactive and autonomous runbook. This file only adds Beads-specific guidance.

Run `bd init` once per repository to initialize Beads using the official defaults.
Treat `.beads/` as project-local issue state by default.
Do not require a Beads Dolt remote or remote sync step for normal repository use.
Only reach for low-level `bd dolt` commands when explicitly debugging local Beads internals.
For worktrees, rely on Beads' built-in shared `.beads/` handling or `bd worktree create`; do not add custom compute/local switching in repo scripts.

## Beads -> Verify -> Beads

Use this loop for scoped work when Beads is available:

1. `bd ready --json`
2. `bd update <id> --claim --json`
3. Read the repo-local workflow and plan that define success for the claimed work
4. Execute and verify the work with the repo's documented commands and tests
5. `bd close <id> --reason "Verified: <artifact or phase> passed" --json`

- reference the active Beads issue IDs in handoff docs and verification notes
- do not close Beads issues ad hoc before verification passes
- if verification finds gaps, create follow-up Beads bug issues instead of hiding the failure
- use Beads dependencies to shape execution order when they exist

## Autonomous Workflow Integration

- if a repo adds an automated or autonomous workflow, gate all Beads operations behind a check for both `.beads/` and the `bd` executable
- when Beads is unavailable, skip tracking steps and continue with repo-local workflow guidance rather than blocking execution
- if Beads is available, start from ready work before untracked backlog work, create or claim the active issue before implementation, keep child tasks tied to concrete plans, and close them only after verification passes
- if verification reports retryable gaps, allow one automatic gap-closure cycle before stopping with follow-up tracking
- validate Beads config keys against the installed `bd` version before codifying JSONL or events export behavior
