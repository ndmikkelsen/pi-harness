# Execution Approach

## Mode
Direct

## Work Item
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
