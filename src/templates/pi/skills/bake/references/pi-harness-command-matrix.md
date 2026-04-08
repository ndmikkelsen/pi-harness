# Pi Harness Command Matrix

## Choose the mode first

- `greenfield` (`new` mode): target path does not exist or exists and is empty
- `existing`: target path already has files or is already a git repository

## Distribution model

- intended use: run `pi-harness` locally on a developer machine to scaffold or refresh repos
- documented setup path: checked-out `pi-harness` repo + `pnpm build` + `pnpm install:local`
- no registry/package publication path is planned
- `dist/` is a local build artifact for the launcher, not a release channel

## Commands

### Install or refresh the local pi-harness launcher

```bash
pnpm install
pnpm build
pnpm install:local
```

### New repository

```bash
pi-harness <project-slug> --init-json
```

### Existing current repository

```bash
pi-harness --mode existing . --init-json
```

### Existing external path

```bash
pi-harness --mode existing <path> --init-json
```

### Existing repository with root-file merges

```bash
pi-harness --mode existing <path> --merge-root-files --init-json
```

### Existing repository with curated legacy cleanup

```bash
pi-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json
```

### Existing repository automation with cleanup and no prompts

```bash
pi-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --non-interactive --init-json
```

## Follow-up

After any scaffold run:

```bash
pi-harness doctor <target>
```

When you update an existing repo, record the previous and new `pi-harness` versions plus the source commit in the PR or handoff note.

## scaiff compatibility

- `pi-harness` replaces `scaiff`; install and invoke `pi-harness` directly
- there is no separate `scaiff` package or CLI alias to keep old commands alive
- if a repo still has curated `scaiff`-era leftovers, remove them deliberately with `--cleanup-manifest legacy-ai-frameworks-v1`

## Defaults

- avoid `--force` unless the user explicitly wants managed files regenerated
- use `--cleanup-manifest legacy-ai-frameworks-v1` only when the user explicitly wants curated legacy AI-framework files removed
- use `--non-interactive` in automation so prompt-required cleanup entries are reported instead of guessed
- in existing repos, use `createdPaths` from the JSON output to decide what can be safely customized
