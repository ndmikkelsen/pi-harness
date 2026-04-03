# OMO Agent-Tool Contract

## Source of Truth
- This document is the canonical OMO agent/tool contract.
- Normative policy lives here; adapter docs must reference this file.

## Authority Hierarchy
1. `.rules/patterns/omo-agent-contract.md` (normative contract)
2. `.rules/patterns/*.md` (workflow policies aligned to contract)
3. `AGENTS.md`, `.codex/README.md`, `.codex/workflows/*` (adapter/entrypoint guidance)
4. Global managed OpenCode assets (routing and defaults only)

## Tool Precedence
1. Beads (`bd`) is issue/task truth.
2. GSD (`.planning/` + `/gsd-*`) is planning/execution truth.
3. Cognee is required broadly by lane policy in this contract.
4. Worktree bootstrap follows deterministic seam ordering.

## Lane Rules
- `planning`: read `.rules/`, `.planning/STATE.md`, and active phase artifacts first; produce plans and decision records, not code changes.
- `research`: gather repo and Cognee context, summarize with file references, and hand findings to planning or execution.
- `execution`: implement within assigned file boundaries, keep Beads/GSD state aligned, and produce verification-ready changes.
- `review`: inspect risks, regressions, missing tests, and policy violations without widening scope.
- `landing`: close the current verified feature branch through `./.codex/scripts/land.sh`; never publish from planning, research, or review lanes.

## OMO Agent Matrix
| Agent | Primary Lane | Required Reads | Allowed Tools | Forbidden Actions | Handoff Target |
| --- | --- | --- | --- | --- | --- |
| `prometheus` | planning | `.rules/`, `.planning/STATE.md`, active plan context, Cognee brief | read/search tools, planning docs, repo mapping | direct landing, closing issues, creating competing planning systems | `sisyphus`, `hephaestus` |
| `metis` | planning | `.rules/`, request context, existing plan draft, Cognee brief | read/search tools, analysis-only consultation | code changes, landing, issue closure | `prometheus` |
| `sisyphus` | execution | canonical contract, active plan, `.planning/STATE.md`, claimed Beads issue, Cognee brief | full repo tools needed for scoped implementation and verification | bypassing GSD/Beads state, direct promotion to `main`, undocumented policy invention | `momus`, `oracle`, `atlas` |
| `hephaestus` | execution | assigned task context, `.rules/`, `.planning/STATE.md`, relevant tests | file edits, tests, build/typecheck, scoped implementation tools | planning-system changes outside task scope, landing without authority | `sisyphus`, `momus` |
| `oracle` | review | active plan, changed files, verification evidence, contract | read-only analysis, risk review, architecture consultation | file mutation, issue mutation, landing | `prometheus`, `sisyphus` |
| `momus` | review | active plan, changed files, verification evidence, contract | read-only review, gap detection, quality assessment | code mutation, issue closure, landing | `sisyphus`, `prometheus` |
| `atlas` | landing | verified change set, `.codex/scripts/land.sh`, issue status, branch state | git/gh/land script, quality gates, release-safe verification | planning new scope, bypassing feature-branch rule, pushing directly to `main` | complete |
| `explore` | research | contract, relevant module paths, `.rules/`, `.planning/STATE.md` | repo search/read tools, structural mapping | mutations, landing, issue closure | `prometheus`, `sisyphus` |
| `librarian` | research | contract, external-library context, Cognee brief when relevant | docs lookup, external reference search, examples | repo mutation, landing, issue closure | `prometheus`, `sisyphus` |
| `multimodal-looker` | review | contract, target artifact path, task acceptance criteria | image/media inspection, screenshot analysis, visual evidence review | code mutation, landing, issue closure | `momus`, `sisyphus` |
| `sisyphus-junior` | research | contract, delegated low-risk task context | cheap search/summarization, low-risk read-only exploration | policy decisions, landing, broad architectural changes | `sisyphus`, `prometheus` |

## Duplicate Authority Prohibition
- Adapter docs must not define conflicting normative policy.
- If conflict exists, this contract wins and adapter docs must be updated.

