# Review Verdict

## Work Item
untracked

## Summary
This follow-up addresses the main blockers from the prior review.

What looks solid:
- Existing-repo refresh now has an explicit cleanup path for stale local bake artifacts. `src/core/cleanup-manifests.ts` adds `.pi/prompts/bake.md` and `scripts/bake.sh` as safe-delete entries, and `tests/unit/cleanup.test.ts` plus `tests/integration/cli-init.test.ts` cover their removal.
- Doctor now flags the leftover local bake surfaces that matter for the global-only contract. `src/commands/doctor.ts` fails on a repo-local `.pi/prompts/bake.md`, a stale `scripts/bake.sh`, and a shadowing repo-local `registerCommand('bake')`, with focused coverage in `tests/integration/doctor.test.ts` and CLI JSON coverage in `tests/integration/cli-doctor.test.ts`.
- Broader alignment moved with the contract. `tests/integration/beads-wrapper.test.ts`, `tests/integration/docs-alignment.test.ts`, `tests/integration/init.test.ts`, and `tests/integration/scaffold-snapshots.test.ts` now consistently describe `/bake` as user-global-only and assert the local prompt/script are absent.
- The authoritative global `/bake` path has better coverage than before. `tests/unit/local-launcher.test.ts` now exercises auto-detection and argument shaping, while `tests/integration/global-bake-install.test.ts` executes the installed extension and verifies both new-target and existing-target command dispatch.

What still is not fully evidenced:
- I do not see branch-local execution notes proving the planned RED -> GREEN -> REFACTOR loop actually ran in order; the evidence is in changed tests and code, not in `progress.md` or another verification log.
- The full existing-repo cleanup story is covered in pieces rather than one end-to-end installed-extension cleanup test.

Net: this now looks ready for caller-side verification rather than blocked for rework.

## Test-First Trace
The documented strategy is still hybrid and integration-led from `plan.md`, and the follow-up changes map directly to the earlier review gaps:
- RED seam for stale cleanup: `tests/unit/cleanup.test.ts`, `tests/integration/cli-init.test.ts`
- RED seam for doctor enforcement: `tests/integration/doctor.test.ts`, `tests/integration/cli-doctor.test.ts`
- RED seam for global `/bake` behavior: `tests/unit/local-launcher.test.ts`, `tests/integration/global-bake-install.test.ts`
- Alignment/regression seam: `tests/integration/beads-wrapper.test.ts`, `tests/integration/docs-alignment.test.ts`, `tests/integration/init.test.ts`, `tests/integration/scaffold-snapshots.test.ts`

So the scoped TDD/BDD intent is visible in the diff. What is still missing is explicit artifact evidence that the author observed a real failing RED run before implementation and reran the focused GREEN/REFACTOR checks afterward.

## Risks
- The strongest remaining correctness risk is at the seam between the installed global extension and real filesystem cleanup: argument injection and cleanup execution are both tested, but mostly in separate tests rather than one full-stack installed `/bake` refresh scenario.
- CLI-level doctor coverage explicitly exercises the shadowed prompt case; stale `scripts/bake.sh` enforcement is covered through `runDoctor` integration tests rather than a dedicated CLI JSON assertion. That is probably sufficient, but it is a slightly lighter outer-layer check.
- Cognee assumptions were not revisited in this review; I reused the earlier artifact note that the brief was unavailable and relied on repository evidence.

## Gaps
- No updated `progress.md` or comparable artifact records the follow-up verification commands for this branch.
- No single end-to-end test currently proves: installed global `/bake` -> existing target detection -> stale local bake artifact deletion -> clean `doctor` result in one flow.
- `plan.md` and `wave.md` still reflect pre-fix exploration language about the removed local surfaces; that is not a product bug, but those handoff artifacts are now historically stale.

## Suggested Verification
Run the focused suite that covers the cleanup path, doctor enforcement, broader alignment, and the authoritative global launcher:

```bash
pnpm test -- tests/unit/cleanup.test.ts tests/unit/local-launcher.test.ts tests/integration/global-bake-install.test.ts tests/integration/cli-init.test.ts tests/integration/doctor.test.ts tests/integration/cli-doctor.test.ts tests/integration/beads-wrapper.test.ts tests/integration/docs-alignment.test.ts
```

If you want one extra manual seam check, seed a temp repo with `.pi/prompts/bake.md` and `scripts/bake.sh`, run the same existing-repo args the global `/bake` injects, then confirm `pi-harness doctor <dir>` passes.