/* eslint-disable no-useless-escape */

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

const getQueryParam = (url: string) =>
  new URL(url, 'http://localhost').searchParams.get('query') || '';

const getDatetime = (query: string) =>
  query.split('=')[1].replace(/['"']+/g, '');
const validDatetime = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3})Z$/;

test('it should update the datetime filter based on the selected timezone', async ({
  page,
}) => {
  await page.getByTestId('timezones-menu-button').click();
  await page.getByTestId('top-nav').getByPlaceholder('Search').fill('PDT');
  await page.getByText('Pacific Daylight Time (PDT) UTC-07:00').click();

  await page.getByTestId('add-filter-button').click();
  await page.getByText('CloseTime').click();
  await page.getByRole('button', { name: 'After' }).click();
  await page.getByLabel('Absolute', { exact: true }).check();
  await page.getByLabel('hrs', { exact: true }).fill('5');
  await page.getByRole('button', { name: 'Apply' }).click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`CloseTime`>=\"2025-09-29T12:00:00.000Z\"');

  await expect(
    page.getByRole('button', { name: 'CloseTime >= 2025-09-29 05:00' }),
  ).toBeVisible();

  await page.getByTestId('toggle-manual-query').click();

  let query = await page.getByTestId('manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);

  await page.getByTestId('timezones-menu-button').click();
  await page.getByTestId('top-nav').getByPlaceholder('Search').fill('MDT');
  await page.getByText('Mountain Daylight Time (MDT) UTC-06:00').click();

  await expect(
    page.getByRole('button', { name: 'CloseTime >= 2025-09-29 06:00' }),
  ).toBeVisible();

  query = await page.getByTestId('manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);
});
