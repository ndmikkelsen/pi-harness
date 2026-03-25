---
name: land
description: Close out a work session with verification and a handoff note.
allowed-tools:
  - bash
  - read
  - glob
  - grep
  - edit
---

# /land

## Scope
Run this when a task is complete and you are ready to hand over a stable session.

## Mandatory Steps
- Confirm scope is finished for the selected work item.
- Run project-required checks and capture output.
- Update relevant workflow artifacts (`.planning/STATE.md`, `STICKYNOTE.md`, trackers).
- Record risks, follow-ups, and ownership before declaring completion.

## Commands
- `git status --short`
- `git diff --stat`
- `git log --oneline -n 5`
- `<required project verify command>`

## Output Requirements
- `Outcome`: concise summary.
- `Validation`: command + pass/fail results.
- `Files Changed`: high-level list.
- `Open Risks` and `Next Steps`.

## Anti-Patterns
- Don't claim completion without required validation.
- Don't skip handoff notes for unresolved risks.
- Don't rewrite history or force-push without explicit permission.
