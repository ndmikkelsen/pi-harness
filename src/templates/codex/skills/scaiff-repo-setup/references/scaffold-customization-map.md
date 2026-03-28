# Scaffold Customization Map

Customize only files that `scaiff` reported in `createdPaths`.
If cleanup was requested, review `cleanup.actions` first so you know which legacy files were removed, preserved, or still need confirmation.

## Planning files

- `.planning/PROJECT.md`
  - fill in the real product summary, value proposition, constraints, and open questions
- `.planning/REQUIREMENTS.md`
  - derive initial core flows, out-of-scope items, and traceability placeholders from the repo context
- `.planning/ROADMAP.md`
  - outline realistic first phases based on current architecture and backlog clues
- `.planning/STATE.md`
  - record current branch, active focus, and recent decisions from repo evidence

## Runtime docs

- `.codex/README.md`
  - keep the runtime instructions, but tune examples and wording to the repo's actual stack or service boundaries
- `AGENTS.md`
  - preserve the Codex/OpenCode guidance and add repo-specific workflow cues only if supported by evidence
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
- existing `.planning/*`
- existing deploy manifests

If docs and manifests disagree, prefer the most recent or most operationally specific source and call out the ambiguity.
