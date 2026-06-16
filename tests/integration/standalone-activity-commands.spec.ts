import { expect, test } from '@playwright/test';

import { StandaloneActivityCommandsPage } from '~/pages/standalone-activity-commands';
import {
  mockClusterApi,
  mockGlobalApis,
  mockNamespaceApi,
  mockPausedActivityExecution,
  mockRunningActivityExecution,
  mockSearchAttributesApi,
  mockStandaloneActivityApi,
  mockStandaloneActivityResetApi,
  mockStandaloneActivityUpdateOptionsApi,
  mockTaskQueuesApi,
  STANDALONE_ACTIVITY_PAUSE_API,
  STANDALONE_ACTIVITY_UNPAUSE_API,
} from '~/test-utilities/mock-apis';

test.describe('Standalone Activity Commands', () => {
  const activityId = mockRunningActivityExecution.info.activityId as string;
  const runId = mockRunningActivityExecution.info.runId as string;
  const pauseReason = 'Testing activity pause';

  let activityCommandsPage: StandaloneActivityCommandsPage;

  test.beforeEach(async ({ page }) => {
    activityCommandsPage = new StandaloneActivityCommandsPage(page);
    await mockGlobalApis(page);
    await mockNamespaceApi(page);
    await mockSearchAttributesApi(page);
    await mockTaskQueuesApi(page);
    await mockClusterApi(page, { serverVersion: '1.31.2' });
  });

  test('should pause a running activity', async ({ page }) => {
    let paused = false;
    await mockStandaloneActivityApi(page, () =>
      paused ? mockPausedActivityExecution : mockRunningActivityExecution,
    );
    await page.route(STANDALONE_ACTIVITY_PAUSE_API, (route) => {
      paused = true;
      return route.fulfill({ json: {} });
    });

    await activityCommandsPage.goto({ activityId, runId });

    await expect(activityCommandsPage.pauseButton).toBeVisible();

    await activityCommandsPage.pauseButton.click();
    await expect(activityCommandsPage.pauseModal).toBeVisible();
    await activityCommandsPage.pauseReasonInput.fill(pauseReason);
    await activityCommandsPage.pauseConfirmButton.click();

    await expect(activityCommandsPage.unpauseButton).toBeVisible();
  });

  test('should unpause a paused activity', async ({ page }) => {
    let unpaused = false;
    await mockStandaloneActivityApi(page, () =>
      unpaused ? mockRunningActivityExecution : mockPausedActivityExecution,
    );
    await page.route(STANDALONE_ACTIVITY_UNPAUSE_API, (route) => {
      unpaused = true;
      return route.fulfill({ json: {} });
    });

    await activityCommandsPage.goto({ activityId, runId });

    await expect(activityCommandsPage.unpauseButton).toBeVisible();

    await activityCommandsPage.unpauseButton.click();
    await expect(activityCommandsPage.unpauseModal).toBeVisible();
    await activityCommandsPage.unpauseConfirmButton.click();

    await expect(activityCommandsPage.pauseButton).toBeVisible();
  });

  test('should reset a running activity', async ({ page }) => {
    await mockStandaloneActivityApi(page, () => mockRunningActivityExecution);
    await mockStandaloneActivityResetApi(page);

    await activityCommandsPage.goto({ activityId, runId });

    await expect(activityCommandsPage.moreActionsButton).toBeVisible();
    await activityCommandsPage.moreActionsButton.click();
    await activityCommandsPage.resetMenuItem.click();

    await expect(activityCommandsPage.resetModal).toBeVisible();
    await activityCommandsPage.resetHeartbeatCheckbox.click();
    await activityCommandsPage.resetConfirmButton.click();

    await expect(activityCommandsPage.resetModal).toBeHidden();
    await expect(
      page.getByText(/Activity .* has been reset successfully\./),
    ).toBeVisible();
  });

  test('should update activity options', async ({ page }) => {
    await mockStandaloneActivityApi(page, () => mockRunningActivityExecution);
    await mockStandaloneActivityUpdateOptionsApi(page);

    await activityCommandsPage.goto({ activityId, runId });

    await expect(activityCommandsPage.moreActionsButton).toBeVisible();
    await activityCommandsPage.moreActionsButton.click();
    await activityCommandsPage.updateMenuItem.click();

    await expect(activityCommandsPage.updateDrawer).toBeVisible();
    await activityCommandsPage.taskQueueInput.fill('new-task-queue');
    await activityCommandsPage.saveButton.click();

    await expect(activityCommandsPage.updateDrawer).toBeHidden();
    await expect(
      page.getByText(/Options for Activity .* have been updated\./),
    ).toBeVisible();
  });
});
