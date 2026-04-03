# AI Harness Command Matrix

## Choose the mode first

- `greenfield` (`new` mode): target path does not exist or exists and is empty
- `existing`: target path already has files or is already a git repository

## Distribution model

- intended use: run `ai-harness` locally on a developer machine to scaffold or refresh repos
- documented setup path: checked-out `ai-harness` repo + `pnpm build` + `pnpm install:local`
- no registry/package publication path is planned
- `dist/` is a local build artifact for the launcher and skill installer, not a release channel

## Commands

### Install or refresh the local ai-harness launcher

```bash
pnpm install
pnpm build
pnpm install:local
```

### Install or refresh the global OpenCode skill

```bash
ai-harness install-skill --assistant opencode
```

- refreshes the global `harness` skill bundle under `~/.opencode/skills/ai-harness/`
- refreshes the managed OpenCode defaults at `~/.config/opencode/oh-my-opencode.json`
- refreshes the managed `/gsd-autonomous` entrypoint under `~/.config/opencode/get-shit-done/workflows/autonomous.md`
- refreshes the managed GSD defaults at `~/.gsd/defaults.json`
- the shared autonomous policy now lives in repo files like `.rules/patterns/operator-workflow.md` and `.codex/workflows/autonomous-execution.md`
- installs the validated routing split: `openai/gpt-5.4` for primary execution, `openai/gpt-5.3-codex` for planning/writing helpers, and `opencode/big-pickle` for cheap discovery/background work

### Optional OpenCode worktree plugin

```bash
ocx add kdco/worktree --from https://registry.kdco.dev
```

- use the scaffolded `.opencode/worktree.jsonc` to run `./.codex/scripts/bootstrap-worktree.sh --quiet` after worktree creation
- keep the existing `scripts/hooks/post-checkout` path as the git-native fallback when the plugin is not installed

### New repository

```bash
ai-harness <project-slug> --assistant <codex|opencode> --init-json
```

### Existing current repository

```bash
ai-harness --mode existing . --assistant <codex|opencode> --init-json
```

### Existing external path

```bash
ai-harness --mode existing <path> --assistant <codex|opencode> --init-json
```

### Existing repository with root-file merges

```bash
ai-harness --mode existing <path> --assistant <codex|opencode> --merge-root-files --init-json
```

### Existing repository with curated legacy cleanup

```bash
ai-harness --mode existing <path> --assistant <codex|opencode> --cleanup-manifest legacy-ai-frameworks-v1 --init-json
```

### Existing repository automation with cleanup and no prompts

```bash
ai-harness --mode existing <path> --assistant <codex|opencode> --cleanup-manifest legacy-ai-frameworks-v1 --non-interactive --init-json
```

## Follow-up

After any scaffold run:

```bash
ai-harness doctor <target> --assistant <codex|opencode>
```

When you update an existing repo, record the previous and new `ai-harness` versions plus the source commit in the PR or handoff note.

## scaiff compatibility

- `ai-harness` replaces `scaiff`; install and invoke `ai-harness` directly
- there is no separate `scaiff` package or CLI alias to keep old commands alive
- if a repo still has curated `scaiff`-era leftovers, remove them deliberately with `--cleanup-manifest legacy-ai-frameworks-v1`

## Defaults

- prefer `codex` unless the user specifically wants `opencode`
- avoid `--force` unless the user explicitly wants managed files regenerated
- use `--cleanup-manifest legacy-ai-frameworks-v1` only when the user explicitly wants curated legacy AI-framework files removed
- use `--non-interactive` in automation so prompt-required cleanup entries are reported instead of guessed
- in existing repos, use `createdPaths` from the JSON output to decide what can be safely customized
