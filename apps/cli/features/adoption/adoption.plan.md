# Adoption feature plan

## Goal

Prove that existing-project adoption preserves user files while adding the current Pi-native Beads + Cognee scaffold baseline.

## Scenarios covered

- preserve pre-existing root files by default
- merge root scaffold entries only when explicitly requested
- remove curated legacy files through cleanup
- report ambiguous cleanup entries without deleting them
- add the Pi-native workflow files to an existing project

## Key assertions

- newly created scaffold files are limited to the current baseline
- no OpenCode or OMO compatibility files are generated
- cleanup remains explicit and conservative
