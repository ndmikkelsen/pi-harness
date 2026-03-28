# Scaiff Command Matrix

## Choose the mode first

- `greenfield` (`new` mode): target path does not exist or exists and is empty
- `existing`: target path already has files or is already a git repository

## Commands

### New repository

```bash
scaiff <project-slug> --assistant <codex|opencode> --init-json
```

### Existing current repository

```bash
scaiff --mode existing . --assistant <codex|opencode> --init-json
```

### Existing external path

```bash
scaiff --mode existing <path> --assistant <codex|opencode> --init-json
```

### Existing repository with root-file merges

```bash
scaiff --mode existing <path> --assistant <codex|opencode> --merge-root-files --init-json
```

### Existing repository with curated legacy cleanup

```bash
scaiff --mode existing <path> --assistant <codex|opencode> --cleanup-manifest legacy-ai-frameworks-v1 --init-json
```

### Existing repository automation with cleanup and no prompts

```bash
scaiff --mode existing <path> --assistant <codex|opencode> --cleanup-manifest legacy-ai-frameworks-v1 --non-interactive --init-json
```

## Follow-up

After any scaffold run:

```bash
scaiff doctor <target> --assistant <codex|opencode>
```

## Defaults

- prefer `codex` unless the user specifically wants `opencode`
- avoid `--force` unless the user explicitly wants managed files regenerated
- use `--cleanup-manifest legacy-ai-frameworks-v1` only when the user explicitly wants curated legacy AI-framework files removed
- use `--non-interactive` in automation so prompt-required cleanup entries are reported instead of guessed
- in existing repos, use `createdPaths` from the JSON output to decide what can be safely customized
