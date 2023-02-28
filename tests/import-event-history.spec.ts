import { settingsApi } from '$utilities/mock-apis';
import { test, expect } from '@playwright/test';
const importUrl = '/import/events';
const importEventHistoryUrl =
  '/import/events/namespace/workflow/run/history/feed';

test.beforeEach(async ({ page }) => {
  await page.goto(importUrl);
  await page.waitForRequest(settingsApi);
});

test('Navigate to import page and upload a json file for event history import', async ({
  page,
}) => {
  const title = await page.getByTestId('import-event-history').innerText();
  expect(title).toBe('Import Event History');

  const importButton = await page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();

  const fileUploadButton = await page.locator('input[type="file"]');
  await fileUploadButton.setInputFiles(
    './tests/fixtures/completed-event-history.json',
  );

  await expect(importButton).toBeEnabled();
  await importButton.click();

  const navigationPromise = page.waitForNavigation({
    url: importEventHistoryUrl,
  });
  await navigationPromise;

  const table = await page.locator('table');
  await expect(table).toBeVisible();
});

test('Can navigate directly to import event history', async ({ page }) => {
  await page.goto(importEventHistoryUrl);

  const table = await page.locator('table');
  await expect(table).toBeVisible();

  const importButton = await page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();

  const fileUploadButton = await page.locator('input[type="file"]');
  await fileUploadButton.setInputFiles(
    './tests/fixtures/completed-event-history.json',
  );

  await expect(importButton).toBeEnabled();
  await importButton.click();

  await expect(table).toBeVisible();
});
