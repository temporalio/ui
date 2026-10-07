import { expect, type Page, test } from '@playwright/test';

import { StartStandaloneActivityPage } from '~/pages/start-standalone-activity';
import {
  mockClusterApi,
  mockGlobalApis,
  mockNamespaceApi,
  mockNamespaceWithoutStandaloneActivityStartDelay,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockTaskQueuesApi,
  TASK_QUEUES_API,
} from '~/test-utilities/mock-apis';

// Holds every response for slow-queue until release() is called, so a test
// can make an earlier check finish after a later one.
const heldTaskQueues = async (page: Page) => {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(TASK_QUEUES_API, async (route) => {
    if (route.request().url().includes('/task-queues/slow-queue')) {
      await released;
      return route.fulfill({
        json: { pollers: [{ identity: 'worker' }], taskQueueStatus: null },
      });
    }
    return route.fulfill({ json: { pollers: [], taskQueueStatus: null } });
  });

  return release;
};

const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

test.describe('Start a Standalone Activity', () => {
  test.beforeEach(async ({ page }) => {
    await mockGlobalApis(page);
    await mockNamespaceApi(page);
    await mockSettingsApi(page);
    await mockSearchAttributesApi(page);
    await mockTaskQueuesApi(page);
    await mockClusterApi(page, { serverVersion: '1.30.0' });
  });

  test('Allows select form fields to be pre-filled via URL Search Parameters', async ({
    page,
  }) => {
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);

    await startStandaloneActivityPage.goto({
      activityId: 'abc-123',
      activityType: 'greet',
      taskQueue: 'default',
      startToCloseTimeout: '1',
      scheduleToCloseTimeout: '10',
    });

    await expect(startStandaloneActivityPage.activityIdInput).toHaveValue(
      'abc-123',
    );
    await expect(startStandaloneActivityPage.activityTypeInput).toHaveValue(
      'greet',
    );
    await expect(startStandaloneActivityPage.taskQueueInput).toHaveValue(
      'default',
    );
    await expect(
      startStandaloneActivityPage.startToCloseTimeoutInput,
    ).toHaveValue('1');
    await expect(
      startStandaloneActivityPage.scheduleToCloseTimeoutInput,
    ).toHaveValue('10');
  });

  test('Displays errors when select form fields are incomplete', async ({
    page,
  }) => {
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await startStandaloneActivityPage.submitButton.click();

    await expect(
      startStandaloneActivityPage.activityIdInputError,
    ).toBeVisible();
    await expect(
      startStandaloneActivityPage.activityTypeInputError,
    ).toBeVisible();
    await expect(startStandaloneActivityPage.taskQueueInputError).toBeVisible();
    await expect(startStandaloneActivityPage.timeoutError).toBeVisible();
  });

  test('Allows expanding more options', async ({ page }) => {
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await expect(startStandaloneActivityPage.moreOptionsButton).toBeVisible();
    await expect(
      startStandaloneActivityPage.addSearchAttributesCard,
    ).toBeHidden();
    await expect(startStandaloneActivityPage.addMetadataCard).toBeHidden();

    await startStandaloneActivityPage.moreOptionsButton.click();
    await expect(
      startStandaloneActivityPage.addSearchAttributesCard,
    ).toBeVisible();
    await expect(startStandaloneActivityPage.addMetadataCard).toBeVisible();
  });

  test('shows the timeout error when Start to Close Timeout is zero', async ({
    page,
  }) => {
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await startStandaloneActivityPage.activityIdInput.fill('abc-123');
    await startStandaloneActivityPage.activityTypeInput.fill('greet');
    await startStandaloneActivityPage.taskQueueInput.fill('default');
    await startStandaloneActivityPage.startToCloseTimeoutInput.fill('0');

    await startStandaloneActivityPage.submitButton.click();

    await expect(startStandaloneActivityPage.timeoutError).toBeVisible();
  });

  test('shows the timeout error after a value is added and then removed from Start to Close Timeout', async ({
    page,
  }) => {
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await startStandaloneActivityPage.activityIdInput.fill('abc-123');
    await startStandaloneActivityPage.activityTypeInput.fill('greet');
    await startStandaloneActivityPage.taskQueueInput.fill('default');

    await startStandaloneActivityPage.startToCloseTimeoutInput.fill('30');
    await expect(startStandaloneActivityPage.timeoutError).toBeHidden();

    await startStandaloneActivityPage.startToCloseTimeoutInput.fill('');
    await startStandaloneActivityPage.submitButton.click();

    await expect(startStandaloneActivityPage.timeoutError).toBeVisible();
  });

  test('shows the Start Delay input when the namespace supports standalone activity start delay', async ({
    page,
  }) => {
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await expect(startStandaloneActivityPage.startDelayInput).toBeVisible();
  });

  test('hides the Start Delay input when the namespace does not support standalone activity start delay', async ({
    page,
  }) => {
    await mockNamespaceWithoutStandaloneActivityStartDelay(page);

    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await expect(
      startStandaloneActivityPage.startToCloseTimeoutInput,
    ).toBeVisible();
    await expect(startStandaloneActivityPage.startDelayInput).toBeHidden();
  });

  test('keeps the latest Task Queue result when an earlier check responds later', async ({
    page,
  }) => {
    const releaseSlowQueue = await heldTaskQueues(page);
    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    const { taskQueueInput } = startStandaloneActivityPage;
    await taskQueueInput.fill('slow-queue');
    await taskQueueInput.blur();
    await taskQueueInput.fill('fast-queue');
    await taskQueueInput.blur();

    // The inactive box is an error alert, so match its title, not a role.
    const status = page.getByText(/^Task Queue is (active|inactive)$/);
    await expect(status).toHaveText('Task Queue is inactive');

    const slowQueueAnswered = page.waitForResponse(
      /\/task-queues\/slow-queue\?taskQueueType=2/,
    );

    releaseSlowQueue();
    await slowQueueAnswered;
    await nextFrames(page);
    await expect(status).toHaveText('Task Queue is inactive');
  });
});
