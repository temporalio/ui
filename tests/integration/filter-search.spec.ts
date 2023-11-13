import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockWorkflowApis,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
  await mockWorkflowApis(page);

  await mockClusterApi(page, {
    visibilityStore: 'elasticsearch',
    persistenceStore: 'postgres,elasticsearch',
  });

  page.goto('/namespaces/default/workflows');

  await waitForWorkflowsApis(page);
});

test('it should update the datetime filter based on the selected timezone', async ({
  page,
}) => {
  await page.getByTestId('timezones-menu-button').click();
  await page.getByTestId('top-nav').getByPlaceholder('Search').fill('PDT');
  await page.getByText('Pacific Daylight Time (PDT) UTC-07:00').click();

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByText('CloseTime').click();
  await page.getByRole('menuitem', { name: 'After' }).click();
  await page.getByLabel('Absolute', { exact: true }).check();
  await page.getByLabel('hrs', { exact: true }).fill('5');
  await page.getByRole('button', { name: 'Apply' }).click();

  await page.getByTestId('manual-search-toggle').click();

  let filter = await page.getByTestId('CloseTime-0').innerText();
  expect(filter).toContain('05:00 AM');

  let query = await page.locator('#manual-search').inputValue();
  expect(query).toContain('13:00:00.000Z');

  await page.getByTestId('timezones-menu-button').click();
  await page.getByTestId('top-nav').getByPlaceholder('Search').fill('MDT');
  await page.getByText('Mountain Daylight Time (MDT) UTC-06:00').click();

  filter = await page.getByTestId('CloseTime-0').innerText();
  expect(filter).toContain('06:00 AM');

  query = await page.locator('#manual-search').inputValue();
  expect(query).toContain('13:00:00.000Z');
});
