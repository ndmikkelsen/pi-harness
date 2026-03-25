---
name: query
description: Gather high-signal project context for a targeted question before action.
allowed-tools:
  - bash
  - read
  - glob
  - grep
---

# /query

## Scope
Use when you need fast orientation before editing: architecture, policies, ownership, and recent decisions.

## Mandatory Steps
- Read relevant context files first (`CLAUDE.md`, rules, planning docs, architecture notes).
- Map the query to a concrete evidence source: file paths, issue references, and docs.
- Summarize findings with confidence labels: confirmed vs inferred.
- List relevant constraints and dependencies that affect execution.
- Return the shortest possible answer; include one clear next action.

## Commands (short)
- `ls`
- `git log --oneline -n 20`
- `git status --short`
- `rg -n "<keyword>"` *(replace with `Grep` wrapper in local tooling)*

## Output Requirements
- `Answer` no more than 5 bullets.
- `Evidence` with exact file/line references.
- `Constraint` list if action is blocked.
- `Suggested Next Command` for follow-up.

## Anti-Patterns
- Don't fabricate context beyond repository evidence.
- Don't provide long historical narratives when a short decision is needed.
- Don't mix one-off anecdotes with official source references.
- Don't skip ownership or constraint checks before giving implementation advice.
