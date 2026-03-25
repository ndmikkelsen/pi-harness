---
name: deploy
description: Run safe deployment orchestration with preflight and rollback awareness.
allowed-tools:
  - bash
  - read
  - grep
  - glob
  - edit
---

# /deploy

## Scope
Use for production or staging release actions only. Keep execution explicit and reversible.

## Mandatory Steps
- Confirm target environment and deployment gate criteria are set.
- Run preflight checks and sanity validations before pushing.
- Validate configuration/secret prerequisites from project policy.
- Execute deployment command exactly once with explicit environment target.
- Verify post-deploy health endpoints, smoke checks, and rollback path.
- Record what was deployed (commit, tag, artifact, environment).

## Commands (short)
- `<preflight-cmd>` (security and env checks)
- `<deploy-cmd --env target>`
- `<post-deploy-smoke-cmd>`
- `git rev-parse --short HEAD`

## Output Requirements
- `Deploy Target` and trigger command.
- `Preflight` result.
- `Post-deploy` checks + pass/fail.
- `Rollback Plan` with exact command or owner.

## Anti-Patterns
- Don't deploy without confirming target and approval gate.
- Don't bundle unrelated changes in a deployment command.
- Don't run destructive commands during deploy without rollback readiness.
- Don't treat health checks as optional.
