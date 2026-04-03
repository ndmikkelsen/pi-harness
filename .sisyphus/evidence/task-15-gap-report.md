# OMO Tooling Gap Report

## Status

This audit closes the original alignment gaps that caused OMO policy drift across Beads, GSD, Cognee, OpenCode worktree, and landing flows in `ai-harness`.

## Gap Matrix

| Gap ID | Severity | Status | Gap | Remediation | Owner Lane | Verification Command | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | critical | closed | No canonical OMO agent/tool contract | Added `.rules/patterns/omo-agent-contract.md` and scaffold source mirror; registered scaffold generation | planning | `pnpm test -- tests/integration/doctor.test.ts` | `.sisyphus/evidence/task-1-canonical-contract.txt`, `.sisyphus/evidence/task-1-canonical-contract-error.txt`, `.sisyphus/evidence/task-2-agent-matrix.txt`, `.sisyphus/evidence/task-3-handoff-contracts.txt` |
| G2 | high | closed | Adapter docs carried doctrine instead of referencing one source | Normalized `AGENTS.md`, `.codex/README.md`, and template equivalents to point back to the contract | planning | `pnpm test -- tests/integration/beads-wrapper.test.ts` | `.sisyphus/evidence/task-5-authority-normalization.txt` |
| G3 | high | closed | Cognee posture was inconsistent (`optional` vs required lanes) | Rewrote Cognee policy in rules, role briefs, autonomous workflows, and templates | planning | `pnpm test -- tests/integration/land-script.test.ts tests/integration/init.test.ts tests/integration/docs-alignment.test.ts` | `.sisyphus/evidence/task-10-cognee-runtime.txt`, `.sisyphus/evidence/f3-manual-qa.txt` |
| G4 | high | closed | Landing ownership was ambiguous across docs | Restricted landing to execution/autonomous lanes and propagated the rule through workflow docs | landing | `pnpm test -- tests/integration/land-script.test.ts` | `.sisyphus/evidence/task-7-landing-ownership.txt` |
| G5 | high | closed | Worktree seam precedence relied on implicit idempotence | Documented hook/plugin precedence, added scaffolded Beads hook, and tested rerun safety | execution | `pnpm test -- tests/integration/bootstrap-worktree.test.ts` | `.sisyphus/evidence/task-8-hook-seam.txt` |
| G6 | high | closed | Doctor could not detect OMO alignment drift | Added alignment categories/severity to doctor issues and new contract/seam checks | review | `pnpm test -- tests/integration/doctor.test.ts` | `.sisyphus/evidence/task-12-doctor-alignment.txt` |
| G7 | medium | closed | Handoff schema was implicit and unenforced | Added schema to contract, mirrored handoff fields into GSD/autonomous docs, and validated with doctor tests | review | `pnpm test -- tests/integration/doctor.test.ts` | `.sisyphus/evidence/task-11-handoff-validation.txt` |
| G8 | medium | closed | Scaffold output and dogfooded repo drifted apart | Synced generators/templates, updated snapshots, and reran full verification | execution | `pnpm test` | `.sisyphus/evidence/task-14-regression-surface.txt` |

## Adoption Playbook

1. Pull the updated `ai-harness` checkout and rebuild it locally.
2. Rerun `ai-harness install-skill --assistant opencode` so managed OpenCode assets pick up the new contract/workflow wiring.
3. Adopt or refresh target repos with `ai-harness --mode existing <path> --assistant opencode --init-json`.
4. Run `ai-harness doctor <path> --assistant opencode` and fix any `omo-alignment` failures before regular work resumes.
5. For OpenCode repos, ensure `.opencode/worktree.jsonc` or the fallback post-checkout hook is present before using worktrees.
6. Resume the normal loop: `bd ready --json` -> claim -> `/gsd-next` -> verify -> execution/autonomous landing lane runs `./.codex/scripts/land.sh`.

## Rollback

- If a refreshed repo fails `ai-harness doctor`, revert the local adoption commit and restore the last known-good scaffold version before retrying.
- If worktree automation regresses, disable plugin usage temporarily and use `./.codex/scripts/bootstrap-worktree.sh` manually while keeping the fallback hook intact.
- If Cognee-required lane behavior blocks legitimate local work, revert the affected policy/docs change and reopen the lane policy decision with evidence from the failing repo.

## Escalation

- Escalate to planning/architecture review when a repo needs a lane-specific Cognee exception that the contract does not already permit.
- Escalate to runtime/tooling review when `omo-alignment` doctor failures appear in freshly scaffolded repos after `install-skill` and `--mode existing` refresh.
- Escalate to release/ops review when `./.codex/scripts/land.sh` behavior diverges from the contract or branch policy.

## Final Verification Summary

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:bdd`
- `pnpm test -- tests/integration/install-skill.test.ts tests/integration/bootstrap-worktree.test.ts tests/integration/land-script.test.ts tests/integration/doctor.test.ts`
- `pnpm test:smoke:dist`
- built CLI scaffold + `doctor` manual QA capture in `.sisyphus/evidence/f3-manual-qa.txt`

Captured outputs: `.sisyphus/evidence/final-quality-gates.txt`, `.sisyphus/evidence/task-14-regression-surface.txt`, `.sisyphus/evidence/f3-manual-qa.txt`.
