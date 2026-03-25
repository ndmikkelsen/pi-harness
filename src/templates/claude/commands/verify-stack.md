---
name: verify-stack
description: Verify project health and baseline checks before major work or handoff.
allowed-tools:
  - bash
  - read
  - grep
  - glob
---

# /verify-stack

## Scope
Use to confirm the local project stack is healthy before coding, reviewing, or shipping.

## Mandatory Steps
- Confirm required commands and environment shape match this repository.
- Run dependency/build/test smoke checks in dependency order.
- Validate lint/type/check results if defined in repository policy.
- Check for configuration drift in key workflow files (`.env.example`, rules, deployment manifests).
- Report blockers with file-level evidence and priority.

## Commands (short)
- `<project-setup-cmd>`
- `<project-build-cmd>`
- `<project-test-cmd>`
- `<project-lint-or-typecheck-cmd>`

## Output Requirements
- `Stack Baseline` checklist with pass/fail.
- `Blocking Issues` (if any) before work continues.
- `Unknowns` with concrete checks to resolve.
- `Recommended Next Step` based on current signal.

## Anti-Patterns
- Don't mark stack as verified without at least one test/check command.
- Don't ignore setup failures and continue with edits.
- Don't treat local command errors as environment-only if code issue is likely.
- Don't run broad, destructive operations during verification.
