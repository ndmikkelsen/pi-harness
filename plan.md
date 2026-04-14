# Implementation Plan

## Work Item
untracked — improve the Pi agent/subagent workflow so agents can collaborate more like modern multi-agent systems, expand their capabilities safely, align models to roles without hardcoding providers into the scaffold, and give agents clearer access to tools/MCP surfaces.

Acceptance criteria:
- agents can exchange structured outputs and targeted follow-up questions without the caller manually re-explaining all context each time
- selective nested delegation is available where it is safe and bounded
- model selection can differ by role/helper through runtime-resolved profiles instead of provider-pinned scaffold files
- tool access is intentional, discoverable, and health-checked per agent class
- dogfood `.pi/*`, scaffold templates under `src/templates/pi/*`, docs, and doctor/tests stay aligned

## Knowledge Inputs
- Cognee brief: not attempted in this planning pass because shell execution was unavailable in-session; fallback is repo-local evidence from `README.md`, `docs/pi-subagent-workflow.md`, `.pi/settings.json`, `.pi/mcp.json`, `.pi/extensions/*.ts`, `.pi/agents/*.md`, `.pi/skills/subagent-workflow/SKILL.md`, `.pi/skills/parallel-wave-design/SKILL.md`, and the bundled `pi-subagents` README.
- Beads: no ready work was returned, so this session created and claimed `pi-harness-vyv.6` plus child wave tasks `pi-harness-vyv.6.1` through `pi-harness-vyv.6.4` to track the execution plan.
- Current repo evidence shows:
  - the workflow is strong on role clarity and artifact discipline
  - agent-to-agent communication is mostly linear and file-based (`context.md`, `plan.md`, `progress.md`, `review.md`, `wave.md`)
  - only `lead` can delegate (`subagent` tool + `maxSubagentDepth: 1`); most other roles/helpers cannot coordinate follow-up work
  - role switching changes tools/thinking in the main session, but there is no project-local model-routing layer
  - helper agent tool definitions are inconsistent, and `web-researcher` / `context-mapper` assume web tools that are not declared in `.pi/settings.json`
  - only GitHub MCP is preconfigured today

## Goal
Turn the current linear role workflow into a bounded, capability-driven multi-agent system with structured handoffs, runtime model/tool routing, and better specialist coverage.

## Approach
Implement this in phases so workflow authority stays in `AGENTS.md` and `.pi/*` while gaining more multi-agent power:
1. formalize a stricter inter-agent handoff contract
2. add a runtime capability/profile layer for models and tools
3. upgrade selected roles/helpers to use bounded nested delegation and explicit collaboration patterns
4. expand tool bundles and MCP coverage with doctor checks
5. add new saved chains/patterns for compare, adjudicate, research, and contract-first execution
6. propagate the same behavior into scaffold templates and verification

## Test Strategy
Hybrid.
- BDD leads for user-visible agent workflows, slash-command behavior, and collaboration paths.
- TDD covers extension logic for profile resolution, tool gating, and doctor validation.

Primary future proof files/commands:
- BDD: `apps/cli/features/subagents/*.feature`, `apps/cli/features/subagents/*.spec.ts`
- TDD/integration: `tests/unit/role-workflow.test.ts`, `tests/unit/agent-capability-profiles.test.ts`, `tests/integration/doctor.test.ts`, `tests/integration/docs-alignment.test.ts`, `tests/integration/scaffold-snapshots.test.ts`, `tests/integration/init.test.ts`

## RED
Observe failing tests for the missing capabilities before implementation:
1. a BDD/integration case showing one agent cannot currently request a bounded follow-up from another agent using a structured handoff contract
2. a unit case showing logical model/tool profiles are not currently resolved from runtime-aware config
3. a doctor/integration case showing helper agents reference tools or capabilities that are not installed or declared
4. a scaffold snapshot/docs-alignment failure when dogfood and template workflow assets drift

Candidate RED commands:
- `pnpm test:bdd -- apps/cli/features/subagents/subagent-collaboration.spec.ts`
- `pnpm test -- tests/unit/role-workflow.test.ts tests/unit/agent-capability-profiles.test.ts tests/integration/doctor.test.ts tests/integration/docs-alignment.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/init.test.ts`

## GREEN
The smallest implementation that satisfies RED should:
- add a structured handoff schema to the shared artifacts and prompts
- introduce logical `modelProfile` / `toolProfile` style metadata resolved at runtime, not provider strings baked into project agents
- give only the roles/helpers that genuinely need it a single bounded delegation hop
- register missing shared packages/tool prerequisites for the helpers that already assume them
- add doctor coverage for missing capability dependencies and stale workflow assets

## REFACTOR
Once GREEN is proven:
- collapse repeated prompt language across role/helper agents into shared skill guidance
- reduce duplicated docs between dogfood `.pi/*` and `src/templates/pi/*`
- normalize agent metadata so every role/helper declares a consistent capability story
- add compare/adjudicate patterns only after the base handoff and profile layers are stable

## Tasks
1. **Define the collaboration contract agents will use to “talk” to one another**
   - Files:
     - `docs/pi-subagent-workflow.md`
     - `.pi/skills/subagent-workflow/SKILL.md`
     - `src/templates/pi/skills/subagent-workflow/SKILL.md`
     - `.pi/prompts/plan-change.md`
     - `src/templates/pi/prompts/plan-change.md`
   - Changes:
     - standardize artifact sections for `Inputs`, `Questions`, `Decisions`, `Requested Follow-up`, `Verification`, and `Owned Files`
     - document bounded back-and-forth patterns (`explore -> plan -> explore`, compare + adjudicate, research + synthesis) instead of free-form chatter
   - Acceptance:
     - docs make it clear how agents pass structured context without inventing a second planning system

