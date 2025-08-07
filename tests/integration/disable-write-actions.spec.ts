import { expect, test } from '@playwright/test';

import { mockSettingsApi, mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockSchedulesApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/history`;
const schedulesUrl = '/namespaces/default/schedules';

test.describe('Enable write actions by default', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);
    await mockWorkflowApis(page);
  });

  test('Cancel workflow button enabled', async ({ page }) => {
    test.slow();
    const cancelButton = page.getByRole('button', {
      name: 'Request Cancellation',
    });
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();
  });
});

test.describe('Disable write actions on workflow actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);
    await mockWorkflowApis(page);
    await mockSettingsApi(page, { DisableWriteActions: true });
  });

  test('Cancel workflow button disabled', async ({ page }) => {
    const cancelButton = page.getByRole('button', {
      name: 'Request Cancellation',
    });
    await expect(cancelButton).toBeDisabled();
  });
});

test.describe('Disable write actions on empty schedules list actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(schedulesUrl);
    await mockSchedulesApis(page, true, true);
    await mockSettingsApi(page, { DisableWriteActions: true });
  });

  test('Create Schedule button is disabled', async ({ page }) => {
    await page.goto(schedulesUrl);

    const namespace = await page.locator('h1').innerText();
    console.log('Namespace:', namespace);
    expect(namespace).toBe('0 Schedules');
    console.log('Namespace:after', namespace);
    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeDisabled();
    console.log('Namespace:afterafter', namespace);
  });
});
