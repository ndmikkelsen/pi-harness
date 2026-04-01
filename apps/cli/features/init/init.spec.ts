import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { afterAll } from 'vitest';

import { initSteps } from '../steps/index.js';
import {
  createCliFeatureWorld,
  disposeCliFeatureWorld,
  type CliFeatureWorld
} from '../support/world.js';

const feature = await loadFeature('apps/cli/features/init/init.feature');
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
  Scenario('Create a new project scaffold into a new directory', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an empty target directory', async () => {
      world = await createWorld('ai-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I initialize a new project named "sample-app"', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'sample-app',
        assistant: 'codex'
      });
    });

    Then('the CLI creates the AI workflow scaffold files', () => {
      initSteps.thenTheCliCreatesTheAiWorkflowScaffoldFiles(world);
    });

    And('the CLI reports created files in its summary', () => {
      initSteps.thenTheCliReportsCreatedFilesInItsSummary(world);
    });
  });

  Scenario('Show a dry run without writing files', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an empty target directory', async () => {
      world = await createWorld('ai-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I run the initializer for "dry-run-app" with dry-run enabled', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'dry-run-app',
        assistant: 'codex',
        dryRun: true
      });
    });

    Then('the CLI reports planned changes', () => {
      initSteps.thenTheCliReportsPlannedChanges(world);
    });

    And('no files are written to disk', async () => {
      await initSteps.thenNoFilesAreWrittenToDisk(world);
    });
  });

  Scenario('Prepare a new project for Codex', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an empty target directory', async () => {
      world = await createWorld('ai-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I initialize a new project named "codex-app" for the "codex" assistant', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'codex-app',
        assistant: 'codex'
      });
    });

    Then('the CLI creates assistant compatibility files', async () => {
      await initSteps.thenTheCliCreatesCodexCompatibilityFiles(world);
    });

    And('the Codex/OpenCode runtime files are available', async () => {
      await initSteps.thenTheCodexOpencodeRuntimeFilesAreAvailable(world);
    });
  });

  Scenario('Prepare a new project for OpenCode', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an empty target directory', async () => {
      world = await createWorld('ai-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I initialize a new project named "opencode-app" for the "opencode" assistant', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'opencode-app',
        assistant: 'opencode'
      });
    });

    Then('the CLI creates assistant compatibility files', async () => {
      await initSteps.thenTheCliCreatesCodexCompatibilityFiles(world);
    });

    And('the Codex/OpenCode runtime files are available', async () => {
      await initSteps.thenTheCodexOpencodeRuntimeFilesAreAvailable(world);
    });
  });
});
