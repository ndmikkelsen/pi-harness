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
- the scaffold contract is `main answer`, then `Summary`, then `TLDR`, with `TLDR` shorter than `Summary` and kept as the final bottom section
- `.pi/SYSTEM.md` mentions the ordered Summary/TLDR footer contract for visibility, but does not become the only enforcement surface
- no repo-local global TLDR extension or slash command is added to the baked baseline
- dogfood `.pi/*` and `src/templates/pi/*` should stay aligned when implementation lands

## Red → Green → Refactor

- RED: add failing BDD assertions in the init and adoption lane, or a shared scaffold assertion helper, that verify generated `.pi/extensions/role-workflow.ts` and `.pi/SYSTEM.md` require `main answer -> Summary -> TLDR`, reject the old top-summary wording, keep `TLDR` shorter than `Summary`, and keep `TLDR` as the final bottom section.
- GREEN: implement the smallest scaffold changes in `src/templates/pi/extensions/role-workflow.ts` and `src/templates/pi/SYSTEM.md`, then mirror them into dogfood `.pi/extensions/role-workflow.ts` and `.pi/SYSTEM.md` so responses follow `main answer -> Summary -> TLDR` with `TLDR` shorter than `Summary` and still at the bottom.
- REFACTOR: extract any repeated scaffold assertions into shared BDD or integration helpers and only add doctor enforcement if the team decides TLDR drift should be a hard audit failure.

## Notes

- Test strategy: BDD, because the user-visible contract is what the scaffold writes into generated Pi workflow files.
- Cognee brief was attempted for planning and was unavailable (`DatasetNotFoundError`); local repository evidence was sufficient.
- Follow-on implementation and verification tasks are tracked in `pi-harness-84z.2` and `pi-harness-84z.3`.
