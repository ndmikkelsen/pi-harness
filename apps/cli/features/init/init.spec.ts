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
      world = await createWorld('pi-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I initialize a new project named "sample-app"', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'sample-app',
        
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
      world = await createWorld('pi-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I run the initializer for "dry-run-app" with dry-run enabled', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'dry-run-app',

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

  Scenario('Prepare a new project for the Pi-native baseline', ({ Given, When, Then, And }) => {
    let world: CliFeatureWorld;

    Given('an empty target directory', async () => {
      world = await createWorld('pi-harness-bdd-init-');
      await initSteps.givenEmptyTargetDirectory(world);
    });

    When('I initialize a new project named "pi-native-app"', async () => {
      await initSteps.whenIInitializeNewProject(world, {
        projectName: 'pi-native-app',
        
      });
    });

    Then('the CLI creates the Pi-native workflow files', async () => {
      await initSteps.thenTheCliCreatesPiNativeWorkflowFiles(world);
    });

    And('the Pi-native runtime files are available', async () => {
      await initSteps.thenThePiNativeRuntimeFilesAreAvailable(world);
    });

    And('no OpenCode compatibility files are created', async () => {
      await initSteps.thenNoOpenCodeCompatibilityFilesAreCreated(world);
    });
  });
});
