import { expect, type Page, test } from '@playwright/test';

import { SEARCH_ATTRIBUTE_TYPE } from '$src/lib/types/workflows';
import {
  mockClusterApi,
  mockWorkflowApis,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';
import { mockSearchAttributesApi } from '~/test-utilities/mocks/search-attributes';

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
  await page.getByTestId('top-nav').getByPlaceholder('Search').fill('CST');
  await page.getByText('Central Standard Time (CST)').click();

  await page.getByTestId('toggle-manual-query').click();
  await page
    .getByTestId('workflow-manual-search-input')
    .fill('`CloseTime`>="2026-12-25T12:00:00.000Z"');

  await page.getByTestId('workflow-manual-search-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`CloseTime`>="2026-12-25T12:00:00.000Z"');

  await expect(
    page.getByRole('button', {
      name: 'CloseTime >= 12/25/26, 6:00:00.00 AM CST',
    }),
  ).toBeVisible();

  await page.getByTestId('toggle-manual-query').click();

  let query = await page
    .getByTestId('workflow-manual-search-input')
    .inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);

  await page.getByTestId('timezones-menu-button').click();
  await page
    .getByTestId('top-nav')
    .getByPlaceholder('Search')
    .fill('Greenwich Mean Time');
  await page.getByText('Greenwich Mean Time (GMT)').click();

  await expect(
    page.getByRole('button', {
      name: 'CloseTime >= 12/25/26, 12:00:00.00 PM GMT',
    }),
  ).toBeVisible();

  await page.getByTestId('toggle-manual-query').click();

  query = await page.getByTestId('workflow-manual-search-input').inputValue();
  expect(getDatetime(query)).toMatch(validDatetime);
});

test('it should focus the search input when opening the filter menu', async ({
  page,
}) => {
  await page.getByTestId('add-filter-button').click();

  await expect(page.locator('#workflow-filter-search')).toBeFocused();
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

  await expect.poll(() => getQueryParam(page.url())).toBe('`HistoryLength`=10');
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
    .toBe('`ExecutionStatus`="Completed" AND `HistoryLength`=10');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowType Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowType-2-text')
    .fill('ExampleWorkflow');

  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(
      '`ExecutionStatus`="Completed" AND `HistoryLength`=10 AND `WorkflowType`="ExampleWorkflow"',
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
    .toBe('`ExecutionStatus`="Completed" AND `HistoryLength`=10');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowType Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowType-2-text')
    .fill('ExampleWorkflow');

  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(
      '`ExecutionStatus`="Completed" AND `HistoryLength`=10 AND `WorkflowType`="ExampleWorkflow"',
    );

  await page.getByTestId('clear-all-filters-button').click();

  await expect.poll(() => getQueryParam(page.url())).toBe('');
});

test('it should resync the filter pills on back and forward navigation', async ({
  page,
}) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'WorkflowType Keyword' }).click();

  await page
    .getByTestId('dropdown-filter-chip-WorkflowType-0-text')
    .fill('ExampleWorkflow');
  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowType`="ExampleWorkflow"');

  await page.getByTestId('add-filter-button').click();
  await page.getByRole('menuitem', { name: 'HistoryLength Int' }).click();

  await page
    .getByTestId('dropdown-filter-chip-HistoryLength-1-number')
    .fill('10');
  await page.getByTestId('apply-filter-button').last().click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowType`="ExampleWorkflow" AND `HistoryLength`=10');

  await page.goBack();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowType`="ExampleWorkflow"');
  await expect(
    page.getByRole('button', { name: 'WorkflowType = "ExampleWorkflow"' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'HistoryLength = 10' }),
  ).toBeHidden();

  await page.goForward();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowType`="ExampleWorkflow" AND `HistoryLength`=10');
  await expect(
    page.getByRole('button', { name: 'HistoryLength = 10' }),
  ).toBeVisible();
});

test.describe('KeywordList search attributes', () => {
  const NOT_IN_QUERY = '`CustomKeywordListField`not in("Hello", "World")';
  const NOT_IN_CHIP = 'CustomKeywordListField not in ("Hello", "World")';

  test.beforeEach(async ({ page }) => {
    await mockSearchAttributesApi(page, {
      customAttributes: {
        CustomKeywordListField: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
      },
    });

    await page.reload();
    await waitForWorkflowsApis(page);
  });

  const addKeywordListFilter = async (page: Page, conditional: string) => {
    await page.getByTestId('add-filter-button').click();
    await page
      .getByRole('menuitem', { name: 'CustomKeywordListField KeywordList' })
      .click();

    await page.getByRole('button', { name: conditional, exact: true }).click();

    const input = page.locator('#list-filter');
    await input.fill('Hello');
    await input.press('Enter');
    await input.fill('World');
    await input.press('Enter');

    await page.getByTestId('apply-filter-button').click();
  };

  test('it should filter a KeywordList with the not in conditional', async ({
    page,
  }) => {
    await addKeywordListFilter(page, 'Not In');

    await expect.poll(() => getQueryParam(page.url())).toBe(NOT_IN_QUERY);
    await expect(page.getByRole('button', { name: NOT_IN_CHIP })).toBeVisible();
  });

  test('it should still filter a KeywordList with the in conditional', async ({
    page,
  }) => {
    await addKeywordListFilter(page, 'In');

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`CustomKeywordListField`in("Hello", "World")');
  });

  test('it should parse a not in KeywordList query back into a filter', async ({
    page,
  }) => {
    await page.getByTestId('toggle-manual-query').click();
    await page.getByTestId('workflow-manual-search-input').fill(NOT_IN_QUERY);
    await page.getByTestId('workflow-manual-search-button').click();

    await expect.poll(() => getQueryParam(page.url())).toBe(NOT_IN_QUERY);

    await page.getByTestId('toggle-manual-query').click();

    await expect(page.getByRole('button', { name: NOT_IN_CHIP })).toBeVisible();
  });
});
