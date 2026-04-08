# Triage ready work

Use this prompt when you need to choose or restate the next piece of work.

## Checklist
1. Start from `bd ready --json` when Beads is available.
2. Prefer already-ready backlog work before inventing ad hoc scope.
3. Claim the selected issue with `bd update <id> --claim --json`.
4. Restate acceptance criteria and blockers using repo-local docs and handoff notes.
5. If broad planning or research is needed, attempt `./scripts/cognee-brief.sh "<query>"` before broad exploration.
6. If the issue changes user-visible behavior, plan for a BDD-first path; otherwise choose TDD or hybrid as needed.
7. If the issue is too large, break it into linked Beads items instead of tracking work in markdown TODOs.

## Output
Return the chosen issue, why it is the right next task, acceptance criteria, knowledge-brief status, test strategy, and any follow-up context needed before implementation starts.
