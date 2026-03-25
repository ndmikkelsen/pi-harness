---
name: polish
description: Perform bounded cleanup after core implementation is in place.
allowed-tools:
  - bash
  - read
  - glob
  - edit
  - grep
---

# /polish

## Scope
Use this for clarity and consistency improvements when core behavior is already done.

## Mandatory Steps
- Review only changed files for readability and simplification.
- Keep changes behavior-neutral.
- Run at least one verification command after edits.

## Commands
- `git diff`
- `git diff --check`
- `<project-lint-or-format-command>`

## Output Requirements
- `Refinements` grouped by file.
- `Why`: clarity, consistency, or reduced risk.
- `Validation` summary.
- `Behavior Impact`: unchanged.

## Anti-Patterns
- Don't redesign architecture in polish pass.
- Don't mix functional changes with editorial cleanup.
- Don't claim completion without verification.
