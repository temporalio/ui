import { expect, test } from '@playwright/test';

import {
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import {
  mockEventHistoryApi,
  mockWorkflowApis,
} from '~/test-utilities/mock-apis';
import {
  mockWorkflow,
  mockWorkflowWithPendingActivities,
} from '~/test-utilities/mocks/workflow';

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

const inSatelliteGroup = (
  event: ReturnType<typeof makeActivityScheduled>,
  satellite: string,
) => ({
  ...event,
  eventGroupMarkers: [{ label: { id: `satellite:${satellite}` } }],
});

const events = [
  makeWorkflowStarted(1),
  inSatelliteGroup(makeActivityScheduled(2, 'FirstActivity'), 'A'),
  makeActivityStarted(3, 2),
  inSatelliteGroup(makeActivityScheduled(4, 'SecondActivity'), 'B'),
  makeActivityStarted(5, 4),
];

test.describe('Workflow History view with pending activities and filters', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page, mockWorkflowWithPendingActivities);
    await mockEventHistoryApi(page, {
      history: { events },
      nextPageToken: null,
    });
    await page.goto(workflowUrl);
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
    await expect(page.getByTestId('pending-activity-summary-row')).toHaveCount(
      2,
    );
  });

  test('orders pending activities with the sort direction', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('pending-activity-summary-row').nth(0),
    ).toContainText('SecondActivity');
    await expect(
      page.getByTestId('pending-activity-summary-row').nth(1),
    ).toContainText('FirstActivity');

    await page.getByTestId('zoom-in').click();

    await expect(
      page.getByTestId('pending-activity-summary-row').nth(0),
    ).toContainText('FirstActivity');
    await expect(
      page.getByTestId('pending-activity-summary-row').nth(1),
    ).toContainText('SecondActivity');
  });

  test('shows only the pending activities in the selected event group', async ({
    page,
  }) => {
    await page
      .locator('button[aria-controls="event-group-filter-menu"]')
      .click();
    await page
      .locator('#event-group-filter-menu')
      .getByRole('menuitem', { name: /satellite:A/ })
      .click();

    await expect(page.getByTestId('pending-activity-summary-row')).toHaveCount(
      1,
    );
    await expect(
      page.getByTestId('pending-activity-summary-row'),
    ).toContainText('FirstActivity');
  });

  test('hides pending activities when activities are filtered out', async ({
    page,
  }) => {
    await page.locator('button[aria-controls="status-menu"]').click();
    await page.locator('#event-type-menu').getByTestId('Activity').click();

    await expect(page.getByTestId('pending-activity-summary-row')).toHaveCount(
      0,
    );
  });
});
