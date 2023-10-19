import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/history`;

test.beforeEach(async ({ page }) => {
  await mockWorkflowApis(page);
  await page.goto(workflowUrl);
});

test.describe('Workflow History', () => {
  test('Workflow Execution shows WorkflowId and all sections and event history', async ({
    page,
  }) => {
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('stack-trace-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('summary-accordion')).toBeVisible();
    await expect(page.getByTestId('relationships-accordion')).toBeVisible();
    await expect(page.getByTestId('pending-activities')).toBeVisible();
    await expect(page.getByTestId('input-and-results')).toBeVisible();
    await expect(page.getByTestId('timeline-accordion')).toBeVisible();
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('compact')).toBeVisible();
    await expect(page.getByTestId('json')).toBeVisible();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    const firstRow = page.getByTestId('event-summary-row').first();
    await firstRow.click();

    const firstRowId = firstRow.getByTestId('link');
    await firstRowId.click();

    await page.goto(`${workflowUrl}/events/1`);
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );
  });

  test('Workflow Execution links to specific event', async ({ page }) => {
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );

    const firstRow = page.getByTestId('event-summary-row').first();
    await firstRow.click();

    const firstRowId = firstRow.getByTestId('link');
    await firstRowId.click({ force: true });

    await page.goto(`${workflowUrl}/events/1`);
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );

    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('stack-trace-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('summary-accordion')).toBeHidden();
    await expect(page.getByTestId('relationships-accordion')).toBeHidden();
    await expect(page.getByTestId('pending-activities')).toBeHidden();
    await expect(page.getByTestId('input-and-results')).toBeHidden();
    await expect(page.getByTestId('timeline-accordion')).toBeHidden();
    await expect(page.getByTestId('feed')).toBeHidden();
    await expect(page.getByTestId('compact')).toBeHidden();
    await expect(page.getByTestId('json')).toBeHidden();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    await page.getByTestId('history-tab').click();

    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('stack-trace-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('summary-accordion')).toBeVisible();
    await expect(page.getByTestId('relationships-accordion')).toBeVisible();
    await expect(page.getByTestId('pending-activities')).toBeVisible();
    await expect(page.getByTestId('input-and-results')).toBeVisible();
    await expect(page.getByTestId('timeline-accordion')).toBeVisible();
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('compact')).toBeVisible();
    await expect(page.getByTestId('json')).toBeVisible();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
  });
});
