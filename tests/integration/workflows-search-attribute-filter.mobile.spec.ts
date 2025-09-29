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

const getDatetime = (query: string) =>
  query.split('=')[1].replace(/['"']+/g, '');
const validDatetime = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3})Z$/;

test('it should update the datetime filter based on the selected timezone', async ({
  page,
}) => {
  await page.getByTestId('nav-profile-button').click();

  await page
    .getByTestId('timezones-menu-button')
    .locator('visible=true')
    .click();
  await page
    .locator('#timezones-menu')
    .locator('visible=true')
    .getByPlaceholder('Search')
    .fill('PDT');
  await page
    .getByText('Pacific Daylight Time (PDT) UTC-07:00')
    .locator('visible=true')
    .click();

  await page.getByTestId('nav-profile-button').click();

  await page.getByTestId('add-filter-button').click();

  await page.getByText('CloseTime').click();
  await page.getByRole('menuitem', { name: 'After' }).click();
  await page.getByLabel('Absolute', { exact: true }).check();
  await page.getByLabel('hrs', { exact: true }).fill('5');
  await page.getByRole('button', { name: 'Apply' }).click();

  await page.locator('#search-attribute-filter-button').click();
  await page.getByTestId('toggle-manual-query').click();

  let filter = await page.getByTestId('CloseTime-0').innerText();
  expect(filter).toContain('05:00 AM');

  let query = await page.getByTestId('manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);

  await page.getByTestId('nav-profile-button').click();

  await page
    .getByTestId('timezones-menu-button')
    .locator('visible=true')
    .click();
  await page
    .locator('#timezones-menu')
    .locator('visible=true')
    .getByPlaceholder('Search')
    .fill('MDT');
  await page
    .getByText('Mountain Daylight Time (MDT) UTC-06:00')
    .locator('visible=true')
    .click();

  await page.getByTestId('nav-profile-button').click();

  filter = await page.getByTestId('CloseTime-0').innerText();
  expect(filter).toContain('06:00 AM');

  query = await page.getByTestId('manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);
});
