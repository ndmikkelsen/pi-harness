# Phase 3 Research

## Distribution Options

| Option | Strengths | Risks | Fit Right Now |
| --- | --- | --- | --- |
| Local use only | Matches the current launcher, docs, and dogfood flow exactly; easiest to debug; keeps update provenance explicit | Updates require repo access and an explicit rebuild/install step | Best fit |
| Package-manager distribution now | Easier install story for downstream users; cleaner CLI-on-PATH story | Conflicts with the local-only product intent and adds a release channel the project does not plan to support | Not supported |
| Staged hybrid | Would keep local use today while still implying a future publication path | Still creates expectation drift toward package publication that this project does not intend to ship | Rejected |

## Current Surface

- `package.json` already exposes the local launcher entrypoint through `dist/src/cli.js`
- `pnpm build` produces the local `dist/` payload used by the launcher and skill installer
- `pnpm install:local` installs the local launcher into `~/.local/bin/`
- `ai-harness install-skill --assistant opencode` installs the global OpenCode skill bundle
- the README already documents the local checkout + launcher + skill flow as the primary operator path

## Decision

Adopt a local-use distribution model.

- supported now: local installation from a checked-out repository
- required operator flow: build `dist/`, install or refresh the local launcher, and install the OpenCode skill bundle when needed
- not planned: package-manager or registry publication
- `dist/` remains a local build artifact that backs the launcher and installed skill flow

## Why This Fits

- it matches the actual product intent instead of implying a release channel that will not exist
- it keeps the dogfood loop fast while downstream upgrade guarantees stay explicit and review-driven
- it avoids support burden and messaging drift around package publication

## Follow-On Work

- `ai-harness-b42.2` should define how downstream repos understand harness generations and upgrades
- `ai-harness-b42.3` should settle the `scaiff` compatibility and alias story
- `ai-harness-b42.4` should document operator-facing install and update guidance from this decision
