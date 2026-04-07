# Init feature plan

## Goal

Prove that new-project setup creates the expected Pi-native Beads + Cognee workflow files.

## Scenarios covered

- create a new scaffold in a new directory
- show a dry run without writing files
- prepare a new project for the Pi-native baseline

## Key assertions

- scaffold files are created under `AGENTS.md`, `.pi/*`, `scripts/*`, `.config/*`, `.docker/*`, and root setup files
- no OpenCode or OMO compatibility files are generated
- the resulting runtime docs point at the Pi-native baseline and Beads/Cognee workflow
