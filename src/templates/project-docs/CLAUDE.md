# {{APP_TITLE}}

This repository is configured for the local AI workflow used by Claude Code, GSD, Beads, and Cognee.

{{COMPATIBILITY_LINE}}

## Start here

- Read .rules/patterns/git-workflow.md before committing.
- Read .rules/patterns/env-security.md before adding environment variables.
- Read .planning/PROJECT.md before starting implementation work.

{{WORKFLOW_SECTION}}

## Useful commands

- gitleaks detect --source . --no-git
- ./.claude/scripts/bd ready
- ./.claude/scripts/cognee-bridge.sh health

## Response formatting

- When the user asks for `task table`, format the response as a Markdown table with columns `ID | Priority | Status | Title`.
