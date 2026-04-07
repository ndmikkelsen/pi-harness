# Execution Approach

## Mode
Direct

## Work Item
untracked

## Knowledge
Cognee skipped for this landing pass because local repo state, README, STICKYNOTE, and the pending diff were sufficient.

## Test Strategy
TDD-first. The change is covered by integration tests around scaffold generation, doctor alignment, and landing behavior. RED/GREEN already happened in the existing working tree; landing will re-run the full verification sweep to confirm GREEN and keep REFACTOR safe.

## Agents / Chains
Main session only. No subagents needed because the work is already implemented and the remaining task is verify, commit, push, and confirm the PR state.

## Verification
`./scripts/land.sh --commit-message "feat: sync Pi artifacts during landing"`

## Risks
- Cognee sync is best-effort and may report an unavailable skip if the local bridge is not healthy.
- `.pi/npm/` is a local runtime artifact and should not be landed.
- No active Beads issue is available in this repository state (`bd ready --json` returned `[]`).
