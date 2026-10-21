import { expect, test } from '@playwright/test';

import { mockNow, waitForImages } from './fixed-now';
import { mockWorkflowApis } from '../test-utilities/mock-apis';
import { mockDate } from '../test-utilities/mock-date';
import { mockWorkflow } from '../test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;
const screenshotOptions = {
  fullPage: true,
  maxDiffPixelRatio: 0.001,
} as const;

test.beforeEach(async ({ page }) => {
  await mockWorkflowApis(page);
  await page.addInitScript(mockDate);
  await page.addInitScript(mockNow);
});

test('workflow history in light mode', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('dark mode', 'false');
  });
  await page.goto(historyUrl);

  await expect(page.getByTestId('workflow-id-heading')).toBeVisible();
  const eventSummaryTable = page.getByTestId('event-summary-table');
  await expect(eventSummaryTable).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'workflow-history-light.png',
    screenshotOptions,
  );

  if (isMobile) {
    await eventSummaryTable.scrollIntoViewIfNeeded();
    await expect(eventSummaryTable).toHaveScreenshot(
      'event-summary-table-light.png',
    );
  }
});

test('workflow history in dark mode', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('dark mode', 'true');
  });
  await page.goto(historyUrl);

  await expect(page.getByTestId('workflow-id-heading')).toBeVisible();
  const eventSummaryTable = page.getByTestId('event-summary-table');
  await expect(eventSummaryTable).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'workflow-history-dark.png',
    screenshotOptions,
  );

  if (isMobile) {
    await eventSummaryTable.scrollIntoViewIfNeeded();
    await expect(eventSummaryTable).toHaveScreenshot(
      'event-summary-table-dark.png',
    );
  }
});
