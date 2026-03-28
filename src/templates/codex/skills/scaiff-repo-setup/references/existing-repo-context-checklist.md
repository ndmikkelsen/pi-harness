# Existing Repo Context Checklist

Use these sources in order. Stop once you have enough signal to tailor newly created scaffold files.

## 1. Git

- current branch and dirty state
- remotes and default branch
- last 10-20 commits
- recent tags or releases if relevant

## 2. Beads

Only if `bd` is available or `.beads/` exists.

- `bd ready`
- current issue or work in progress
- dependency shape or backlog themes

## 3. Cognee

Only if `.codex/scripts/cognee-brief.sh` already exists.

- run a short knowledge brief about the product, architecture, and current milestone
- treat failure as non-blocking

## 4. Project docs

- `README*`
- `docs/**/*.md`
- `.planning/*`
- `.rules/**/*`
- `AGENTS.md`
- `STICKYNOTE*`

## 5. Runtime and package manifests

Use `manifest-discovery.md`.

## Output to capture

- one-line project description
- primary stack and package manager
- app or service boundaries
- deployment model
- current workstream or roadmap hints
- any repo-specific conventions that should shape `AGENTS.md` or `.planning/*`

## Legacy AI framework cleanup

- identify whether curated legacy runtime files are present before invoking `--cleanup-manifest legacy-ai-frameworks-v1`
- if a path looks user-authored or ambiguous, require a confirmation step before deletion
