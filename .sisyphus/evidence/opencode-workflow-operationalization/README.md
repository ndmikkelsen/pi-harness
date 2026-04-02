# Verification Evidence Layout

This evidence set is closeout-local. Keep all artifacts for this closeout under `.sisyphus/evidence/opencode-workflow-operationalization/`.

## Naming Convention

- Use `task-{N}-{slug}.txt` for command transcripts that prove a task passed.
- Use `task-{N}-{slug}-error.txt` for failure or edge-case transcripts.
- Keep `{N}` aligned to the task number from `.sisyphus/plans/opencode-workflow-operationalization.md`.
- Keep `{slug}` short, lowercase, and hyphenated.

## Evidence Categories

- Command transcripts: raw stdout or stderr capture for happy-path checks.
- Error transcripts: raw stdout or stderr capture for failure or edge checks.
- JSON snapshots: before and after projections for merge safety or non-clobber proof.

## Directory Layout

- Root: `.sisyphus/evidence/opencode-workflow-operationalization/`
- Command transcript files: `task-{N}-{slug}.txt`
- Error transcript files: `task-{N}-{slug}-error.txt`
- JSON snapshots:
  - `task-{N}-{slug}-before.json`
  - `task-{N}-{slug}-after.json`

## Transcript and Snapshot Expectations

- Command transcripts belong in `task-{N}-{slug}.txt` files at the evidence root.
- Error transcripts belong in `task-{N}-{slug}-error.txt` files at the evidence root.
- JSON snapshots belong in paired before and after files at the evidence root, using the same task number and slug.
- Keep artifacts deterministic: same task purpose, same task number, same slug, same file names on reruns.
