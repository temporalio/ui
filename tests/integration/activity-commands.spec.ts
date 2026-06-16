import { expect, test } from '@playwright/test';

import { ActivityCommandsPage } from '~/pages/activity-commands';
import {
  mockActivityPauseApi,
  mockActivityResetApi,
  mockActivityUnpauseApi,
  mockActivityUpdateOptionsApi,
  mockClusterApi,
  mockEventHistoryApi,
  mockSettingsApi,
  mockWorkflowApis,
  mockWorkflowWithPausedActivity,
  mockWorkflowWithRunningActivity,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import { mockRunningWorkflow } from '~/test-utilities/mocks/workflow';

test.describe('Activity Commands', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockRunningWorkflow;
  const pauseReason = 'Testing activity pause';

  let activityCommandsPage: ActivityCommandsPage;

  test.beforeEach(async ({ page }) => {
    activityCommandsPage = new ActivityCommandsPage(page);
    await mockClusterApi(page);
    await mockSettingsApi(page);
    await mockEventHistoryApi(page);
  });

  test('should pause a running activity and reflect it in the card', async ({
    page,
  }) => {
    let paused = false;
    await mockWorkflowApis(page, mockWorkflowWithRunningActivity);
    await mockActivityPauseApi(page);
    // After the activity is paused, the refreshed workflow reflects the new state.
    await page.route(WORKFLOW_API, (route) =>
      route.fulfill({
        json: paused
          ? mockWorkflowWithPausedActivity
          : mockWorkflowWithRunningActivity,
      }),
    );
    await page.route(/activities(-deprecated)?\/pause/, (route) => {
      paused = true;
      return route.fulfill({ json: {} });
    });

    await activityCommandsPage.goto({ workflowId, runId });

    await expect(activityCommandsPage.pauseButton).toBeVisible();

    await activityCommandsPage.pauseButton.click();
    await expect(activityCommandsPage.pauseModal).toBeVisible();
    await activityCommandsPage.pauseReasonInput.fill(pauseReason);
    await activityCommandsPage.pauseConfirmButton.click();

    await expect(activityCommandsPage.unpauseButton).toBeVisible();
    await expect(page.getByText('Paused Reason')).toBeVisible();
    await expect(page.getByText(pauseReason)).toBeVisible();
  });

  test('should unpause a paused activity', async ({ page }) => {
    let unpaused = false;
    await mockWorkflowApis(page, mockWorkflowWithPausedActivity);
    await mockActivityUnpauseApi(page);
    await page.route(WORKFLOW_API, (route) =>
      route.fulfill({
        json: unpaused
          ? mockWorkflowWithRunningActivity
          : mockWorkflowWithPausedActivity,
      }),
    );
    await page.route(/activities(-deprecated)?\/unpause/, (route) => {
      unpaused = true;
      return route.fulfill({ json: {} });
    });

    await activityCommandsPage.goto({ workflowId, runId });

    await expect(activityCommandsPage.unpauseButton).toBeVisible();
    await expect(page.getByText(pauseReason)).toBeVisible();

    await activityCommandsPage.unpauseButton.click();
    await expect(activityCommandsPage.unpauseModal).toBeVisible();
    await activityCommandsPage.unpauseConfirmButton.click();

    await expect(activityCommandsPage.pauseButton).toBeVisible();
    await expect(page.getByText('Paused Reason')).toBeHidden();
  });

  test('should reset a running activity', async ({ page }) => {
    await mockWorkflowApis(page, mockWorkflowWithRunningActivity);
    await mockActivityResetApi(page);
    await activityCommandsPage.goto({ workflowId, runId });

    await expect(activityCommandsPage.resetButton).toBeVisible();

    await activityCommandsPage.resetButton.click();
    await expect(activityCommandsPage.resetModal).toBeVisible();
    await activityCommandsPage.resetHeartbeatCheckbox.click();
    await activityCommandsPage.resetConfirmButton.click();

    await expect(activityCommandsPage.resetModal).toBeHidden();
    await expect(
      page.getByText(/Activity .* has been reset successfully\./),
    ).toBeVisible();
  });

  test('should update activity options', async ({ page }) => {
    await mockWorkflowApis(page, mockWorkflowWithRunningActivity);
    await mockActivityUpdateOptionsApi(page);
    await activityCommandsPage.goto({ workflowId, runId });

    await expect(activityCommandsPage.updateButton).toBeVisible();

    await activityCommandsPage.updateButton.click();
    await expect(activityCommandsPage.updateDrawer).toBeVisible();
    await activityCommandsPage.taskQueueInput.fill('new-task-queue');
    await activityCommandsPage.saveButton.click();

    await expect(activityCommandsPage.updateDrawer).toBeHidden();
    await expect(
      page.getByText(/Options for Activity .* have been updated\./),
    ).toBeVisible();
  });
});
