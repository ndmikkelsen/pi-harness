# Using the `harness` Skill

## What it is

`harness` is the global OpenCode skill that drives the local `ai-harness` CLI.

- `ai-harness` does the actual scaffold and adoption work
- `harness` is the guided entrypoint you use inside OpenCode
- the supported setup is local-only: a checkout of this repo on your machine plus `pnpm build` and `pnpm install:local`

## Install once on your machine

From your local `ai-harness` checkout:

```bash
pnpm install
pnpm build
pnpm install:local
ai-harness install-skill --assistant opencode
```

That gives you:

- `ai-harness` on your `PATH`
- the global OpenCode `harness` skill
- the managed `oh-my-opencode.json` defaults at `~/.config/opencode/oh-my-opencode.json`
- the managed OpenCode `/gsd-autonomous` workflow at `~/.config/opencode/get-shit-done/workflows/autonomous.md`
- the managed GSD defaults at `~/.gsd/defaults.json`

## Current-state runbook

Use this as the authoritative sequence after install:

1. Scaffold or adopt with `ai-harness ... --init-json`.
2. Run `ai-harness doctor <target> --assistant opencode`.
3. Optionally install the OpenCode worktree plugin with `ocx add kdco/worktree --from https://registry.kdco.dev`.
4. Use the daily Beads + GSD loop from `.rules/patterns/operator-workflow.md`.
5. Treat `.rules/patterns/omo-agent-contract.md` as the normative OMO lane and tool contract for planning, Cognee usage, and landing authority.

## Mental model

When you use `harness` in OpenCode, the flow is:

1. Decide whether the target is a new repo or an existing repo.
2. If it is an existing repo, gather context first.
3. Run `ai-harness ... --init-json`.
4. In existing repos, customize only files listed in `createdPaths`.
5. Finish with `ai-harness doctor <target> --assistant <codex|opencode>`.

## New repository walkthrough

Use this when the target directory does not exist yet or is empty.

### In OpenCode

Open a parent directory, then ask the skill for a greenfield scaffold.

Example prompt:

```text
Use harness to scaffold a new repository named acme-api for OpenCode.
```

If you want Codex-oriented docs/runtime instead, say that explicitly.

### Under the hood

The equivalent CLI command is:

```bash
ai-harness acme-api --assistant opencode --init-json
```

### What gets created

The new repo gets the standard AI workflow foundation:

- `.planning/` for GSD planning and state
- `.rules/` for workflow and architecture guidance
- `.codex/` for the Codex/OpenCode runtime layer
- `AGENTS.md` and `STICKYNOTE.example.md`
- root setup files like `.gitignore`, `.env.example`, and deploy starters

Generated repos also start with a scaffold baseline marker in `.planning/STATE.md` so future refreshes can track which `ai-harness` version created the repo.

### What to do next

1. Review and tailor `.planning/PROJECT.md`.
2. Review `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, and `.planning/STATE.md`.
3. Copy `.env.example` to `.env` and fill in local values.
4. Run `ai-harness doctor . --assistant opencode`.
5. Run `bd init` once before using Beads in that repo.
6. Start normal work with `bd ready --json`, `bd update <id> --claim --json`, and `/gsd-next`.
7. If you want low-friction OpenCode worktrees, install `kdco/worktree` with `ocx add kdco/worktree --from https://registry.kdco.dev`; the scaffolded `.opencode/worktree.jsonc` reuses `./.codex/scripts/bootstrap-worktree.sh --quiet` after each worktree is created.
8. For planning, research, or autonomous startup, attempt `./.codex/scripts/cognee-brief.sh "<query>"` before broad repository exploration and follow the contract if Cognee is unavailable.
9. Let execution/autonomous lanes own `./.codex/scripts/land.sh`; planning, research, and review lanes should hand off instead of publishing.

## Existing repository walkthrough

Use this when the repo already has files or is already a git repository.

### In OpenCode

Open the existing repo, then ask the skill to adopt it.

Example prompt:

