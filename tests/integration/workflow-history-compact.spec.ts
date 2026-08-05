import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

// The compact view paginates grouped events, materializing only the rendered
// page — so these rows check that filtering on a LazyGroup and rendering the
// materialized EventGroup agree.

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

test.describe('Workflow History compact view', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
    await page.goto(historyUrl);
  });

  test('renders grouped rows and keeps them when switching back to feed', async ({
    page,
  }) => {
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
    const feedRowCount = await page.getByTestId('event-summary-row').count();
    expect(feedRowCount).toBeGreaterThan(0);

    await page.getByTestId('compact').click();

    const compactRows = page.getByTestId('event-summary-row');
    await expect(compactRows.first()).toBeVisible();
    const compactRowCount = await compactRows.count();

    // Grouping collapses each activity/timer's events into one row.
    expect(compactRowCount).toBeGreaterThan(0);
    expect(compactRowCount).toBeLessThan(feedRowCount);

    // Cells beyond the event id are group-derived, so they are what proves the
    // row rendered a materialized group rather than a bare summary.
    const table = page.getByTestId('event-summary-table');
    await expect(table).toContainText('LongActivity');
    await expect(table).toContainText('customSignal');
    await expect(compactRows.first()).toContainText('2022');

    await page.getByTestId('feed').click();
    await expect(page.getByTestId('event-summary-row').first()).toBeVisible();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(
      feedRowCount,
    );
  });
});
