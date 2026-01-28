import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockResetWorkflow,
} from '~/test-utilities/mocks/workflow';

test.describe('Workflow Reset Modal Shown', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockCompletedWorkflow;
  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page, mockResetWorkflow);
  });

  test('shows reset alert if workflow was reset', async ({ page }) => {
    await page.goto(workflowUrl);

    const resetAlert = page.getByTestId('workflow-reset-alert');
    await expect(resetAlert).toBeVisible();
  });
});

test.describe('Workflow Reset Modal Not Shown', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockCompletedWorkflow;
  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page, mockCompletedWorkflow);
  });

  test('does not show reset alert if workflow was not reset', async ({
    page,
  }) => {
    await page.goto(workflowUrl);

    const resetAlert = page.getByTestId('workflow-reset-alert');
    await expect(resetAlert).toHaveCount(0);
  });
});
