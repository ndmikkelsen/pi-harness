# Scaffold Customization Map

Customize only files that `pi-harness` reported in `createdPaths`.
If cleanup was requested, review `cleanup.actions` first so you know which legacy files were removed, preserved, or still need confirmation.

## Workflow docs

- `.rules/patterns/operator-workflow.md`
  - keep the Beads + Cognee loop intact, but tune examples and repo-specific cues to the actual project

## Runtime docs

- `.codex/README.md`
  - keep the runtime instructions, but tune examples and wording to the repo's actual stack or service boundaries
- `AGENTS.md`
  - preserve the Codex guidance and add repo-specific workflow cues only if supported by evidence
- `STICKYNOTE.example.md`
  - keep it generic, but update guardrails if the repo has clear conventions worth carrying forward

## Root files

- `.env.example`
  - only change if it was newly created or explicitly merged by request
  - placeholders only, never real secrets
- `.gitignore`
  - only change when `--merge-root-files` was intentionally used

## Do not rewrite blindly

- existing `README.md`
- existing `AGENTS.md`
- existing repo-local plan or handoff docs
- existing deploy manifests

If docs and manifests disagree, prefer the most recent or most operationally specific source and call out the ambiguity.
