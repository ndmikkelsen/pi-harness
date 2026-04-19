# Pi Agentic Workflow Design

## Work Item
- Active Beads feature: `pi-harness-vyv.6`
- Design task: `pi-harness-vyv.6.1`
- Cognee brief: unavailable (`DatasetNotFoundError`)
- Strategy: TDD for scaffold/runtime/docs alignment, with bounded parallel waves for non-overlapping workflow surfaces

## Goals

1. Let Pi roles and helper subagents collaborate through explicit, reusable handoffs instead of ad hoc prose.
2. Support bounded multi-agent collaboration patterns beyond linear chains without turning every role into a recursive orchestrator.
3. Align model and tool selection to role intent through runtime capability profiles rather than provider-pinned scaffold files.
4. Make helper tool assumptions real by declaring the required packages and validating capability drift in doctor/tests.
5. Keep dogfood `.pi/*`, scaffold templates, docs, and tests in sync.

## Non-Goals

- Hardcoding provider or model IDs into scaffolded agent files.
- Giving broad recursive delegation to `build` or unlimited recursion to any role.
- Turning artifact handoffs into a second planning tree.
- Requiring project-wide verification inside child subagents.

## Structured Handoff Contract

Every role/helper artifact should carry these collaboration fields in addition to issue/Cognee/test strategy context:

- `Inputs Consumed`
- `Allowed Files`
- `Non-Goals`
- `Decisions`
- `Open Questions`
- `Requested Follow-up`
- `Caller Verification`
- `Escalate If`

Minimum delegation unit:

```md
## Delegation Unit: <id>
- Owner: <role/helper>
- Goal: <one sentence>
- Allowed Files:
  - path/one
  - path/two
- Non-Goals:
  - explicit exclusion
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
  - conditions that require returning to caller
```

## Bounded Collaboration Rules

- `lead` remains the primary orchestrator and can shape direct, chain, or parallel execution.
- `explore` may request one bounded helper follow-up when evidence is missing.
- `plan` may request one bounded helper follow-up when the plan lacks enough code/test evidence.
- `review` may request one bounded read-only evidence follow-up when verification is incomplete.
- `build` remains a leaf execution role.
- Helpers remain single-purpose; they do not spawn open-ended subtrees.

## Capability Profile Model

Profiles stay logical and runtime-facing.
The scaffold only names them; the user maps them to actual providers/models in Pi runtime.

### Model profiles
- `orchestrate-deep`
- `investigate-fast`
- `plan-deep`
- `build-balanced`
- `review-strict`
- `research-web`
- `context-balanced`

### Tool profiles
- `orchestrator`
- `repo-investigation`
- `planning-collab`
- `implementation-write`
- `review-readonly`
- `research-web`
- `repo-map`

## Runtime Source of Truth

`.pi/settings.json` should define:
- required packages
- required project-local extensions
- logical capability profile catalog for models and tools

`.pi/extensions/role-workflow.ts` should:
- read agent frontmatter profile names
- resolve tool profiles from `.pi/settings.json`
- apply active tools for the main-session role
- surface model profile guidance in the injected system prompt and role status
- warn instead of silently degrading when required profile tools are missing

## Tooling Strategy

- Keep `npm:pi-subagents` and `npm:pi-mcp-adapter`.
- Add `npm:pi-web-access` because `web-researcher` depends on web tools.
- Keep GitHub MCP as the default project-local MCP server.
- Make `context-mapper` repo-first and hand off external lookup to `web-researcher`.

## Bounded Swarm Lane (v1)

Decision for this repository:
- add a prompt-native `/swarm-change` lane on top of the current role workflow
- keep saved chains focused on `plan-change` and `ship-change`
- use ephemeral `{chain_dir}/swarm/` mailbox artifacts instead of repo-root swarm state
- use `swarm-worker` for bounded claim-and-respond slices and `swarm-adjudicator` for synthesis
- cap the lane at `roundLimit: 2` and end in adjudicated planning or escalation

## Parallel Wave Plan

### Wave 1 — Design + contract alignment (`pi-harness-vyv.6.1`)
- Artifacts: `plan.md`, `wave.md`, this design doc
- Output: accepted handoff schema, profile vocabulary, wave/task map
- Verification: planning artifacts updated and Beads-aligned

### Wave 2 — Structured handoffs + bounded collaboration (`pi-harness-vyv.6.2`)
Parallel slices:
1. Workflow contract docs/skills/prompts
2. Role/helper prompt updates and saved-chain guidance

### Wave 3 — Capability profiles + tool alignment (`pi-harness-vyv.6.3`)
Parallel slices:
1. Settings + role-workflow profile resolution
2. Helper capability alignment + README/runtime docs
3. Doctor drift detection

### Wave 4 — Verification + scaffold parity (`pi-harness-vyv.6.4`)
- Integration tests
- docs alignment
- scaffold snapshots
- doctor regressions

## Initial Task Table

| ID | Priority | Status | Title |
|---|---:|---|---|
| pi-harness-vyv.6.1 | P1 | in_progress | Define the collaboration contract, design spec, and wave plan |
| pi-harness-vyv.6.2 | P1 | open | Implement structured handoffs and bounded collaboration paths |
| pi-harness-vyv.6.3 | P1 | open | Implement capability profiles, tool alignment, and doctor checks |
| pi-harness-vyv.6.4 | P1 | open | Extend scaffold verification for the expanded workflow |

## Caller Verification

When all waves land:

```bash
pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts
```

## Risks

- Pi extension APIs may not support automatic model switching for the main session, so model profiles may remain runtime guidance rather than hard automation.
- Nested delegation can create prompt bloat; bounded follow-up and explicit escalation are non-negotiable.
- Tool/package drift will recur unless doctor validates profile and dependency alignment.