2. **Add a runtime capability/profile layer for model and tool routing**
   - Files:
     - `.pi/extensions/role-workflow.ts`
     - `src/templates/pi/extensions/role-workflow.ts`
     - `.pi/settings.json`
     - `src/templates/pi/settings.json`
     - `README.md`
   - Changes:
     - support logical role/helper profiles such as `scout-fast`, `plan-deep`, `build-balanced`, `review-strict`, `research-web`
     - resolve those logical profiles at runtime from Pi/user config instead of embedding provider/model names in scaffold files
     - document the runtime mapping contract and override path
   - Acceptance:
     - roles/helpers can ask for a capability class while the actual provider/model remains runtime-configured

3. **Upgrade the orchestration roles for bounded collaboration instead of one-way handoff only**
   - Files:
     - `.pi/agents/lead.md`
     - `.pi/agents/plan.md`
     - `.pi/agents/review.md`
     - `src/templates/pi/agents/lead.md`
     - `src/templates/pi/agents/plan.md`
   - Changes:
     - allow `plan` and possibly `review` one bounded helper follow-up when evidence is missing
     - keep `build` constrained, but let `lead` shape compare/adjudicate or contract-first waves more explicitly
     - require explicit “question to next agent” and “answer consumed from previous agent” sections
   - Acceptance:
     - planner/reviewer collaboration can happen without turning the workflow into uncontrolled recursion

4. **Normalize helper agents and close the current capability gaps**
   - Files:
     - `.pi/agents/code-scout.md`
     - `.pi/agents/task-planner.md`
     - `.pi/agents/implementer.md`
     - `.pi/agents/web-researcher.md`
     - `.pi/agents/context-mapper.md`
   - Changes:
     - align helper prompts with the same handoff contract as the workflow roles
     - make tool scoping explicit for `implementer`
     - decide whether `context-mapper` should remain web-capable or split into repo-only + research-assisted variants
     - define which helpers can ask one clarifying follow-up and which must stay single-shot
   - Acceptance:
     - helper agents feel like a coherent system rather than individually useful prompts

5. **Install or validate the tools the helpers already assume, then add doctor coverage**
   - Files:
     - `.pi/settings.json`
     - `src/templates/pi/settings.json`
     - `.pi/mcp.json`
     - `src/templates/pi/mcp.json`
     - `src/commands/doctor.ts`
   - Changes:
     - add shared packages that current helpers already imply, especially web access if `web-researcher` / `context-mapper` keep web tools
     - decide the default optional MCP bundles beyond GitHub (for example browser/devtools or docs/reference), with clear opt-in guidance where needed
     - teach doctor to flag helper/tool mismatches and missing extension prerequisites
   - Acceptance:
     - the declared agent tool surface matches the installed runtime surface

6. **Add reusable collaboration patterns and saved chains**
   - Files:
     - `.pi/agents/plan-change.chain.md`
     - `.pi/agents/ship-change.chain.md`
     - `src/templates/pi/agents/plan-change.chain.md`
     - `src/templates/pi/agents/ship-change.chain.md`
     - `.pi/prompts/parallel-wave.md`
   - Changes:
     - add or evolve chains for compare/adjudicate, research -> plan, contract-first waves, and reviewer-as-judge patterns
     - document when to use direct execution vs sequential chain vs parallel wave vs adjudication loop
   - Acceptance:
     - the repo exposes a few high-signal workflows instead of forcing users to manually script every delegation pattern

7. **Propagate the workflow changes into scaffold tests and dogfood alignment checks**
   - Files:
     - `tests/integration/init.test.ts`
     - `tests/integration/scaffold-snapshots.test.ts`
     - `tests/integration/docs-alignment.test.ts`
     - `tests/integration/doctor.test.ts`
     - `apps/cli/features/subagents/subagent-collaboration.spec.ts` (new)
   - Changes:
     - add verification for collaboration contract text, tool dependencies, profile-routing docs, and new chains/prompts
     - add at least one user-visible BDD spec proving the intended collaboration path
   - Acceptance:
     - scaffold generation, docs alignment, and doctor checks all prove the new workflow baseline

## Dependencies
- Task 1 first: the collaboration contract must be defined before changing role/helper prompts.
- Task 2 before Tasks 3-5: runtime profile resolution should exist before agents start depending on it.
- Task 5 before broad tool-heavy helper upgrades if package/tool prerequisites are missing.
- Task 6 after Tasks 1-3 so new chains reflect the final collaboration contract.
- Task 7 happens alongside each wave, but the final snapshot/docs/doctor sweep comes last.

## Verification
Narrowest caller-side verification once the first full improvement wave lands:
- `pnpm test -- tests/unit/role-workflow.test.ts tests/unit/agent-capability-profiles.test.ts tests/integration/init.test.ts tests/integration/scaffold-snapshots.test.ts tests/integration/docs-alignment.test.ts tests/integration/doctor.test.ts`
- `pnpm test:bdd -- apps/cli/features/subagents/subagent-collaboration.spec.ts`

## Risks
- Pi extension APIs may not expose every hook needed for model/profile routing; if so, the fallback is documented runtime aliasing plus agent frontmatter conventions rather than a fully automatic resolver.
- “Agents talking to each other” can become expensive and noisy if implemented as open-ended chatter; the plan assumes bounded handoffs, explicit outputs, and adjudication patterns instead.
- Adding web/MCP capabilities without doctor checks will make the scaffold feel flaky; tool health checks need to ship with the new capability surface.
- Nested delegation can create recursion and context bloat; keep it off by default and enable only for selected roles/helpers.
- Any workflow change must be mirrored in both dogfood `.pi/*` and `src/templates/pi/*` or docs-alignment drift will return.
