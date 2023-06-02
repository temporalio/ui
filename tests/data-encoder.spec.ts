import { settingsApi } from '$utilities/mock-apis';
import { test, expect } from '@playwright/test';
import { setLocalStorage } from '$utilities/mock-local-storage';

const importUrl = '/import/events';
const importEventHistoryUrl =
  '/import/events/default/workflow/run/history/feed';
const workflowsUrl = '/namespaces/default/workflows';

test.beforeEach(async ({ page }) => {
  await mockClusterApi(page);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
  cy.get('[data-testid="top-nav"]').as('header');
});

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
