# {{APP_TITLE}} Constitution

## Purpose

This document defines the governance rules for how {{APP_TITLE}} is planned, built, reviewed, and evolved.

## Principles

- Prioritize user outcomes and measurable quality over convenience or speed.
- Make decisions explicit, documented, and reversible.
- Preserve project context so humans and AI collaborators can hand off safely.
- Prefer incremental change with clear verification before scale-up.

## Non-Negotiables

- Follow repository workflow standards before committing (branching, commit format, and PR flow).
- Protect secrets and sensitive data; never commit credentials or personal data.
- Run security checks for environment-related changes and security-sensitive commands before merge.
- Keep tests, checks, and relevant verification artifacts as part of work completion.
- Respect existing project instructions and process documents (especially those in `.rules` and `.planning`).

## Governance Hierarchy

1. Legal and policy constraints (external obligations and data/security requirements).
2. **Constitution.md** (project-level operating rules).
3. **VISION.md** (product direction and boundaries).
4. Planning and backlog processes (`.planning`, Beads, GSD).
5. Architecture, coding, and testing decisions in change-level artifacts.

If a lower layer conflicts with a higher layer, the higher layer wins.

## Decision Flow

- Raise conflicts at the smallest scoped document first, with rationale and alternatives.
- Escalate to the next higher layer when requirements, architecture, or policy are in conflict.
- Close decisions with explicit owner, date, and review date in the relevant planning artifact.

## Delegation

- Humans own final product and compliance decisions.
- AI collaborators may propose, draft, and execute work within this hierarchy under explicit human approval.
- Unresolved risks or policy exceptions are routed to the repository owner before continuing.
