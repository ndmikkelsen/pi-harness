# Scaffold Customization Map

Customize only files that `pi-harness` reported in `createdPaths`.
If cleanup was requested, review `cleanup.actions` first so you know which legacy files were removed, preserved, or still need confirmation.

## Runtime docs and prompts

- `AGENTS.md`
  - keep the vanilla Pi guidance and add repo-specific workflow cues only if supported by evidence
- `.pi/settings.json`
  - keep shared package declarations portable; prefer package specs like `npm:pi-subagents` over machine-specific absolute extension paths
- `.pi/agents/*.md`
  - keep project-local role prompts narrow, repo-aware, and aligned with `AGENTS.md`; avoid baking in provider-specific assumptions
- `.pi/agents/*.chain.md`
  - keep saved chains small, legible, and built from the repo's real role handoffs rather than ad hoc one-off sequences
- `.pi/prompts/*.md`
  - keep the workflow intent intact, but tune examples and wording to the repo's actual stack or service boundaries
- `.pi/skills/*.md`
  - preserve the reusable guidance, but tune examples or references to match the repo's actual conventions
- `.pi/extensions/role-workflow.ts`
  - keep role switching simple and user-facing; this is where `Ctrl+.`, `Ctrl+,`, `/role`, `/next-role`, and `/prev-role` behavior should live
- `.pi/extensions/repo-workflows.ts`
  - keep the command set focused on native workflow glue; only add repo-specific behavior backed by real needs
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
