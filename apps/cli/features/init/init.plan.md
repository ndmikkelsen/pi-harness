# Init feature plan

## Goal

Prove that new-project setup creates the expected Codex + Beads + Cognee workflow files.

## Scenarios covered

- create a new scaffold in a new directory
- show a dry run without writing files
- prepare a new project for the Pi + Codex baseline

## Key assertions

- scaffold files are created under `.codex/`, `.rules/`, and root setup files
- no OpenCode or OMO compatibility files are generated
- the resulting runtime docs point at the Codex baseline and Beads/Cognee workflow
