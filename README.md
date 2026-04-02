# ai-harness

`ai-harness` is the source repository for the local AI workflow bootstrapper.

This repo contains the TypeScript CLI, scaffold templates, generator code, regression tests, and the globally installed OpenCode skill named `harness`.

The CLI can:

- scaffold a brand new project directory
- adopt an existing repository without clobbering user files
- generate the local AI workflow structure for Codex/OpenCode, plus GSD, Beads, and Cognee
- keep implementation concerns separated into command, core, and generator layers

## Why this repo exists

This repository is a modular TypeScript CLI with clear module boundaries, executable regression tests, and safer defaults.

## Current command surface

`ai-harness` defaults to `--assistant codex` and also accepts `--assistant opencode` as a Codex-compatible alias.

After building, the CLI is available as `ai-harness`.

```bash
pnpm install
pnpm build

# new project
pnpm exec tsx src/cli.ts sample-app

# new project for Codex
pnpm exec tsx src/cli.ts sample-app --assistant codex

# new project for OpenCode using the same Codex-compatible scaffold
pnpm exec tsx src/cli.ts sample-app --assistant opencode

# adopt the current repository
pnpm exec tsx src/cli.ts --mode existing .

# adopt the current repository and opt into root-file merges
pnpm exec tsx src/cli.ts --mode existing . --merge-root-files

# emit machine-readable scaffold results
pnpm exec tsx src/cli.ts --mode existing . --init-json

# remove curated legacy AI-framework files before adopting
pnpm exec tsx src/cli.ts --mode existing . --cleanup-manifest legacy-ai-frameworks-v1 --init-json

# preview changes only
pnpm exec tsx src/cli.ts sample-app --dry-run

# probe the compute host for service ports before writing Kamal configs
pnpm exec tsx src/cli.ts sample-app --detect-ports

# audit an existing repository
pnpm exec tsx src/cli.ts doctor . --assistant auto

# audit with JSON output
pnpm exec tsx src/cli.ts doctor . --assistant codex --json

# install the global OpenCode skill bundle
pnpm exec tsx src/cli.ts install-skill --assistant opencode
```

## Global OpenCode skill

Install the skill bundle into OpenCode's global skills directory:

```bash
ai-harness install-skill --assistant opencode
```

That command refreshes these managed global files:

- `~/.opencode/skills/ai-harness/skills/harness/`
- `~/.config/opencode/oh-my-opencode.json`
- `~/.config/opencode/get-shit-done/workflows/autonomous.md`
- `~/.gsd/defaults.json`

After installing or updating the skill:

- restart OpenCode so it reloads global skills
- make sure `ai-harness` is on your `PATH`
- `cd` into an existing repository and invoke the `harness` skill

## What gets scaffolded

New repositories receive the full scaffold. Existing repositories create the same missing files while preserving pre-existing scaffold files by default.

- root hygiene files like `.gitignore`, `.env.example`, `.gitleaks.toml`, `.pre-commit-config.yaml`
- Beads docs for native `bd` plus a default `.beads/config.yaml`; run `bd init` before using Beads
- `.planning/` for GSD planning artifacts
- `.codex/` runtime scripts, docs, templates, agents, and docker assets shared by Codex and OpenCode
- `.opencode/worktree.jsonc` for the optional `kdco/worktree` OpenCode worktree plugin path
- `.codex/skills/harness/` for reusable repository setup guidance
- `AGENTS.md` for the repo-level Codex/OpenCode operating guide
- `.kamal/` and `config/` deployment templates
- `.rules/`, `STICKYNOTE.example.md`, and `.planning/` as the canonical guidance surface

## Foundation doctrine

- `ai-harness` installs an opinionated Beads + GSD + Codex/OpenCode foundation; Cognee stays optional plumbing around that core
- the canonical assistant runtime surface is `.codex/`, shared by both Codex and OpenCode
- `src/templates/**` is the source of truth for scaffold content, this repository dogfoods those templates, and `dist/` is the built copy of that source
- existing repositories preserve user-owned files by default and only merge select root files when explicitly requested
- known non-harness AI workflow droppings are removed only through explicit curated cleanup manifests, never broad heuristic deletion

## Safety model for existing projects

- existing files are preserved by default
- missing scaffold files are added without rewriting pre-existing scaffold files
- curated cleanup is opt-in via `--cleanup-manifest ...`; the current manifest targets known legacy AI-framework droppings
- `.gitignore` and `.env.example` are only merged when `--merge-root-files` is explicitly set
- `STICKYNOTE.md` is intentionally local-only and can be seeded from `STICKYNOTE.example.md`
- `AGENTS.md` is added for Codex/OpenCode-targeted projects
- `--force` replaces managed files explicitly

`ai-harness` does not auto-delete unknown AI notes, custom prompts, or bespoke repo scripts just because they look AI-related. Removal has to be backed by a curated manifest entry.

## Existing repo workflow

1. gather project context from git, docs, manifests, Beads, and Cognee when available
2. optionally run `ai-harness --mode existing <path> --cleanup-manifest legacy-ai-frameworks-v1 --init-json` to remove curated legacy AI-framework files
3. run `ai-harness --mode existing <path> --init-json`
4. customize only the files listed in `createdPaths`
5. rerun with `--merge-root-files` only if you explicitly want `.gitignore` and `.env.example` merged
6. finish with `ai-harness doctor <path> --assistant <codex|opencode>`

## Beads + GSD loop

The canonical operator flow lives in `.rules/patterns/operator-workflow.md`.

