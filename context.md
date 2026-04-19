# Code Context

## Work Item
`untracked`

Best-known acceptance criteria for the proposed bounded autonomous swarm lane:
- add the lane on top of the current role-based workflow rather than replacing it
- keep `AGENTS.md` as the workflow authority
- preserve the existing `plan-change` and `ship-change` lanes
- do not introduce persistent background agents
- use bounded rounds plus explicit adjudication instead of free-form agent chatter
- prefer ephemeral shared-chain artifacts for swarm communication over permanent repo-root clutter
- keep provider/model binding in Pi runtime configuration, not scaffold files
- note Cognee fallback because no dataset is present
- identify the narrowest verification surfaces that must change

## Knowledge Brief
Attempted `./scripts/cognee-brief.sh "autonomous swarm collaboration lane workflow surfaces"`.

Result: fallback only.
- `DatasetNotFoundError: No datasets found. (Status code: 404)`
- hint from the script: seed Cognee with `cognee.add(...)` then `cognee.cognify()` before searching

Repo evidence was still sufficient for this recon pass.

## Inputs Consumed
- Task statement and caller constraints
- `bd ready --json` -> `[]` (no ready Beads work claimed from this session)
- Cognee brief attempt output
- `AGENTS.md`
- `README.md`
- `.pi/settings.json`
- `.pi/agents/lead.md`
- `.pi/agents/explore.md`
- `.pi/agents/plan-change.chain.md`
- `.pi/agents/ship-change.chain.md`
- `.pi/extensions/repo-workflows.ts`
- `.pi/extensions/role-workflow.ts`
- `.pi/prompts/plan-change.md`
- `.pi/prompts/ship-change.md`
- `.pi/prompts/parallel-wave.md`
- `.pi/prompts/feat-change.md`
- `.pi/skills/subagent-workflow/SKILL.md`
- `.pi/skills/parallel-wave-design/SKILL.md`
- `docs/pi-subagent-workflow.md`
- `docs/pi-agentic-workflow-design.md`
- `src/generators/pi.ts`
- `src/core/template-loader.ts`
- `src/templates/pi/AGENTS.md`
- `src/templates/root/README.md`
- `scripts/copy-templates.mjs`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`
- Pi subagent tool contract from the current runtime environment: custom chains can use a shared `{chain_dir}` variable for ephemeral artifacts

## Files Retrieved
- `AGENTS.md` (lines 7-45, 48-87) - current authority model, no-persistent-agent rule, prompt list, Beads/Cognee loop, provider/model guardrail
- `README.md` (lines 3-6, 10-21, 53-80) - runtime surfaces, package/extension setup, workflow entrypoints, runtime-model binding note
- `.pi/settings.json` (lines 2-40, 42-140) - current package registrations, extensions, logical capability profile catalog
- `docs/pi-subagent-workflow.md` (lines 7-18, 22-45, 47-72, 74-188) - existing entrypoints, roles/helpers, saved chains, artifact contract, compare/adjudicate pattern, guardrails
- `docs/pi-agentic-workflow-design.md` (lines 3-15, 17-23, 63-115, 116-155) - existing bounded-collaboration design goals, non-goals, runtime source of truth, verification plan
- `.pi/agents/lead.md` (lines 23-52, 56-119, 121-168) - route choices, triggers, compare/adjudicate language, wave artifact contract
- `.pi/agents/explore.md` (lines 19-75) - recon artifact contract used for this handoff
- `.pi/agents/plan-change.chain.md` (lines 6-16) - current planning lane is a static `explore -> plan` chain writing root artifacts
- `.pi/agents/ship-change.chain.md` (lines 6-29) - current shipping lane is a static `explore -> plan -> build -> review` chain writing root artifacts
- `.pi/extensions/repo-workflows.ts` (lines 37-63) - repo-local extension policy is intentionally lean; only `bootstrap-worktree` and `cognee-brief` are registered
- `.pi/extensions/role-workflow.ts` (lines 74-85, 153-168, 170-203, 267-363, 366-474) - fixed main-session role order, skill injection, capability prompt assembly, role shortcuts, and runtime profile resolution
- `.pi/prompts/plan-change.md` (lines 4-19) - current planning prompt route and structured handoff requirements
- `.pi/prompts/ship-change.md` (lines 4-20) - current ship prompt route and execution discipline
- `.pi/prompts/parallel-wave.md` (lines 4-19) - current bounded parallel-wave wording, worktree rule, compare/adjudicate bias
- `.pi/prompts/feat-change.md` (lines 4-37) - current route selection only names `plan-change`, `ship-change`, and `parallel-wave`
- `.pi/skills/subagent-workflow/SKILL.md` (lines 18-108) - canonical artifact contract, allowed bounded follow-up, routing-alignment rules
- `.pi/skills/parallel-wave-design/SKILL.md` (lines 14-72) - safe-split guardrails and compare/adjudicate pattern
- `src/generators/pi.ts` (lines 8-116) - explicit scaffold file registry for all Pi-native runtime assets
- `src/core/template-loader.ts` (lines 1-96) - template lookup already supports additional files under `src/templates`; no custom loader work is implied by a new swarm surface
- `src/templates/pi/AGENTS.md` (lines 7-36) - template mirror of dogfood `AGENTS.md`
- `src/templates/root/README.md` (lines 3-80) - template mirror of dogfood `README.md`
- `scripts/copy-templates.mjs` (lines 1-12) - template copy is recursive; new template files are copied automatically
- `src/commands/doctor.ts` (lines 325-371, 421-424, 486-509, 613-688, 753-862) - explicit allowlists and content validations for runtime files, settings, helper agents, prompts, skills, and docs
- `tests/integration/init.test.ts` (lines 12-75, 87-120) - required runtime path expectations for scaffold init
- `tests/integration/scaffold-snapshots.test.ts` (lines 29-60, 87-120) - scaffold snapshot surfaces and runtime-file expectations
- `tests/integration/docs-alignment.test.ts` (lines 48-171) - dogfood-to-template parity list for runtime assets
- `tests/integration/doctor.test.ts` (lines 102-145, 475-539, 570-604, 742-838) - representative alignment regressions for AGENTS, prompts, skills, settings, and extensions

## Allowed Files
Treat the likely ownership boundary as the workflow scaffold only:

Authority and docs
- `AGENTS.md`
- `README.md`
- `docs/pi-subagent-workflow.md`
- `docs/pi-agentic-workflow-design.md`
- `src/templates/pi/AGENTS.md`
- `src/templates/root/README.md`

Runtime workflow surfaces
- `.pi/agents/lead.md`
- `.pi/agents/review.md` only if adjudication wording must move into the existing review role
- `.pi/agents/plan-change.chain.md` and `.pi/agents/ship-change.chain.md` only if the new lane must cross-reference them
- new additive swarm assets under `.pi/agents/*` if helper agents and/or a saved swarm chain are introduced
- `.pi/prompts/feat-change.md`
- `.pi/prompts/parallel-wave.md`
- `.pi/prompts/plan-change.md`
- `.pi/prompts/ship-change.md`
- new additive swarm prompt(s) under `.pi/prompts/*`
- `.pi/skills/subagent-workflow/SKILL.md`
- `.pi/skills/parallel-wave-design/SKILL.md`
- new additive swarm skill(s) under `.pi/skills/*`
- `.pi/settings.json` only if new logical capability profiles, packages, or extension registrations are truly required
- `.pi/extensions/repo-workflows.ts` only for optional command glue
- `.pi/extensions/role-workflow.ts` only if swarm assets must become first-class main-session roles or require new injected status behavior

Scaffold source + verification
- `src/generators/pi.ts`
- new additive template files under `src/templates/pi/agents/*`, `src/templates/pi/prompts/*`, and `src/templates/pi/skills/*`
- `src/commands/doctor.ts`
- `tests/integration/init.test.ts`
- `tests/integration/scaffold-snapshots.test.ts`
- `tests/integration/docs-alignment.test.ts`
- `tests/integration/doctor.test.ts`
- `tests/integration/beads-wrapper.test.ts`

## Non-Goals
- Do not weaken `AGENTS.md` authority or move workflow authority into extensions.
- Do not remove or repurpose the existing `plan-change` / `ship-change` lanes.
- Do not add persistent background agents, daemon processes, or repo-root swarm state files.
- Do not pin providers or model IDs in agent frontmatter, prompts, skills, or docs.
- Do not edit product/application code under `apps/*`, `src/*` business logic, or deployment scripts just to add this workflow lane.
- Do not change `.pi/mcp.json`, `scripts/serve.sh`, `scripts/promote.sh`, or serving/release semantics unless the swarm design unexpectedly requires them.
- Do not touch `ROLE_ORDER` in `.pi/extensions/role-workflow.ts` unless there is an explicit decision to make swarm roles main-session roles; current evidence favors keeping swarm assets as helpers/prompt-driven orchestration.
- Do not modify `src/core/template-loader.ts` or `scripts/copy-templates.mjs` unless a concrete template-resolution failure appears.
- Do not add permanent repo-root clutter for swarm communication when runtime shared-chain artifacts can be used.

## Key Contracts
- `AGENTS.md` is the repo authority; `.pi/*`, native Beads state, and repo-local handoff notes are subordinate runtime surfaces (`AGENTS.md` lines 7-10, 14-22).
- Project-local subagents run on demand and do **not** run persistently in the background (`AGENTS.md` line 10).
- Current reusable slash workflows are explicitly enumerated and currently stop at `feat-change`, `plan-change`, `ship-change`, `parallel-wave`, `review-change`, and `/promote` (`AGENTS.md` line 34; `README.md` lines 67-70; `docs/pi-subagent-workflow.md` lines 14-18).
- Main-session role switching is fixed to `lead`, `explore`, `plan`, `build`, `review` via `ROLE_ORDER` in `.pi/extensions/role-workflow.ts` (line 74); additive swarm helpers should stay out of role cycling unless there is a deliberate contract change.
- Existing saved chains are static and root-artifact oriented: `plan-change` writes `context.md` / `plan.md`, and `ship-change` writes `context.md` / `plan.md` / `progress.md` / `review.md` (`.pi/agents/*.chain.md` lines cited above). This is the main tension with the caller's preference for ephemeral shared-chain artifacts.
- The current workflow contract already endorses bounded collaboration, compare/adjudicate, one bounded follow-up hop, 3-5 file task fences, and caller-owned final verification (`docs/pi-subagent-workflow.md` lines 123-188; `.pi/skills/subagent-workflow/SKILL.md` lines 18-108; `.pi/skills/parallel-wave-design/SKILL.md` lines 14-72).
- Provider/model binding must stay runtime-side. Repo files only name logical capability profiles (`README.md` lines 53-59; `.pi/settings.json` lines 11-140; `.pi/extensions/role-workflow.ts` lines 337-363, 458-473).
- `src/generators/pi.ts` is the explicit scaffold registry. New prompt/skill/agent/template files do not appear in generated repos until they are added there.
- `src/commands/doctor.ts` is an explicit allowlist validator, not a wildcard scanner. New workflow assets require synchronized updates to managed-path lists, stale-scan lists, and content-token validations.
- `tests/integration/docs-alignment.test.ts` enforces exact dogfood-to-template parity for listed surfaces; any new swarm surface added to dogfood must get a corresponding `src/templates/...` mirror and test entry.
- Runtime support outside the repo already exposes shared custom-chain directories via `{chain_dir}`. That runtime mechanism is the cleanest fit for ephemeral swarm-round coordination and avoids inventing permanent repo-root artifacts.

## Test Surface
TDD-first.

Why TDD:
- this is scaffold/runtime/docs work, not user-visible CLI behavior under `apps/cli/features/*`
- the repo already verifies workflow surfaces through integration allowlists and content-token checks rather than BDD features

Relevant seams to update:
- `tests/integration/init.test.ts` - add any new managed swarm files to `requiredRuntimePaths` and, if relevant, `existingModeBaselinePaths`
- `tests/integration/scaffold-snapshots.test.ts` - extend snapshot surfaces and file expectations for any new prompt/skill/agent/chain
- `tests/integration/docs-alignment.test.ts` - add source/target parity entries for every new template-backed surface and update repo-facing doc expectations when prompt lists or docs change
- `tests/integration/doctor.test.ts` - add focused regressions for new swarm prompt/skill/agent/extension/settings guidance
- `src/commands/doctor.ts` - update the corresponding runtime validations those tests depend on

Narrowest likely RED command:
- after adding the first focused swarm regression, run `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`

Likely caller-side verification once implemented:
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`

## Decisions
- The safest additive path is a new swarm lane, not a rewrite of the current role workflow.
- Existing `plan-change` / `ship-change` lanes should remain intact and continue to target repo-root handoff artifacts.
- Swarm coordination should prefer runtime shared-chain artifacts over new permanent repo-root files.
- New swarm helpers should default to project-local helper agents or a lead-driven custom chain, not new top-level workflow roles.
- Optional extension wiring is not required for the core lane. Current repo policy strongly prefers prompt-native flows and lean extensions.
- `.pi/settings.json` only needs changes if the swarm lane truly requires a new logical capability profile, package, or extension; the existing `orchestrator`, `planning-collab`, `review-readonly`, and related profiles may already be enough.
- `src/core/template-loader.ts` and `scripts/copy-templates.mjs` do not currently look like blockers; they already support additional template files.
- Because no Cognee dataset exists, all lane-shaping for this change must rely on repository evidence and explicit fallback notes.

## Open Questions
- What exact public entrypoint name should the new lane use: a new prompt (for example `/swarm-change` or `/swarm-collab`) only, or a prompt plus a saved chain?
- Can the project-local saved-chain markdown format express the desired ephemeral `{chain_dir}` artifact exchange cleanly, or should the swarm lane stay as a lead-driven custom chain launched by the prompt/runtime?
- Should adjudication reuse the existing `review` role, or is a dedicated read-only swarm adjudicator helper warranted?
- Are any new logical capability profiles actually needed for swarm coordinator/adjudicator roles, or can existing profiles be reused?
- Is optional slash-command glue worth adding to `.pi/extensions/repo-workflows.ts`, or is prompt-native discovery sufficient?
- If new helper agents are added, what names are best aligned with the current repo vocabulary and doctor validation style?

## Requested Follow-up
none

## Start Here
1. Decide the narrowest lane shape:
   - preferred minimum: new prompt + new skill + lead-driven custom chain using shared `{chain_dir}` artifacts
   - optional additions only if needed: swarm helper agent(s), saved swarm chain, extension glue, new capability profiles
2. Update authority/docs first so the constraints are explicit:
   - `AGENTS.md`
   - `README.md`
   - `docs/pi-subagent-workflow.md`
   - `docs/pi-agentic-workflow-design.md`
3. Add runtime surfaces in dogfood `.pi/*` and mirror them in `src/templates/pi/*`.
4. Register the new files in `src/generators/pi.ts`.
5. Extend `src/commands/doctor.ts` and the four integration tests (`init`, `scaffold-snapshots`, `docs-alignment`, `doctor`).
6. Only touch `.pi/settings.json` / `.pi/extensions/*.ts` if the chosen lane shape truly requires them.

## Caller Verification
Narrowest likely RED command:
- after introducing the first swarm-specific regression, run `pnpm test -- tests/integration/doctor.test.ts -t "swarm"`

Narrowest likely caller-side verification path after implementation:
- `pnpm test -- tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts tests/integration/beads-wrapper.test.ts`

If the implementation deliberately adds new extension or settings behavior, keep the verification inside the same four integration files rather than broadening to a project-wide build/lint sweep.

## Escalate If
- the desired swarm design requires persistent background agents or repo-persistent swarm state
- the lane cannot be expressed with prompt-native flow plus bounded custom-chain/shared-artifact orchestration, and would require a second orchestration system
- swarm helpers must become first-class main-session roles, forcing a larger rethink of `ROLE_ORDER`, role-switch UX, and authority docs
- new packages or runtime adapters are needed beyond the current Pi-native package set and the rationale is not explicit
- changes start pulling in serve/promote/release behavior or product code outside the workflow scaffold boundary
