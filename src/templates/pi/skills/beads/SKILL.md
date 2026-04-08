---
name: beads
description: Use this skill when the repository tracks work in Beads and you need the project-local operating loop.
---

# Beads Workflow

Use this skill when the repository tracks work in Beads and you need the project-local operating loop.

## Default loop
1. `bd ready --json`
2. `bd update <id> --claim --json`
3. confirm or refresh acceptance criteria from repo docs and handoff notes
4. implement and run the narrowest verification that proves the change
5. close the issue only after verification passes: `bd close <id> --reason "Verified: <evidence>" --json`
6. if the session is in an execution or autonomous serving lane, finish with `./scripts/serve.sh`

## Guardrails
- Keep the active Beads issue ID in notes, execution context, and handoff artifacts.
- If verification finds gaps, create linked follow-up issues instead of closing the parent work early.
- If `bd` or `.beads/` is unavailable, record that fact in the handoff and continue only when the task remains locally verifiable.