The default interactive path is:

1. `bd ready --json`
2. `bd update <id> --claim --json`
3. `/gsd-next`
4. If GSD routes you into phase work, continue with `/gsd-discuss-phase <n>`, `/gsd-plan-phase <n>`, `/gsd-execute-phase <n>`, and `/gsd-verify-work <n>`
5. `bd close <id> --reason "Verified" --json`
6. `./.codex/scripts/land.sh`

Use `/gsd-resume-work` to re-enter an active phase and `/gsd-autonomous` when you want a backlog-driven power mode that keeps going until work is verified or truly blocked.

## OpenCode worktrees

If you use OpenCode and want lower-friction git worktrees, the scaffold now includes `.opencode/worktree.jsonc` for `kdco/worktree`.

Install the plugin with:

```bash
ocx add kdco/worktree --from https://registry.kdco.dev
```

That config keeps the existing `./.codex/scripts/bootstrap-worktree.sh` flow as the post-create bootstrap path, so new worktrees still seed `STICKYNOTE.md`, link shared `.env*` and `.kamal/secrets*` files, and keep the Beads/GSD workflow intact.

## Development

```bash
pnpm typecheck
pnpm test
pnpm test:bdd
pnpm build
pnpm install:local
```

## Distribution status

`ai-harness` is a local-use tool for setting up new and existing projects on your machine.

- supported now: `pnpm install`, `pnpm build`, `pnpm install:local`, and `ai-harness install-skill --assistant opencode`
- supported update path: pull the repo forward, rebuild `dist/`, refresh the local launcher, and reinstall the OpenCode skill when needed
- not planned: publishing `ai-harness` to a package registry; use it locally on developer machines to scaffold and refresh repositories

## Downstream scaffold generations

Downstream repositories should treat each scaffold or refresh as pinned to the `ai-harness` version and source commit that produced it.

- new scaffolds now seed `.planning/STATE.md` with the `ai-harness` version and generated date so repos have an explicit starting baseline
- when you refresh an existing repo, record the previous and new `ai-harness` versions plus the source commit in the update PR, handoff note, or `.planning/STATE.md`
- supported upgrade flow remains preserve-by-default: pull this repo forward, run `pnpm build`, rerun `ai-harness --mode existing <path> --assistant <codex|opencode> --init-json`, customize only the files listed in `createdPaths`, then finish with `ai-harness doctor <path> --assistant <codex|opencode>`
- there is no general in-place migrator yet; use the existing-repo adoption flow and explicit review instead of assuming managed files will merge automatically

## scaiff compatibility

- `ai-harness` is the renamed successor to `scaiff`
- use `ai-harness` for installs and updates; there is no separate `scaiff` binary, package, or global skill alias
- the old OpenCode skill name `scaiff-repo-setup` is replaced by `harness`
- if an older repo still carries curated `scaiff`-era workflow leftovers, remove them deliberately with `--cleanup-manifest legacy-ai-frameworks-v1`

## Local launcher

`~/.local/bin/ai-harness` is now a thin wrapper around this repository.

- it prefers `dist/src/cli.js`
- it will try `pnpm build` if `dist/` is missing
- `dist/` is a local build artifact used by the launcher and skill installer, not a published package channel
- it falls back to the repo-installed `tsx` binary to run `src/cli.ts` when dependencies are already installed
- set `AI_HARNESS_REPO` if you want the launcher to target a different checkout

Refresh the installed launchers after moving this repo:

```bash
pnpm install:local
```

That command installs `ai-harness` into `~/.local/bin/`.

To use both the local checkout and the global OpenCode skill together:

```bash
pnpm install
pnpm build
pnpm install:local
ai-harness install-skill --assistant opencode
```

That flow gives you:

- a local `ai-harness` command on your `PATH` backed by this checkout
- a global OpenCode skill that can scaffold whichever repository you `cd` into
- managed OpenCode and GSD defaults refreshed under `~/.config/opencode/oh-my-opencode.json` and `~/.gsd/defaults.json`
- a managed backlog-driven `/gsd-autonomous` workflow refreshed under `~/.config/opencode/get-shit-done/workflows/autonomous.md`

## Current-state operator runbook

Use this command chain as the supported current-state workflow.

Install the local launcher and global OpenCode skill once:

```bash
pnpm install
pnpm build
pnpm install:local
ai-harness install-skill --assistant opencode
```

Then scaffold or adopt:

- New repo: `ai-harness my-app --assistant opencode --init-json`
- Existing repo: `ai-harness --mode existing . --assistant opencode --init-json`

Run doctor after either path:

```bash
ai-harness doctor . --assistant opencode
```

Optional OpenCode worktree plugin:

```bash
ocx add kdco/worktree --from https://registry.kdco.dev
```

The scaffolded `.opencode/worktree.jsonc` keeps worktree bootstrap on `./.codex/scripts/bootstrap-worktree.sh --quiet`.

Day-to-day loop:

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
./.codex/scripts/land.sh
```

Use `/gsd-resume-work` to re-enter active phase work.

See `docs/harness-usage.md` for the detailed walkthrough.

BDD specs live in `apps/cli/features/`, executable regression coverage lives in `tests/`, and the Muninn-style BDD lane runs through `pnpm test:bdd`.

## Docs

- `docs/architecture.md`
- `docs/harness-usage.md`
- `docs/migration-plan.md`
- `docs/ai-harness-map.md`
- `docs/ai-harness-premise.md`