## Lane Matrix
| Lane | Required Reads | Allowed Tools | Forbidden Actions | Handoff Target |
| --- | --- | --- | --- | --- |
| planning | `.rules/`, `.planning/STATE.md`, active plan context, Cognee brief | plan docs, read/search tools, decision tables | code mutation without delegated execution scope, landing, issue closure | execution |
| research | `.rules/`, target module/docs, Cognee brief if available | read/search tools, docs lookup, inventory generation | code mutation, issue closure, landing | planning |
| execution | contract, assigned task, `.planning/STATE.md`, claimed issue, relevant tests | file edits, tests, build/typecheck, deterministic verification | closing issues before verification, direct promotion to `main`, creating policy drift | review |
| review | contract, changed files, verification evidence, issue state | read-only review, diagnostics, QA, evidence checks | unscoped implementation, landing, issue closure | landing |
| landing | contract, verification status, branch state, `.codex/scripts/land.sh` | git/gh/land script, final quality gates | merging/pushing directly to `main`, skipping verification, widening scope | complete |

## Handoff Schema
- `source_lane`: origin lane handing off work
- `target_lane`: next authorized lane
- `scope_summary`: one-line statement of exactly what changed or was learned
- `changed_paths`: explicit file list or `none`
- `verify_command`: command already run or required next command
- `evidence_path`: artifact path capturing output or findings
- `issue_ref`: Beads issue id when available, otherwise `untracked`
- `planning_ref`: active phase or plan reference
- `status`: `ready`, `blocked`, `gaps_found`, or `complete`
- `open_risks`: residual risks or follow-up items
- Every execution-to-review or review-to-landing handoff must include `verify_command` and `evidence_path`.

## Integration Seam Inventory
| Touchpoint | Owner | Failure Mode | Fallback | Verification Command |
| --- | --- | --- | --- | --- |
| `.beads/hooks/post-checkout` | Beads hook runtime | Beads hook missing or hook chain stops early | continue with bootstrap path and record degraded tracker state | `grep -n "bootstrap-worktree" .beads/hooks/post-checkout` |
| `.opencode/worktree.jsonc` postCreate | OpenCode worktree plugin | plugin unavailable or postCreate not invoked | run `./.codex/scripts/bootstrap-worktree.sh` manually or via fallback git hook | `grep -n "bootstrap-worktree.sh --quiet" .opencode/worktree.jsonc` |
| `./.codex/scripts/bootstrap-worktree.sh` | worktree bootstrap seam | repeated invocation duplicates links or notes | script must be idempotent and safe to rerun | `pnpm test -- tests/integration/bootstrap-worktree.test.ts` |
| `bd ready/update/close` with `/gsd-*` | Beads + GSD workflow | `bd` unavailable or `.beads/` missing | continue with GSD and record missing tracker state in handoff | `grep -n "continue with GSD" .rules/patterns/operator-workflow.md .rules/patterns/beads-integration.md .rules/patterns/gsd-workflow.md` |
| `./.codex/scripts/cognee-brief.sh` | planning/research lanes | Cognee bridge unavailable | follow lane policy outcome and use local `.rules/` + `.planning/` context | `grep -n "Cognee" .rules/patterns/cognee-gsd-integration.md` |
| `./.codex/scripts/cognee-sync-planning.sh` | planning sync seam | sync unavailable or dataset error | keep `.planning/` as source of truth and surface sync failure explicitly | `grep -n "planning dataset\|sync" .codex/scripts/cognee-sync-planning.sh` |
| `ai-harness install-skill --assistant opencode` | global managed asset seam | outdated global workflow or contract references | rerun install-skill after harness update and verify doctor/install tests | `pnpm test -- tests/integration/install-skill.test.ts` |
| `./.codex/scripts/land.sh` | landing lane | run from wrong branch, failed push, or missing PR update | stop, fix preconditions, rerun from verified feature branch only | `pnpm test -- tests/integration/land-script.test.ts` |

## Landing Authority
- Only execution/autonomous landing lanes may run `.codex/scripts/land.sh`.
- Planning, research, and review lanes must never push, close the session, or publish the PR.
- Beads issue closure requires successful verification before landing starts.

## Cognee Lane Policy
- `planning` and `research` lanes require a Cognee attempt before broader repo exploration unless the task is purely local and already scoped.
- `execution` lanes consume the latest Cognee brief when present and may continue with local `.rules/` + `.planning/` context if the contract explicitly marks the task as fallback-safe.
- `review` and `landing` lanes must use existing evidence and do not create new canonical planning artifacts in Cognee.
- If a lane is marked Cognee-required in adapter docs, unavailable Cognee must produce a deterministic `blocked` or redirect outcome rather than a silent skip.
