# Scaffold Customization Map

Customize only files that `pi-harness` reported in `createdPaths`.
If cleanup was requested, review `cleanup.actions` first so you know which legacy files were removed, preserved, or still need confirmation.

## Runtime docs and prompts

- `AGENTS.md`
- `.pi/prompts/*.md`
- `.pi/skills/*.md`
- `.pi/extensions/repo-workflows.ts`
- `STICKYNOTE.example.md`

## Root files

- `.env.example`
- `.gitignore`

## Do not rewrite blindly

- existing `README.md`
- existing `AGENTS.md`
- existing repo-local plan or handoff docs
- existing deploy manifests
