import { expect, test } from '@playwright/test';

import { StartStandaloneActivityPage } from '~/pages/start-standalone-activity';
import {
  mockClusterApi,
  mockGlobalApis,
  mockNamespaceApi,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockTaskQueuesApi,
} from '~/test-utilities/mock-apis';

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

  test('hides the Start Delay input on server versions below the minimum', async ({
    page,
  }) => {
    await mockClusterApi(page, { serverVersion: '1.30.0' });

    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await expect(
      startStandaloneActivityPage.startToCloseTimeoutInput,
    ).toBeVisible();
    await expect(startStandaloneActivityPage.startDelayInput).toBeHidden();
  });

  test('shows the Start Delay input on supported server versions', async ({
    page,
  }) => {
    await mockClusterApi(page, { serverVersion: '1.31.2' });

    const startStandaloneActivityPage = new StartStandaloneActivityPage(page);
    await startStandaloneActivityPage.goto();

    await expect(startStandaloneActivityPage.startDelayInput).toBeVisible();
  });
});
