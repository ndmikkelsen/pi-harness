# {{APP_TITLE}}

This project is scaffolded for the local AI workflow used across {{ASSISTANT_LABEL}}, GSD, Beads, and Cognee.

## What was added

- Planning artifacts in .planning/
- Codex/OpenCode runtime files in .codex/
- Repo setup skill in .codex/skills/scaiff-repo-setup/
- Beads workflow guidance using native `bd`
- Deployment templates in config/ and .kamal/
{{CODEx_BULLET}}

## Next steps

1. Update .planning/PROJECT.md with the real product definition.
2. {{WORKFLOW_GUIDE_LINE}}
3. Copy .env.example to .env and fill in local values.
4. Run `bd init` once in the repository before using Beads.
5. Use `.codex/skills/scaiff-repo-setup/SKILL.md` when adopting or bootstrapping another repository.
6. If you are adopting a repo with legacy AI framework files, use `scaiff --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json`.
7. Create a feature branch before your first commit.
