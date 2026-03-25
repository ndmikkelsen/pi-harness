Feature: Adopt an existing project into the AI workflow scaffold

  Scenario: Add missing managed files without overwriting existing files
    Given an existing project directory with a custom README
    When I apply the scaffold in existing-project mode
    Then missing AI workflow files are created
    And existing files are left unchanged

  Scenario: Add Codex compatibility files to an existing project
    Given an existing project directory without Codex files
    When I apply the scaffold in existing-project mode for the "codex" assistant
    Then Codex compatibility files are created

  Scenario: Add OpenCode compatibility files to an existing project
    Given an existing project directory without Codex files
    When I apply the scaffold in existing-project mode for the "opencode" assistant
    Then Codex compatibility files are created
