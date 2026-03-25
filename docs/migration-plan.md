# Project Plan Notes

## Design foundations

- separated policy, command orchestration, file application, and scaffold generation into dedicated modules
- added automated tests for project resolution, port logic, and end-to-end scaffold behavior
- made existing-project adoption safer with merge behavior for key managed files
- made remote port detection optional instead of always-on
- added an assistant switch so scaffolds can target Claude or Codex/OpenCode
- added generic governance and workflow surfacing documents as part of Claude scaffolds (`CONSTITUTION.md`, `VISION.md`, and shared role-command briefs)

## Preserved behavior

- project name validation
- project-name plus target-dir usage
- Beads prefix support
- generation of the major AI workflow directories and templates
- retention of Claude-compatible backend files for shared tooling
- offline-safe fallback ports for Kamal-related configs

## Intentionally improved behavior

- no nested git repository initialization when scaffolding inside an existing repository
- safer adoption of existing repos through merge rules
- clearer separation of template groups and policies
- stronger validation for explicit port values
- Codex/OpenCode compatibility files are adapted from `compute-stack/.codex/` and parameterized for generic reuse

## Follow-up candidates

- add a `doctor` command for auditing existing repositories
- add fixture-based snapshot tests for larger generated trees
- replace string-based YAML generation with structured serializers where it adds value
