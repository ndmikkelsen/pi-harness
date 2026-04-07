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

  Scenario: Prepare a new project for the Pi-native baseline
    Given an empty target directory
    When I initialize a new project named "pi-native-app"
    Then the CLI creates the Pi-native workflow files
    And the Pi-native runtime files are available
    And no OpenCode compatibility files are created
