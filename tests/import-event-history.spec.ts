import { settingsApi } from '$utilities/mock-apis';
import { test, expect } from '@playwright/test';
import { setLocalStorage } from '$utilities/mock-local-storage';

const importUrl = '/import/events';
const importEventHistoryUrl =
  '/import/events/default/workflow/run/history/feed';
const workflowsUrl = '/namespaces/default/workflows';

test.beforeEach(async ({ page }) => {
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
  await page.reload();
  await page.goto(importUrl);
  await page.waitForRequest(settingsApi);
});

test('Navigate to import page from nav', async ({ page }) => {
  await page.goto(workflowsUrl);

  const namespace = await page.getByTestId('namespace-name').innerText();
  expect(namespace).toBe('default');

  await page.getByTestId('import-button').click();

  const title = await page.getByTestId('import-event-history').innerText();
  expect(title).toBe('Import Event History');

  const importButton = await page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();
});

test('Navigate to import page directly and upload a json file for event history import', async ({
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

test('Navigate to impoart event history page directly to import event history', async ({
  page,
}) => {
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
