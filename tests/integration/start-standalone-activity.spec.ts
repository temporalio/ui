import { expect, test } from '@playwright/test';

import { StartStandaloneActivityPage } from '~/pages/start-standalone-activity';
import {
  mockGlobalApis,
  mockNamespaceApi,
  mockSearchAttributesApi,
  mockSettingsApi,
} from '~/test-utilities/mock-apis';

test.describe('Start a Standalone Activity', () => {
  test.beforeEach(async ({ page }) => {
    await mockGlobalApis(page);
    await mockNamespaceApi(page);
    await mockSettingsApi(page);
    await mockSearchAttributesApi(page);
  });

  test.skip('Allows select form fields to be pre-filled via URL Search Parameters', async ({
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

  test.skip('Displays errors when select form fields are incomplete', async ({
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

  test.skip('Allows expanding more options', async ({ page }) => {
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
});
