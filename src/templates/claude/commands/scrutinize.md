---
name: scrutinize
description: Do a rigorous pass over a change set for defects, edge cases, and process gaps.
allowed-tools:
  - bash
  - read
  - grep
  - glob
  - edit
---

# /scrutinize

## Scope
Use when something looks "done" but needs a confidence check before review or handoff.

## Mandatory Steps
- Re-read requirements, acceptance criteria, and relevant constraints.
- Validate error paths, boundary cases, and assumptions in touched files.
- Look for missing tests and stale behavior in adjacent code paths.
- Check for data flow or state mismatches introduced by recent edits.
- Reproduce likely failure cases mentally and map to actual code paths.

## Commands (short)
- `git diff`
- `git diff HEAD~1..HEAD` (if in a task commit)
- `<project-test-cmd>`
- `<project-lint-cmd>`

## Output Requirements
- `Findings` ordered by severity (high/med/low).
- `Evidence` per finding: file, line, why-risk.
- `Suggested Fix` with minimal practical patch idea.
- `Confidence` and what remains unverified.

## Anti-Patterns
- Don't report style-only preferences as blockers.
- Don't claim full correctness without explicit evidence.
- Don't defer obvious edge cases to later without tagging risk.
- Don't expand scope into unrelated feature development.
