import { test, expect } from '@playwright/test';
import { workflowsApi, mockClusterApi } from '$utilities/mock-apis.js';
import { setLocalStorage } from '$utilities/mock-local-storage';
const workflowsUrl = '/namespaces/default/workflows';

test.beforeEach(async ({ page }) => {
  await mockClusterApi(page);
});

test('Navigate with top nav', async ({ page }) => {
  await page.goto(workflowsUrl);
  await page.waitForRequest(workflowsApi);

  // const title = await page.getByTestId('overlay-modal').getAttribute('h1');
  // expect(title).toBe('Check out the new Top Navigation!');
  await page.getByRole('button', { name: 'Got it!' }).first().click();

  expect(await page.locator('#workflow-id-filter').inputValue()).toBe('');
  expect(await page.locator('#workflow-type-filter').inputValue()).toBe('');
  expect(await page.locator('#execution-status-filter').inputValue()).toBe(
    'null',
  );
  expect(await page.locator('#time-range-filter').inputValue()).toBe('null');
  expect(await page.locator('#filter-by-relative-time').inputValue()).toBe(
    'UTC',
  );

  await page.locator('#workflow-type-filter').type('workflowType');
  expect(await page.locator('#manual-search').inputValue()).toBe(
    'workflowType',
  );

  expect(await page.getByTestId('namespace-select-button').innerText()).toBe(
    'default',
  );
});
