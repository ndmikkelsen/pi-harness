Feature: Scaffold TLDR response guidance into baked Pi repos

  Baked repositories keep TLDR as a scaffold-managed Pi workflow behavior.
  The durable enforcement point lives in `.pi/extensions/role-workflow.ts`, where the
  final assembled system prompt appends the TLDR contract after role and system assembly.
  `.pi/SYSTEM.md` repeats the expectation for visibility, but does not replace the
  role-workflow enforcement point.

  Scenario: Create a new project with the TLDR workflow contract
    Given an empty target directory
    When I initialize a new project named "tldr-app"
    Then the CLI creates the AI workflow scaffold files
    And the role workflow appends TLDR guidance at the end of the final assembled system prompt
    And the system prompt documents the TLDR response expectation
    And no repo-local global TLDR extension command is created

  Scenario: Adopt an existing project with the TLDR workflow contract
    Given an existing project directory with custom root files
    When I apply the scaffold in existing-project mode
    Then missing AI workflow files are created
    And the role workflow appends TLDR guidance at the end of the final assembled system prompt
    And the system prompt documents the TLDR response expectation
    And no repo-local global TLDR extension command is created
