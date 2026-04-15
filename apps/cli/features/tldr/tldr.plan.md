# TLDR scaffold contract feature plan

## Work Item

`pi-harness-84z.1`

## Goal

Freeze the scaffold-managed TLDR contract so new and adopted repos generate the same prompt behavior.

## Scenarios covered

- create a new project with the TLDR workflow contract
- adopt an existing project with the TLDR workflow contract

## Key assertions

- `.pi/extensions/role-workflow.ts` is the durable enforcement point and appends TLDR guidance at the end of the final assembled system prompt
- `.pi/SYSTEM.md` mentions the TLDR expectation for visibility, but does not become the only enforcement surface
- no repo-local global TLDR extension or slash command is added to the baked baseline
- dogfood `.pi/*` and `src/templates/pi/*` should stay aligned when implementation lands

## Red → Green → Refactor

- RED: add failing BDD assertions in the init and adoption lane, or a shared scaffold assertion helper, that verify generated `.pi/extensions/role-workflow.ts` and `.pi/SYSTEM.md` include the TLDR contract and that no TLDR-specific repo-local extension is scaffolded.
- GREEN: implement the smallest scaffold changes in `src/templates/pi/extensions/role-workflow.ts` and `src/templates/pi/SYSTEM.md`, then mirror them into dogfood `.pi/extensions/role-workflow.ts` and `.pi/SYSTEM.md`.
- REFACTOR: extract any repeated scaffold assertions into shared BDD or integration helpers and only add doctor enforcement if the team decides TLDR drift should be a hard audit failure.

## Notes

- Test strategy: BDD, because the user-visible contract is what the scaffold writes into generated Pi workflow files.
- Cognee brief was attempted for planning and was unavailable (`DatasetNotFoundError`); local repository evidence was sufficient.
- Follow-on implementation and verification tasks are tracked in `pi-harness-84z.2` and `pi-harness-84z.3`.
