import { expect, test } from '@playwright/test';

import {
  mockWorkflowsApis,
  mockWorkflowsGroupByCountApi,
  SETTINGS_API,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

const importUrl = '/import/events';
const importEventHistoryUrl =
  '/import/events/default/workflow/run/history/feed';
const workflowsUrl = '/namespaces/default/workflows';

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
});

test('Navigate to import page from nav', async ({ page }, {
  project: {
    use: { isMobile },
  },
}) => {
  await mockWorkflowsGroupByCountApi(page);
  await page.goto(workflowsUrl);
  await waitForWorkflowsApis(page);

  const count = await page.getByTestId('workflow-count').innerText();
  expect(count).toBe('31,230');

  await page.goto(importUrl);
  page.waitForRequest(SETTINGS_API);

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) {
    await page.getByTestId('nav-menu-button').click();
  }
  await page.getByTestId('import-button').locator('visible=true').click();

  const title = await page.getByTestId('import-event-history').innerText();
  expect(title).toBe('Import Event History');

  const importButton = page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();
});

test('Navigate to import page directly and upload a json file for event history import', async ({
  page,
}) => {
  await page.goto(importUrl);
  page.waitForRequest(SETTINGS_API);

  const title = await page.getByTestId('import-event-history').innerText();
  expect(title).toBe('Import Event History');

  const importButton = page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();

  const fileUploadButton = page.locator('input[type="file"]');
  await fileUploadButton.setInputFiles(
    './tests/fixtures/completed-event-history.json',
  );

  await expect(importButton).toBeEnabled();
  await importButton.click();

  const table = page.locator('table');
  await expect(table).toBeVisible();
});

test('Navigate to import event history page directly to import event history', async ({
  page,
}) => {
  await page.goto(importEventHistoryUrl);
  page.waitForRequest(SETTINGS_API);

  const table = page.locator('table');
  await expect(table).toBeVisible();

  const importButton = page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();

  const fileUploadButton = page.locator('input[type="file"]');
  await fileUploadButton.setInputFiles(
    './tests/fixtures/completed-event-history.json',
  );

  await expect(importButton).toBeEnabled();
  await importButton.click();

  await expect(table).toBeVisible();
});
