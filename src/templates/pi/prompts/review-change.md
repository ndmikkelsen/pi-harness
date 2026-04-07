---
description: Run a read-only review pass using the project-local review role.
---
Use the project-local `review` agent to review this change, task, or plan:

$@

Requirements:
- keep the review read-only
- use existing artifacts like `context.md`, `plan.md`, and `progress.md` when they exist
- validate the active Beads acceptance criteria when available
- focus on correctness, architecture, edge cases, Cognee-derived assumptions, and verification gaps
- call out whether RED -> GREEN -> REFACTOR evidence is convincing for the chosen BDD/TDD strategy

Return the verdict, risks, missing acceptance criteria, and the narrowest caller-side verification path.
