import { expect, test } from '@playwright/test';

import { mockSettingsApi, mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/history`;

test.describe('Enable write actions by default', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);
    await mockWorkflowApis(page);
  });

  test('Cancel workflow button enabled', async ({ page }) => {
    const workflowActionButton = page.locator(
      '#workflow-actions-primary-button',
    );
    await expect(workflowActionButton).toBeEnabled();
  });
});

test.describe('Disable write actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);
    await mockWorkflowApis(page);
    await mockSettingsApi(page, { DisableWriteActions: true });
  });

  test('Cancel workflow button disabled', async ({ page }) => {
    const workflowActionButton = page.locator(
      '#workflow-actions-primary-button',
    );
    await expect(workflowActionButton).toBeDisabled();
  });
});
