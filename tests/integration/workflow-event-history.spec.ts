import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/history`;

test.describe('Workflow History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(workflowUrl);
  });

  test('Workflow Execution shows WorkflowId and all sections and event history', async ({
    page,
  }) => {
    await mockWorkflowApis(page);
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );
    await expect(page.getByTestId('timeline-tab')).toBeVisible();
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('call-stack-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('input-and-result')).toBeVisible();
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('compact')).toBeVisible();
    await expect(page.getByTestId('json')).toBeVisible();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    const firstRow = page.getByTestId('event-summary-row').first();
    await firstRow.click();

    const firstRowId = firstRow.getByTestId('link');
    await firstRowId.click();

    await mockWorkflowApis(page);

    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );
  });

  test('Workflow Execution links to specific event', async ({ page }) => {
    await mockWorkflowApis(page);
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );

    const firstRow = page.getByTestId('event-summary-row').first();
    await firstRow.click();

    const firstRowId = firstRow.getByTestId('link');
    await firstRowId.click();

    await mockWorkflowApis(page);

    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );

    await expect(page.getByTestId('timeline-tab')).toBeVisible();
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('call-stack-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('event-summary-log')).toBeVisible();

    await page.getByTestId('history-tab').click();

    await expect(page.getByTestId('timeline-tab')).toBeVisible();
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('call-stack-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('input-and-result')).toBeVisible();
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('compact')).toBeVisible();
    await expect(page.getByTestId('json')).toBeVisible();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
  });
});
