## GSD Workflow Pattern

Use GSD as the planning and verification layer for non-trivial work.

- follow `operator-workflow.md` for the canonical operator loop and command sequence
- keep `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, and `.planning/STATE.md` current
- use `/gsd-discuss-phase <n>`, `/gsd-plan-phase <n>`, `/gsd-execute-phase <n>`, and `/gsd-verify-work <n>` for phase-based work
- store research in `.planning/research/` and codebase analysis in `.planning/codebase/`
- update `.planning/STATE.md` when priorities, branches, or active workstreams change materially
- when Beads is available, start phase work from a claimed issue and carry that issue ID through the phase context
- close phase-driving Beads issues only after `/gsd-verify-work <n>` passes
- if verification finds gaps, create follow-up Beads issues instead of marking the phase complete prematurely
- if Beads is unavailable, continue with GSD rather than blocking execution
