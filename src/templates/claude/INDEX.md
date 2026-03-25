# {{APP_TITLE}} Development Index

> AI Development Guide and Command Index

## Structure

```
{{APP_TITLE}}/
 ├── .rules/             # Technical documentation
 ├── .claude/            # AI workflows and scripts
 ├── .codex/             # Workflow adapters and wrappers
 ├── .agents/            # Reusable role briefs
 ├── .beads/             # Created by `bd init` when Beads is initialized
 └── Core docs           # AGENTS.md, CONSTITUTION.md, VISION.md, PLAN.md
```

## Commands

### `/land`

Complete session landing protocol:
- Review follow-up context
- Commit and push changes
- Write `STICKYNOTE.md`
- Capture session to Cognee
- Create or verify PR to `dev`

### `/query`

Semantic search using Cognee:
- Query across `.rules/`, `.claude/`, and synced session history
- Discover related patterns
- Get contextual answers quickly

### Beads

Use `./.claude/scripts/bd` for Beads commands.
It stays aligned with the installed `bd` CLI, so initialize repos with `bd init` and inspect connection settings with `bd dolt show`.

```bash
./.claude/scripts/bd dolt show
```

## Scripts

### Cognee Integration

```bash
curl -sk https://{{APP_SLUG}}-cognee.apps.compute.lan/health
./.claude/scripts/sync-to-cognee.sh
```
