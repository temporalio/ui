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

// The raw value the mock workflows carry. The cell renders this through the
// user's time format, so asserting the raw string proves the quick filter uses
// the value behind the cell rather than the text in it.
const MOCK_START_TIME = '2022-03-23T18:06:01.726484047Z';

const bodyCellFor = async (page: Page, column: string) => {
  const headers = page.locator(
    '[data-testid^="workflows-summary-table-header-cell-"]',
  );
  const testIds = await headers.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-testid')),
  );
  const index = testIds.indexOf(
    `workflows-summary-table-header-cell-${column}`,
  );
  expect(index, `no ${column} column in the table`).toBeGreaterThanOrEqual(0);

  return page
    .getByTestId('workflows-summary-configurable-table-row')
    .first()
    .getByTestId('workflows-summary-table-body-cell')
    .nth(index);
};

// The buttons only render while the cell is hovered or focused.
const clickQuickFilter = async (page: Page, column: string) => {
  const cell = await bodyCellFor(page, column);
  await cell.hover();
  await cell.getByTestId('quick-filter-button').click();
};

test('it should quick filter by a Status cell and toggle it back off', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Status');

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Running"');
  await expect(
    page.getByRole('button', { name: 'ExecutionStatus = Running' }),
  ).toBeVisible();

  await clickQuickFilter(page, 'Status');

  await expect.poll(() => getQueryParam(page.url())).toBe('');
  await expect(
    page.getByRole('button', { name: 'ExecutionStatus = Running' }),
  ).toBeHidden();
});

test('it should quick filter a Start cell on the raw timestamp with >=', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Start');

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(`\`StartTime\`>="${MOCK_START_TIME}"`);

  await expect(
    page.getByRole('button', { name: /StartTime >=/ }),
  ).toBeVisible();
});

test('it should collapse a multi-status filter to the status that was clicked', async ({
  page,
}) => {
  await page.getByTestId('add-filter-button').click();
  await page.getByText('ExecutionStatus').click();

  await page.getByTestId('status-dropdown-filter-chip-Completed').click();
  await page.getByTestId('status-dropdown-filter-chip-Failed').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('(`ExecutionStatus`="Completed" OR `ExecutionStatus`="Failed")');

  // The status menu stays open on selection, so dismiss it to reach the table.
  await page.keyboard.press('Escape');

  await clickQuickFilter(page, 'Status');

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Running"');
});

test('it should not offer a quick filter for a column with no value', async ({
  page,
}) => {
  // The mock workflows are all still running, so they have no close time.
  const end = await bodyCellFor(page, 'End');
  await end.hover();

  await expect(end.getByTestId('quick-filter-button')).toBeHidden();
});

test.describe('custom search attribute columns', () => {
  test.beforeEach(async ({ page }) => {
    await mockSearchAttributesApi(page, {
      customAttributes: {
        CustomBoolField: SEARCH_ATTRIBUTE_TYPE.BOOL,
        CustomIntField: SEARCH_ATTRIBUTE_TYPE.INT,
      },
    });

    await page.reload();
    await waitForWorkflowsApis(page);
  });

  const addColumn = async (page: Page, column: string) => {
    await page
      .getByTestId('workflows-summary-table-configuration-button')
      .click();
    await page
      .getByRole('button', { name: `Add ${column} column`, exact: true })
      .click();
    await page.getByRole('button', { name: /Close/ }).first().click();
  };

  test('it should quick filter a Bool value without quoting it', async ({
    page,
  }) => {
    await addColumn(page, 'CustomBoolField');

    await clickQuickFilter(page, 'CustomBoolField');

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`CustomBoolField`=true');
  });

  test('it should quick filter an Int value of zero', async ({ page }) => {
    await addColumn(page, 'CustomIntField');

    await clickQuickFilter(page, 'CustomIntField');

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`CustomIntField`=0');
  });
});
