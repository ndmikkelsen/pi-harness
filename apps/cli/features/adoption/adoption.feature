Feature: Adopt an existing project into the AI workflow scaffold

  Scenario: Add missing managed files without modifying pre-existing scaffold files
    Given an existing project directory with custom root files
    When I apply the scaffold in existing-project mode
    Then missing AI workflow files are created
    And pre-existing scaffold files are left unchanged

  Scenario: Merge root scaffold entries only when explicitly requested
    Given an existing project directory with custom root files
    When I apply the scaffold in existing-project mode with root-file merging enabled
    Then missing AI workflow files are created
    And scaffold entries are appended to `.gitignore` and `.env.example` without removing custom content

  Scenario: Remove curated legacy AI-framework files during adoption
    Given an existing project directory with curated legacy AI-framework files
    When I apply the scaffold in existing-project mode with curated cleanup enabled
    Then curated legacy files are removed before new scaffold files are created

  Scenario: Report prompt-required cleanup entries without deleting them
    Given an existing project directory with ambiguous legacy AI-framework files
    When I apply the scaffold in existing-project mode with curated cleanup enabled and no prompts allowed
    Then ambiguous cleanup entries are reported for confirmation
    And ambiguous files are left unchanged

  Scenario: Add Codex compatibility files to an existing project
    Given an existing project directory without Codex files
    When I apply the scaffold in existing-project mode for the "codex" assistant
    Then assistant compatibility files are created

  Scenario: Add OpenCode compatibility files to an existing project
    Given an existing project directory without Codex files
    When I apply the scaffold in existing-project mode for the "opencode" assistant
    Then assistant compatibility files are created
