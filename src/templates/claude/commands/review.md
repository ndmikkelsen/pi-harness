---
name: review
description: Produce a concise quality and correctness review against project standards.
allowed-tools:
  - bash
  - read
  - grep
  - glob
  - edit
---

# /review

## Scope
Use for pre-merge checks, PR prep, or internal team handoff review.

## Mandatory Steps
- Confirm work matches stated scope and branch intent.
- Scan for correctness, regressions, security smells, and process violations.
- Verify tests, checks, and docs touched are aligned with code changes.
- Validate assumptions against local docs (`CLAUDE.md`, rules, architecture notes).
- Produce a pass/fail recommendation with exact file references.

## Commands (short)
- `git status --short`
- `git diff`
- `<project-test-cmd>`
- `<project-lint-cmd>`

## Output Requirements
- `Verdict` (`pass`, `needs-fix`, `blocker`).
- `Top Findings` by severity and file evidence.
- `Required Changes` as numbered items with owner + rationale.
- `No-Go Conditions` if any (security, data loss, behavior break).

## Anti-Patterns
- Don't invent issues without reproducible reasoning or file context.
- Don't mix stylistic preference with correctness blocking.
- Don't skip rule/doc checks even if tests look green.
- Don't review outside the task scope.
