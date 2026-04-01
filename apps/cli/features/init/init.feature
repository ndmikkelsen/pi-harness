Feature: Initialize a new AI workflow project

  Scenario: Create a new project scaffold into a new directory
    Given an empty target directory
    When I initialize a new project named "sample-app"
    Then the CLI creates the AI workflow scaffold files
    And the CLI reports created files in its summary

  Scenario: Show a dry run without writing files
    Given an empty target directory
    When I run the initializer for "dry-run-app" with dry-run enabled
    Then the CLI reports planned changes
    And no files are written to disk

  Scenario: Prepare a new project for Codex
    Given an empty target directory
    When I initialize a new project named "codex-app" for the "codex" assistant
    Then the CLI creates assistant compatibility files
    And the Codex/OpenCode runtime files are available

  Scenario: Prepare a new project for OpenCode
    Given an empty target directory
    When I initialize a new project named "opencode-app" for the "opencode" assistant
    Then the CLI creates assistant compatibility files
    And the Codex/OpenCode runtime files are available
