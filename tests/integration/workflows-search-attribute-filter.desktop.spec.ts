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

  await page.getByTestId('toggle-manual-query').click();
  await page
    .getByTestId('manual-search-input')
    .fill('`CloseTime`>="2025-12-25T12:00:00.000Z"');

  await page.getByTestId('manual-search-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`CloseTime`>="2025-12-25T12:00:00.000Z"');

  await expect(
    page.getByRole('button', {
      name: 'CloseTime >= 12/25/25, 04:00:00.00 PST',
    }),
  ).toBeVisible();

  await page.getByTestId('toggle-manual-query').click();

  let query = await page.getByTestId('manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);

  await page.getByTestId('timezones-menu-button').click();
  await page.getByTestId('top-nav').getByPlaceholder('Search').fill('MDT');
  await page.getByText('Mountain Daylight Time (MDT) UTC-06:00').click();

  await expect(
    page.getByRole('button', {
      name: 'CloseTime >= 12/25/25, 05:00:00.00 MST',
    }),
  ).toBeVisible();

  query = await page.getByTestId('manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);
});

test('it should filter by ExecutionStatus', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByText('ExecutionStatus').click();

  await page.getByTestId('status-dropdown-filter-chip-Completed').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Completed"');

  await page.getByTestId('status-dropdown-filter-chip-Failed').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('(`ExecutionStatus`="Completed" OR `ExecutionStatus`="Failed")');
});

test('it should filter by WorkflowId', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowId Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowId-0-text')
    .fill('example-workflow');

  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowId`="example-workflow"');
});

test('it should filter by RunId', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'RunId Keyword' }).click();

  await page.getByTestId('dropdown-filter-chip-RunId-0-text').fill('run-12345');

  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`RunId`="run-12345"');
});

test('it should filter by WorkflowType', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowType Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowType-0-text')
    .fill('ExampleWorkflow');

  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowType`="ExampleWorkflow"');
});

test('it should filter by StartTime with an absolute time', async ({
  page,
}) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByText('StartTime').click();

  await page.getByRole('button', { name: 'After' }).click();
  await page.getByLabel('Absolute', { exact: true }).check();
  await page.getByLabel('hrs', { exact: true }).fill('5');
  await page.getByTestId('apply-filter-button').click();

  await expect.poll(() => getQueryParam(page.url())).toBeTruthy();

  const currentQuery = getQueryParam(page.url());
  expect(currentQuery.startsWith('`StartTime`>="')).toBeTruthy();
  expect(getDatetime(currentQuery)).toMatch(validDatetime);
});

test('it should filter by HistoryLength (number)', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'HistoryLength Int' }).click();

  await page
    .getByTestId('dropdown-filter-chip-HistoryLength-0-number')
    .fill('10');
  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`HistoryLength`="10"');
});

test('it should combine filters', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByText('ExecutionStatus').click();

  await page.getByTestId('status-dropdown-filter-chip-Completed').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Completed"');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'HistoryLength Int' }).click();

  await page
    .getByTestId('dropdown-filter-chip-HistoryLength-1-number')
    .fill('10');
  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Completed" AND `HistoryLength`="10"');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowType Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowType-2-text')
    .fill('ExampleWorkflow');

  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(
      '`ExecutionStatus`="Completed" AND `HistoryLength`="10" AND `WorkflowType`="ExampleWorkflow"',
    );
});

test('it should combine filters and then clear them all', async ({ page }) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByText('ExecutionStatus').click();

  await page.getByTestId('status-dropdown-filter-chip-Completed').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Completed"');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'HistoryLength Int' }).click();

  await page
    .getByTestId('dropdown-filter-chip-HistoryLength-1-number')
    .fill('10');
  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Completed" AND `HistoryLength`="10"');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowType Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowType-2-text')
    .fill('ExampleWorkflow');

  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(
      '`ExecutionStatus`="Completed" AND `HistoryLength`="10" AND `WorkflowType`="ExampleWorkflow"',
    );

  await page.getByTestId('clear-all-filters-button').click();

  await expect.poll(() => getQueryParam(page.url())).toBe('');
});
