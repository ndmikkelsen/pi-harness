import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { afterAll } from 'vitest';

import { adoptionSteps } from '../steps/index.js';
import {
  createCliFeatureWorld,
  disposeCliFeatureWorld,
  type CliFeatureWorld
} from '../support/world.js';

const feature = await loadFeature('apps/cli/features/adoption/adoption.feature');
const worlds: CliFeatureWorld[] = [];

async function createWorld(prefix: string) {
  const world = await createCliFeatureWorld(prefix);
  worlds.push(world);
  return world;
}

afterAll(async () => {
  await Promise.all(worlds.map((world) => disposeCliFeatureWorld(world)));
});

describeFeature(feature, ({ Scenario }) => {
  Scenario('Add missing managed files without modifying pre-existing scaffold files', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an existing project directory with custom root files', async () => {
      world = await createWorld('ai-harness-bdd-adoption-');
      await adoptionSteps.givenExistingProjectDirectoryWithCustomRootFiles(world);
    });

    When('I apply the scaffold in existing-project mode', async () => {
      await adoptionSteps.whenIApplyTheScaffoldInExistingProjectMode(world);
    });

    Then('missing AI workflow files are created', () => {
      adoptionSteps.thenMissingAiWorkflowFilesAreCreated(world);
    });

    And('pre-existing scaffold files are left unchanged', async () => {
      await adoptionSteps.thenPreExistingScaffoldFilesAreLeftUnchanged(world);
    });
  });

  Scenario('Merge root scaffold entries only when explicitly requested', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an existing project directory with custom root files', async () => {
      world = await createWorld('ai-harness-bdd-adoption-');
      await adoptionSteps.givenExistingProjectDirectoryWithCustomRootFiles(world);
    });

    When('I apply the scaffold in existing-project mode with root-file merging enabled', async () => {
      await adoptionSteps.whenIApplyTheScaffoldInExistingProjectModeWithRootFileMergingEnabled(world);
    });

    Then('missing AI workflow files are created', () => {
      adoptionSteps.thenMissingAiWorkflowFilesAreCreated(world);
    });

    And('scaffold entries are appended to `.gitignore` and only missing `.env.example` keys are added without removing custom content', async () => {
      await adoptionSteps.thenScaffoldEntriesAreAppendedToRootFilesWithoutRemovingCustomContent(world);
    });
  });

  Scenario('Remove curated legacy AI-framework files during adoption', ({ Given, When, Then }) => {
    let world: CliFeatureWorld;

    Given('an existing project directory with curated legacy AI-framework files', async () => {
      world = await createWorld('ai-harness-bdd-adoption-');
      await adoptionSteps.givenExistingProjectDirectoryWithCuratedLegacyAiFrameworkFiles(world);
    });

    When('I apply the scaffold in existing-project mode with curated cleanup enabled', async () => {
      await adoptionSteps.whenIApplyTheScaffoldInExistingProjectModeWithCuratedCleanupEnabled(world);
    });

    Then('curated legacy files are removed before new scaffold files are created', async () => {
      await adoptionSteps.thenCuratedLegacyFilesAreRemovedBeforeNewScaffoldFilesAreCreated(world);
    });
  });

  Scenario('Report prompt-required cleanup entries without deleting them', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an existing project directory with ambiguous legacy AI-framework files', async () => {
      world = await createWorld('ai-harness-bdd-adoption-');
      await adoptionSteps.givenExistingProjectDirectoryWithAmbiguousLegacyAiFrameworkFiles(world);
    });

    When('I apply the scaffold in existing-project mode with curated cleanup enabled and no prompts allowed', async () => {
      await adoptionSteps.whenIApplyTheScaffoldInExistingProjectModeWithCuratedCleanupEnabledAndNoPromptsAllowed(world);
    });

    Then('ambiguous cleanup entries are reported for confirmation', () => {
      adoptionSteps.thenAmbiguousCleanupEntriesAreReportedForConfirmation(world);
    });

    And('ambiguous files are left unchanged', async () => {
      await adoptionSteps.thenAmbiguousFilesAreLeftUnchanged(world);
    });
  });

  Scenario('Add the Pi + Codex compatibility files to an existing project', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an existing project directory without Codex files', async () => {
      world = await createWorld('ai-harness-bdd-adoption-');
      await adoptionSteps.givenExistingProjectDirectoryWithoutCodexFiles(world);
    });

    When('I apply the scaffold in existing-project mode for the "codex" assistant', async () => {
      await adoptionSteps.whenIApplyTheScaffoldInExistingProjectModeForAssistant(world, 'codex');
    });

    Then('assistant compatibility files are created', () => {
      adoptionSteps.thenCodexCompatibilityFilesAreCreated(world);
    });

    And('no OpenCode compatibility files are created', async () => {
      await adoptionSteps.thenNoOpenCodeCompatibilityFilesAreCreated(world);
    });
  });
});
