import { test, expect } from '@playwright/test';
import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

const importUrl = '/import/events';
const importEventHistoryUrl =
  '/import/events/default/workflow/run/history/feed';
const workflowsUrl = '/namespaces/default/workflows';
const settingsAPI = '**/api/v1/settings?';

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
});

test('Navigate to import page from nav', async ({ page }) => {
  await page.goto(workflowsUrl);

  const namespace = await page.getByTestId('namespace-name').innerText();
  expect(namespace).toBe('default');

  await page.goto(importUrl);
  page.waitForRequest(settingsAPI);

  await page.getByTestId('import-button').click();

  const title = await page.getByTestId('import-event-history').innerText();
  expect(title).toBe('Import Event History');

  const importButton = page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();
});

test('Navigate to import page directly and upload a json file for event history import', async ({
  page,
}) => {
  await page.goto(importUrl);
  page.waitForRequest(settingsAPI);

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
  page.waitForRequest(settingsAPI);

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
