# Pi subagent workflow

This repository uses a role-based Pi subagent workflow implemented with project-local `pi-subagents` assets.

## Everyday entrypoints

Use these controls first:

- `Ctrl+.` - move to the next active workflow role in the main session
- `Ctrl+,` - move to the previous active workflow role in the main session
- `/role <name>` - jump directly to a workflow role
- `/next-role` - move to the next role without opening the picker
- `/prev-role` - move to the previous role without opening the picker
- `/feat-change <task>` - triage and route a feature request through the lead role
- `/plan-change <task>` - explore the code and produce a plan without implementing
- `/ship-change <task>` - explore, plan, implement, and review a change
- `/parallel-wave <task>` - shape a safe parallel wave and only launch it when boundaries are clear
- `/review-change <task>` - run a read-only review pass

## Project-local roles

These roles live under `.pi/agents/*` and define the canonical workflow:

- `lead` - workflow coordination, routing, wave shaping, Beads issue continuity, and BDD/TDD strategy selection
- `explore` - repo recon, acceptance criteria mapping, Cognee brief intake, and test-surface discovery
- `plan` - scoped planning with explicit RED -> GREEN -> REFACTOR checkpoints
- `build` - scoped implementation using narrow RED/GREEN commands without project-wide verification
- `review` - read-only validation of correctness, acceptance coverage, and test-first discipline

## Helper subagents

These project-local helper subagents are available for narrow ad hoc delegation. They are not part of the default saved-chain path unless the caller chooses them explicitly:

- `code-scout` - fast codebase recon helper for tightly scoped handoffs
- `task-planner` - ad hoc planning helper when the workflow `plan` role is too broad for the delegation slice
- `implementer` - generic implementation helper for isolated execution tasks
- `web-researcher` - focused external research helper
- `context-mapper` - requirement-to-code mapper that prepares context and planning hints
- `github-operator` - GitHub MCP-native helper for PRs, issues, branches, and repo metadata

Builtin agents like `reviewer` still exist, but prefer the repo's workflow roles and helper subagents first.

The active role in the main session is injected by `.pi/extensions/role-workflow.ts`.

`Tab` and `Shift+Tab` remain reserved by Pi built-ins in many terminals. `Ctrl+.` and `Ctrl+,` are not claimed by Pi built-ins in the current keybinding set, so this project now uses them as the default role-cycling shortcuts. If your terminal or OS intercepts them, fall back to `/role`, `/next-role`, `/prev-role`, or a custom `~/.pi/agent/keybindings.json` override.

## Shared operating loop

- Beads is the task tracker: start from `bd ready --json`, claim the active issue, and carry the issue ID through handoff artifacts.
- Cognee is the knowledge garden: attempt `./scripts/cognee-brief.sh "<query>"` before broad planning or repo-wide exploration when local context is not already enough.
- Test-first development is explicit: choose BDD for user-visible behavior, TDD for lower-level logic, or hybrid when both are needed.
- Implementation work follows RED -> GREEN -> REFACTOR.
- Provider and model choice stay in Pi runtime. Repo files should name logical capability profiles, not provider-pinned model IDs.
- For explicit MCP requests, prefer the configured MCP adapter path first and only use shell fallback when MCP is unavailable and that fallback is called out explicitly.

## Workflow capability profiles

The workflow uses logical capability profiles declared in `.pi/settings.json`.
They let roles and helpers express **what kind of model/tooling they need** without hardcoding provider strings into scaffold files.

- model profiles describe intent such as `orchestrate-deep`, `plan-deep`, `build-balanced`, or `review-strict`
- tool profiles describe runtime surfaces such as `orchestrator`, `planning-collab`, `implementation-write`, `repo-map`, or `research-web`
- Pi runtime configuration still decides which real provider/model backs each profile in your environment

Use `.pi/settings.json` as the project-local catalog, and use `~/.pi/agent/models.json`, `/model`, or other Pi runtime setup to bind real models.

## Saved chains

These chains can be launched from `/agents` or via the `subagent` tool:

- `plan-change` - `explore -> plan`
- `ship-change` - `explore -> plan -> build -> review`

## Structured handoff contract

The workflow reuses a small shared artifact set instead of creating a separate planning tree:

- `context.md`
- `plan.md`
- `progress.md`
- `review.md`
- `wave.md`

Every artifact should carry:
- active Beads issue context or an explicit `untracked` note
- Cognee brief status when planning or research used it
- the chosen BDD/TDD strategy when it affects the work
- `Inputs Consumed`
- `Allowed Files`
- `Non-Goals`
- `Decisions`
- `Open Questions`
- `Requested Follow-up`
- `Caller Verification`
- `Escalate If`

Use this minimum delegation unit when one agent hands off to another:

```md
## Delegation Unit: <short-id>
- Owner: <role/helper>
- Goal: <one sentence>
- Allowed Files:
  - path/one
  - path/two
- Non-Goals:
  - explicit exclusions
- Inputs:
  - context.md
  - plan.md
- Output:
  - artifact to update
- RED:
  - narrow failing check
- GREEN Target:
  - smallest passing change
- Caller Verification:
  - final narrow proof
- Escalate If:
  - conditions that require returning to the caller
```

## Bounded collaboration patterns

Use bounded collaboration instead of free-form agent chatter.

### 1) Explore -> plan with one evidence follow-up
Use when the planner needs one more code or test lookup before the plan is safe.

### 2) Research -> plan
Use `context-mapper` for repo mapping, then `web-researcher` only if external evidence is truly needed, then `task-planner` or `plan`.

### 3) Compare -> adjudicate
Use `/parallel` for two bounded views, then hand the outputs to `review` or `lead` for synthesis.

```text
/parallel code-scout "inspect API surface" -> code-scout "inspect test surface"
/run review Adjudicate the two findings and recommend the safest next step
```

### 4) Parallel implementation wave
Use only when ownership is explicit, contracts are sequenced, and the caller can verify the whole wave afterward.

## Advanced usage

Use `/agents` (or `Ctrl+Shift+A`) to browse project roles, helper subagents, and saved chains.

You can also call roles directly:

```text
/run lead Decide whether this task should stay direct or split into subagents
/run plan Turn context.md into an implementation plan with RED -> GREEN -> REFACTOR checkpoints
/run build Implement the scoped change in plan.md
/run review Review the change and suggest final verification
/run explore Map the files involved in the auth flow
```

You can call helper subagents directly when you want a narrower specialist:

```text
/run code-scout Map the files involved in the auth flow
/run task-planner Turn context.md into an isolated implementation slice
/run implementer Execute the smallest isolated change in plan.md
/run web-researcher Compare upstream approaches for this API
/run context-mapper Map requirements to relevant files and patterns
```

For ad hoc chains:

```text
/chain explore "map the auth flow" -> plan "plan the change"
```

For ad hoc parallel work:

```text
/parallel code-scout "inspect frontend auth" -> code-scout "inspect backend auth"
```

## Guardrails

- child subagents do not run project-wide build, test, or lint commands
- child subagents may run narrow scoped RED/GREEN commands for their assigned slice
- keep delegated work at about 3-5 files per task
- use `worktree: true` when parallel work should be isolated
- middle-tier delegation is bounded to one explicit follow-up hop unless the caller says otherwise
- compare/adjudicate loops should be explicit, not free-form chatter
- the caller owns final verification, Beads closure, and landing
