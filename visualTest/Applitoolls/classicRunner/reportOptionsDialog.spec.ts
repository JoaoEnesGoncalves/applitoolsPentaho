import { test } from '@playwright/test';
import { ClassicRunner, BatchInfo, Configuration, Eyes, Target } from '@applitools/eyes-playwright';
import { LoginPage } from '../../src/pages/Login';
import { MainMenu } from '../../src/pages/MainMenu';
import { Homepage } from '../../src/pages/Homepage';
import { Analyzer } from '../../src/pages/Analyzer';

let viewportWidth = 1920;
let viewportHeight = 1080;
let theme = 'Ruby'; // Crystal Sapphire Ruby

// Applitools objects to share for all tests
export let Runner: ClassicRunner;
export let Batch: BatchInfo;
export let Config: Configuration;

test.beforeAll(async () => {

  // Create the classic runner.
  Runner = new ClassicRunner();

  // Create a new batch for tests.
  // A batch is the collection of visual checkpoints for a test suite.
  // Batches are displayed in the Eyes Test Manager, so use meaningful names.
  Batch = new BatchInfo({ name: 'POC Classic Runner' });

  // Create a configuration for Applitools Eyes.
  Config = new Configuration();

  // Set the batch for the config.
  Config.setBatch(Batch);
});


test.describe('analyzer dialog', () => {

  // Test-specific objects
  let eyes: Eyes;

  // This method sets up each test with its own Applitools Eyes object.
  test.beforeEach(async ({ page }) => {

    // Create the Applitools Eyes object connected to the VisualGridRunner and set its configuration.
    eyes = new Eyes(Runner, Config);

    // Open Eyes to start visual testing.
    // Each test should open its own Eyes for its own snapshots.
    // It is a recommended practice to set all four inputs below:
    await eyes.open(

      // The Playwright page object to "watch"
      page,

      // The name of the application under test.
      // All tests for the same app should share the same app name.
      // Set this name wisely: Applitools features rely on a shared app name across tests.
      'pentahoPOC',

      // The name of the test case for the given application.
      // Additional unique characteristics of the test may also be specified as part of the test name,
      // such as localization information ("Home Page - EN") or different user permissions ("Login by admin"). 
      test.info().title,

      // The viewport size for the local browser.
      // Eyes will resize the web browser to match the requested viewport size.
      // This parameter is optional but encouraged in order to produce consistent results.
      { width: viewportWidth, height: viewportHeight });
  });

  test('analyzer dialog Test', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const mainMenu = new MainMenu(page);
    const home = new Homepage(page);
    const analyzer = new Analyzer(page);

    await loginPage.logInAsAnEvaluatorAdmin();
    await mainMenu.changeThemeTo(theme);
    await home.createAnalysisReport();
    await analyzer.openReportOptionsDialog();
    await eyes.check('Analyzer dialog screenShoot', Target.window().fully().layout());
  });


  // This method performs cleanup after each test.
  test.afterEach(async () => {

    // Close Eyes to tell the server it should display the results.
    await eyes.close();

    // Warning: `eyes.closeAsync()` will NOT wait for visual checkpoints to complete.
    // You will need to check the Eyes Test Manager for visual results per checkpoint.
    // Note that "unresolved" and "failed" visual checkpoints will not cause the Playwright test to fail.

    // If you want the Playwright test to wait synchronously for all checkpoints to complete, then use `eyes.close()`.
    // If any checkpoints are unresolved or failed, then `eyes.close()` will make the Playwright test fail.
  });
});

test.afterAll(async () => {

  // Close the batch and report visual differences to the console.
  // Note that it forces Playwright to wait synchronously for all visual checkpoints to complete.
  const results = await Runner.getAllTestResults();
  console.log('Visual test results', results);
});
