import { expect, test } from '@playwright/test';

import {
  mockGlobalApis,
  mockNamespaceApi,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockTaskQueuesApi,
} from '~/test-utilities/mock-apis';

test.describe('Start a Workflow', () => {
  const startWorkflowUrl = '/namespaces/default/workflows/start-workflow';

  test.beforeEach(async ({ page }) => {
    await mockGlobalApis(page);
    await mockNamespaceApi(page);
  });

  test.describe('Start a Workflow - Disabled', () => {
    test('redirects to Workflow list page when start workflow is disabled via Settings API', async ({
      page,
    }) => {
      await page.goto(startWorkflowUrl);
      await expect(page).toHaveURL(
        '/namespaces/default/workflows/start-workflow',
      );
      const navigationPromise = page.waitForURL('namespaces/default/workflows');
      await navigationPromise;
      await expect(page).toHaveURL('/namespaces/default/workflows');
    });
  });

  test.describe('Start a Workflow - Enabled', () => {
    test('Shows blank Start a Workflow form', async ({ page }) => {
      await mockSettingsApi(page, { StartWorkflowDisabled: false });
      await mockSearchAttributesApi(page);
      await page.goto(startWorkflowUrl);
      await expect(page).toHaveURL(
        '/namespaces/default/workflows/start-workflow',
      );
      await expect(page.getByTestId('start-workflow')).toHaveText(
        'Start a Workflow',
      );
      await expect(page.getByTestId('start-workflow-button')).toBeDisabled();
      await expect(page.locator('#workflowId')).toBeEnabled();
      await expect(page.locator('#taskQueue')).toBeEnabled();
      await expect(page.locator('#workflowType')).toBeEnabled();
      await page.locator('#workflowId').type('test-workflow-id');
      await page.locator('#taskQueue').type('task-queue');
      await mockTaskQueuesApi(page);
      await page.locator('#workflowType').type('test-workflow-type');
      await expect(page.getByRole('status')).toContainText(
        'Task Queue is Active',
      );
      await expect(page.getByTestId('start-workflow-button')).toBeEnabled();
    });
  });
});
