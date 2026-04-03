## Cognee GSD Integration

Use Cognee as the default knowledge input for OMO planning, research, and autonomous startup lanes, while keeping `.rules/` and `.planning/` as the canonical local fallback sources.

## Primary Entry Points

- `./.codex/scripts/cognee-brief.sh "<query>"` for a quick knowledge brief before planning or research
- `./.codex/scripts/sync-planning-to-cognee.sh` to upload `.planning/` artifacts into the planning dataset
- `./.codex/scripts/cognee-bridge.sh health` to check availability without blocking work

## Lane Policy

- `planning` and `research` lanes must attempt a Cognee brief before broad repository exploration unless the task is already narrowly scoped and local.
- `autonomous startup` must check Cognee availability before selecting work so it can use the latest high-signal brief when available.
- `execution` lanes should consume the latest Cognee brief and may continue with `.rules/`, `.planning/`, and repo search when the task remains locally verifiable.
- `review` and `landing` lanes use existing evidence and must not create a second canonical planning record in Cognee.
- When a lane is marked Cognee-required in adapter docs, unavailable Cognee must produce a deterministic redirect or blocked outcome instead of a silent skip.

## What To Sync

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- active phase artifacts like `CONTEXT.md`, `RESEARCH.md`, `PLAN.md`, `SUMMARY.md`, `VERIFICATION.md`, and `UAT.md`

## Guardrails

- Do not create a second planning system or store canonical decisions only in Cognee
- Treat `.rules/` and `.planning/` as the local source of truth even when Cognee is available
- If Cognee is unavailable, follow the lane policy above and record whether the work continued via fallback or stopped as blocked
- Prefer planning sync over broad repository sync so uploaded knowledge stays high signal
