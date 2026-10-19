import { expect, test } from '@playwright/test';

import { mockNow, waitForImages } from './fixed-now';
import { mockWorkflowApis } from '../test-utilities/mock-apis';
import { mockDate } from '../test-utilities/mock-date';
import { mockWorkflow } from '../test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

test.use({ hasTouch: true });

test('hover actions remain visible on touch devices', async ({ page }) => {
  await mockWorkflowApis(page);
  await page.addInitScript(mockDate);
  await page.addInitScript(mockNow);
  await page.addInitScript(() => {
    window.localStorage.setItem('dark mode', 'false');
  });
  await page.goto(historyUrl);

  const navigationToggle = page.getByTitle('Collapse Navigation');
  const copyAction = page.locator('.copy-action').first();

  await expect(navigationToggle).toBeVisible();
  await expect(navigationToggle).toHaveCSS('opacity', '1');
  await expect(copyAction).toBeVisible();
  await expect(copyAction).toHaveCSS('opacity', '1');
  await waitForImages(page);
  await expect(page).toHaveScreenshot('workflow-history-touch.png', {
    fullPage: true,
    maxDiffPixels: 100,
  });
});
