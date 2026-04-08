## Operator Workflow Pattern

Use this file as the canonical day-to-day workflow for repositories scaffolded with `pi-harness`.

The default experience is interactive-first: pick ready work in Beads, scope with repo-local context, verify the result, then land from your feature branch.

## Start Or Resume Work

1. On a fresh checkout or git worktree, run `./.codex/scripts/bootstrap-worktree.sh` so local `STICKYNOTE.md`, shared `.env*`, and `.kamal/secrets*` links are set up when available.
2. If returning to in-flight work, review local handoff context first, especially `STICKYNOTE.md`, claimed Beads issue history, and any repo-local notes that define acceptance.
3. If the repository uses Beads, run `bd ready --json` and claim the active issue with `bd update <id> --claim --json`.
4. Capture scope and acceptance criteria in repo-local context before broad edits, for example in issue evidence or handoff artifacts.
5. For planning, research, or autonomous startup work, attempt `./.codex/scripts/cognee-brief.sh "<query>"` before broad exploration. If Cognee is unavailable, continue only when the task remains locally verifiable from `.rules/`, handoff notes, and repository evidence.

## Interactive-First Default

Use this loop for normal work:

1. `bd ready --json`
2. `bd update <id> --claim --json`
3. confirm or refresh repo-local acceptance criteria
4. implement, run required verification, and record evidence for handoff
5. close the Beads issue only after verification passes: `bd close <id> --reason "Verified: <artifact or task> passed" --json`
6. if you are in an execution/autonomous landing lane, finish the branch with `./.codex/scripts/land.sh`

## Quick Work

- For a single-session change, still use the Beads claim-first flow and run the smallest verification command that proves the change.
- Keep quick work in repo-local notes and handoff artifacts; skip heavyweight planning expansion unless risk or scope changes.

## BDD And TDD

- User-visible behavior starts with a `.feature` file.
- For TypeScript and Vitest repositories, prefer app-local BDD folders like `apps/<app>/features/<domain>/` with `.feature`, `.plan.md`, and `.spec.ts` together.
- Observe a real RED phase before production changes: run the failing BDD or unit test and confirm it fails for the right reason.
- GREEN means the smallest implementation that makes the scenario or test pass.
- REFACTOR keeps both the behavior lane and the regression lane green.

## Autonomous Power Mode

Use `.codex/workflows/autonomous-execution.md` when you want the system to drain ready work without prompting through each lane transition.

- start from `bd ready --json` when Beads is available
- attempt Cognee before broad planning or repository-wide exploration
- claim the next ready issue automatically
- prefer ready backlog work before ad hoc scope
- keep retrying until code, validation, verification, and acceptance criteria pass or a true blocker stops progress
- allow one automatic gap-closure cycle after verification reports `gaps_found`, then stop and hand off if gaps remain
- close issues only after verification passes
- land from the current feature branch before moving to the next issue

## Landing

`./.codex/scripts/land.sh` is a feature-branch closeout only.

- only execution or autonomous landing lanes may run it
- planning, research, and review lanes must hand off instead of publishing
- run it from a feature branch, never from `main` or `dev`
- keep issue state aligned with the latest verification evidence before landing
- it should push the current feature branch to its upstream remote
- it should ensure a pull request from the current feature branch to `dev` exists
- it must never merge, rebase onto, or push directly to `main`

## Promotion

Promotion from `dev` to `main` is a separate release step. Do not treat it as part of normal landing.

## If Beads Is Missing

- If `.beads/` or the `bd` executable is unavailable, continue with repo-local workflow guidance instead of blocking work.
- Record the missing tracker state in handoff notes so the repo can be initialized later.
- Missing Beads does not waive verification or Cognee judgment; continue only when the task remains locally verifiable.