```text
Use harness to adopt this existing repository for OpenCode. Preserve existing files by default.
```

### What the skill should do first

Before changing scaffold files, `harness` should gather repo context from:

- git status, branch, remotes, and recent commits
- Beads state if `bd` or `.beads/` exists
- Cognee brief if `.codex/scripts/cognee-brief.sh` already exists
- docs like `README*`, `docs/**/*.md`, `.planning/*`, `.rules/**/*`, and `AGENTS.md`
- package or runtime manifests

This context is used to tailor only the newly created scaffold files, not to rewrite the whole repo.

### Under the hood

The normal adoption command is:

```bash
ai-harness --mode existing . --assistant opencode --init-json
```

### Preserve-by-default behavior

Existing repos are adopted conservatively:

- missing scaffold files are created
- existing scaffold files are skipped by default
- existing user-authored files are preserved
- `--force` is not used unless you explicitly want managed files regenerated

The JSON output matters here:

- `createdPaths` tells you which new files can be safely customized now
- `skippedPaths` tells you which existing files were intentionally left alone
- `cleanup.actions` tells you what was removed, preserved, or still needs confirmation when cleanup is requested

### Optional existing-repo variants

Use these only when you explicitly want them.

Curated legacy cleanup:

```bash
ai-harness --mode existing . --assistant opencode --cleanup-manifest legacy-ai-frameworks-v1 --init-json
```

Root-file merge for `.gitignore` and `.env.example`:

```bash
ai-harness --mode existing . --assistant opencode --merge-root-files --init-json
```

Non-interactive cleanup in automation:

```bash
ai-harness --mode existing . --assistant opencode --cleanup-manifest legacy-ai-frameworks-v1 --non-interactive --init-json
```

### What to do next

1. Customize only the files listed in `createdPaths`.
2. Leave `skippedPaths` alone unless you explicitly want to edit them.
3. Review any cleanup results before continuing.
4. Run `ai-harness doctor . --assistant opencode`.
5. If the repo is using Beads and it is not initialized yet, run `bd init`.
6. Start the normal loop: `bd ready --json` -> claim issue -> `/gsd-next` -> verify -> close -> execution/autonomous landing lane runs `./.codex/scripts/land.sh`.
7. If you use OpenCode worktrees, install `kdco/worktree` with `ocx add kdco/worktree --from https://registry.kdco.dev`; the scaffolded `.opencode/worktree.jsonc` reuses `./.codex/scripts/bootstrap-worktree.sh --quiet` after each worktree is created.
8. Let execution/autonomous lanes own `./.codex/scripts/land.sh`; planning, research, and review lanes should hand off instead of publishing.

## Refreshing an already scaffolded repo later

When you want to bring a repo forward to a newer `ai-harness` version:

```bash
pnpm install
pnpm build
pnpm install:local
ai-harness --mode existing <path> --assistant <codex|opencode> --init-json
ai-harness doctor <path> --assistant <codex|opencode>
```

Record the previous and new `ai-harness` versions plus the source commit in the PR, handoff note, or `.planning/STATE.md`.

## Daily workflow after setup

Once a repo is scaffolded, the intended default loop is:

```bash
bd ready --json
bd update <id> --claim --json
/gsd-next
# if routed into phase work:
/gsd-discuss-phase <n>
/gsd-plan-phase <n>
/gsd-execute-phase <n>
/gsd-verify-work <n>
bd close <id> --reason "Verified: <artifact or phase> passed" --json
execution/autonomous landing lane runs `./.codex/scripts/land.sh`
```

Use `/gsd-resume-work` to re-enter an active phase, and if `/gsd-next` routes you into phase work, continue with `/gsd-discuss-phase <n>`, `/gsd-plan-phase <n>`, `/gsd-execute-phase <n>`, and `/gsd-verify-work <n>`.
For OMO-driven work, use `.rules/patterns/omo-agent-contract.md` to decide who may plan, who may land, and when Cognee fallback is allowed.
