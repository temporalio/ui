import { settingsApi } from '$utilities/mock-apis';
import { test, expect } from '@playwright/test';
import { setLocalStorage } from '$utilities/mock-local-storage';

const importUrl = '/import/events';
const importEventHistoryUrl =
  '/import/events/default/workflow/run/history/feed';
const workflowsUrl = '/namespaces/default/workflows';

test('Navigate to import page from nav', async ({ page }) => {
  await page.goto(workflowsUrl);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

  const namespace = await page.getByTestId('namespace-name').innerText();
  expect(namespace).toBe('default');

  await page.goto(importUrl);
  await page.waitForRequest(settingsApi);

  await page.getByTestId('import-button').click();

  const title = await page.getByTestId('import-event-history').innerText();
  await expect(title).toBe('Import Event History');

  const importButton = await page.getByRole('button', { name: 'Import' });
  await expect(importButton).toBeDisabled();
});

test('Navigate to import page directly and upload a json file for event history import', async ({
  page,
}) => {
  await page.goto(importUrl);
  await page.waitForRequest(settingsApi);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

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

test('Navigate to import event history page directly to import event history', async ({
  page,
}) => {
  await page.goto(importEventHistoryUrl);
  await page.waitForRequest(settingsApi);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

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
