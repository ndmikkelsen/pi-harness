# AI Harness Roadmap

## Phase Overview

| Phase | Goal | Requirements | Beads |
| --- | --- | --- | --- |
| 1 | Ship the preserve-by-default scaffold engine and shared Codex/OpenCode runtime | CORE-01, CORE-02, CORE-03 | Historical |
| 2 | Finish the ai-harness rename, self-host adoption, and global `harness` skill flow | CORE-04, CORE-05 | `ai-harness-3uw` |
| 3 | Harden local-use distribution, migration, and upgrade readiness | CORE-06 | `ai-harness-b42` |

## Phase Notes

- Phase 1 is effectively complete and covered by the current CLI, generators, and test suite.
- Phase 2 is verified: doctrine, curated cleanup, doctor guidance, adoption fixtures, and dogfood validation all landed through `.planning/milestones/v1.0-phases/phase-2-self-hosted-harness-rollout/` and Beads epic `ai-harness-3uw`.
- Phase 3 is verified: `ai-harness` is now explicitly a local-use, non-registry tool, and downstream repos get scaffold baseline markers, preserve-by-default upgrade guidance, local install/update docs, and explicit `scaiff` migration messaging through `.planning/milestones/v1.0-phases/phase-3-distribution-readiness/` and Beads epic `ai-harness-b42`.

## Milestone Notes

- `v1.0` is complete: all `CORE-01` through `CORE-06` requirements are done, Phase 2 and Phase 3 have passed verification, and milestone audit evidence lives in `.planning/milestones/v1.0/`.
- Post-v1.0 work now lives in Beads as operational follow-up and v2 ergonomics backlog; those items do not reopen roadmap phases unless the milestone scope changes.
