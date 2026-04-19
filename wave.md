# Execution Approach

## Mode
Direct

## Work Item
<<<<<<< HEAD
`untracked`
- PR: `#44` (`dev` -> `main`)
- Beads: `bd ready --json` returned `[]`; no active ready issue was claimed for this slice.

## Knowledge
- GitHub MCP was used for PR inspection.
- Shell fallback was required for conflict resolution because the merge itself had to be resolved in git, not through a GitHub-side update action.
- The conflicting surfaces were workflow artifacts plus one test expectation.

## Test Strategy
Hybrid.
- Keep the merge resolution minimal and preserve both landed feature sets.
- Verify the merged workflow scaffold/test surfaces with targeted commands.
- Squash merge only after the PR returns to a clean mergeable state.

## Decision Rationale
- This task is operational and bounded: resolve the PR conflict, keep both change sets, verify, and merge.
- Direct mode is better than delegation because the conflict scope is small, the affected files are already known, and adding a subagent handoff would add overhead without reducing risk.
- The safe resolution is to keep both the swarm-lane changes from `main` and the direct GitHub MCP support for `lead` from `dev`.

## Routing Signals
- Hard triggers present:
  - explicit PR conflict resolution
  - explicit squash-merge request
  - GitHub-native repository operation
- Soft triggers present:
  - workflow artifact drift after branch divergence
  - targeted verification needed after auto-merge updates
- Why the split stays safe:
  - only four files needed manual conflict resolution
  - the functional code/test changes auto-merged cleanly

## Agents / Chains
- none; direct merge-unblock path

## Delegation Units
- none

## Verification
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts tests/integration/role-workflow.test.ts`
- `pnpm typecheck`
- PR #44 must show mergeable before squash merge.

## Risks
- The repo-root workflow artifacts are hand-maintained and can drift during branch merges.
- If branch protection or GitHub mergeability metadata lags, the merge step may need a short retry after push.
=======
untracked

## Knowledge
Cognee attempted via `./scripts/cognee-brief.sh "bake current repo scaffold refresh"`; unavailable for search because datasets are not seeded.

## Test Strategy
TDD-style operational verification. RED is not a code test here; the narrow proof is a successful existing-repo bake refresh followed by `pi-harness doctor .` and a scoped git diff review.

## Decision Rationale
- The request maps cleanly to the repo's bake skill and the user-global `/bake` flow.
- In this API session, the slash command surface is unavailable, so the underlying `pi-harness` CLI is the direct equivalent.
- Direct mode is better than delegation because this is a single bounded scaffold refresh with one authoritative command and one follow-up audit.

## Routing Signals
- Hard triggers present: execution request that matches the `bake` skill.
- Soft triggers present: existing-repo refresh may touch multiple scaffold surfaces.
- Safe to stay direct because ownership is explicit: run the supported bake refresh for the current repo, then audit the result.

## Agents / Chains
- None. Lead executes the supported bake refresh directly.

## Delegation Units
- Owner: lead
- Goal: Refresh the current repository to the supported pi-harness baseline using the bake contract.
- Allowed Files:
  - AGENTS.md
  - .pi/**
  - scripts/**
  - scaffold-managed root files
- Non-Goals:
  - manual feature edits outside scaffold refresh
  - provider/model configuration changes
- Inputs:
  - AGENTS.md
  - README.md
  - .pi/skills/bake/SKILL.md
  - docs/bake-usage.md
- Output:
  - refreshed scaffold files
  - updated `wave.md`
- RED:
  - bake or doctor reports drift or failure
- Caller Verification:
  - `pi-harness doctor .`
- Escalate If:
  - bake requests destructive cleanup not covered by the curated manifest
  - doctor reports non-managed drift that needs manual policy decisions

## Verification
`pi-harness doctor .`

## Risks
- Existing-repo refresh can update many managed files at once.
- Cognee context was unavailable, so decisions rely on current repo evidence only.
>>>>>>> dev
