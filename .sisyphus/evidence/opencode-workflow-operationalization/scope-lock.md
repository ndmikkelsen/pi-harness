# Scope Lock: OpenCode Workflow Operationalization

This phase is limited to operational closeout work for the already implemented OpenCode workflow. It operationalizes usage guidance, verification evidence, and landing or handoff steps.

The already-implemented install-skill and worktree integration changes present on `feat/workflow-orientation` are the accepted baseline for this closeout. Scope lock in this phase governs only incremental closeout updates (docs, evidence, checklist, handoff) and is not a re-judgment of prior implementation already in branch.

This is a repo-local execution artifact for plan delivery, not product documentation.

## In Scope

- Usage workflow docs aligned to the current supported command surface in `README.md`.
- Evidence capture under `.sisyphus/evidence/opencode-workflow-operationalization/` for reproducible verification.
- Beads and landing closeout preparation aligned with `AGENTS.md` expectations.
- Final handoff packet that summarizes what to run, what passed, and what remains.

## Must NOT

- Must NOT add new CLI flags or command surface changes.
- Must NOT redesign model routing, assistant defaults, or managed runtime behavior.
- Must NOT perform unrelated template, generator, or runtime refactors.
- Must NOT include unrelated feature delivery outside usage docs, evidence, landing closeout, and handoff.
