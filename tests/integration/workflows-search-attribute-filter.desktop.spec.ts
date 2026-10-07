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

// The buttons render only while the cell is hovered, and float outside it, so
// they are looked up at the page rather than inside the cell.
const quickFilterButton = (page: Page) =>
  page.getByTestId('quick-filter-button');

const clickQuickFilter = async (page: Page, column: string) => {
  const cell = await bodyCellFor(page, column);
  await cell.hover();
  // A cell left moments ago keeps its buttons briefly, so wait for just one.
  await expect(quickFilterButton(page)).toHaveCount(1);
  await quickFilterButton(page).click();
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

test('it should ask for an operator before filtering a Start cell', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Start');

  // Opening the popup must not filter anything on its own.
  await expect(page.getByRole('button', { name: 'After' })).toBeVisible();
  expect(getQueryParam(page.url())).toBe('');

  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(`\`StartTime\`>="${MOCK_START_TIME}"`);
  await expect(
    page.getByRole('button', { name: /StartTime >=/ }),
  ).toBeVisible();
});

test('it should quick filter a Start cell with a chosen operator', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Start');

  await page.getByRole('button', { name: 'Before' }).click();
  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe(`\`StartTime\`<="${MOCK_START_TIME}"`);
});

test('it should seed the popup with the value in the cell', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Start');
  await page.getByTestId('apply-filter-button').click();

  // The cell renders the timestamp in the user's format; the filter has to carry
  // the raw value behind it, down to the nanoseconds.
  await expect.poll(() => getQueryParam(page.url())).toContain(MOCK_START_TIME);
});

test('it should ask for an operator on a Keyword column too', async ({
  page,
}) => {
  // `=` is a sensible default for a Keyword, but it is still the cell guessing,
  // so every column but Status offers the choice.
  await clickQuickFilter(page, 'Type');

  await expect(page.getByTestId('apply-filter-button')).toBeVisible();
  expect(getQueryParam(page.url())).toBe('');

  await page.getByTestId('apply-filter-button').click();

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`WorkflowType`="ImportantWorkflowType"');
});

test('it should filter a Status cell in one click, with no popup', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Status');

  await expect
    .poll(() => getQueryParam(page.url()))
    .toBe('`ExecutionStatus`="Running"');
  await expect(page.getByTestId('apply-filter-button')).toBeHidden();
});

test('it should keep the popup open when the pointer leaves the cell', async ({
  page,
}) => {
  await clickQuickFilter(page, 'Start');
  await expect(page.getByRole('button', { name: 'After' })).toBeVisible();

  // The popup is anchored to a button that only exists while the cell is
  // hovered, so the cell has to keep it mounted while the popup is open.
  await page.getByTestId('workflows-summary-table-header-cell-Type').hover();

  await expect(page.getByRole('button', { name: 'After' })).toBeVisible();
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

  await expect(quickFilterButton(page)).toHaveCount(0);
});

test('it should not reserve cell width for the hover buttons', async ({
  page,
}) => {
  const cells = page
    .getByTestId('workflows-summary-configurable-table-row')
    .first()
    .getByTestId('workflows-summary-table-body-cell');

  // The buttons float outside the cell, so no column pads space for them.
  const paddings = await cells.evaluateAll((tds) =>
    tds.map((td) => getComputedStyle(td).paddingRight),
  );
  expect(new Set(paddings)).toEqual(new Set(['8px']));

  // And they are not in the row at all until the cell is hovered.
  await expect(quickFilterButton(page)).toHaveCount(0);
});

test('it should float the buttons above the cell rather than over its value', async ({
  page,
}) => {
  const cell = await bodyCellFor(page, 'Type');
  await cell.hover();

  const button = quickFilterButton(page);
  await expect(button).toBeVisible();
  expect(await button.evaluate((b) => !!b.closest('td'))).toBe(false);

  const buttonBox = await button.boundingBox();
  const cellBox = await cell.boundingBox();
  expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(cellBox.y + 2);

  // Leaving the cell for the buttons must not take them away mid-reach.
  await button.hover();
  await page.waitForTimeout(300);
  await expect(button).toBeVisible();

  // And only ever one at a time, so sweeping a row leaves no trail.
  await expect(button).toHaveCount(1);
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

    // A Bool offers its own True/False toggles rather than an operator row.
    await expect(page.getByRole('button', { name: 'True' })).toBeVisible();
    await page.getByTestId('apply-filter-button').click();

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`CustomBoolField`=true');
  });

  test('it should quick filter an Int value of zero', async ({ page }) => {
    await addColumn(page, 'CustomIntField');

    await clickQuickFilter(page, 'CustomIntField');

    await page.getByTestId('apply-filter-button').click();

    await expect
      .poll(() => getQueryParam(page.url()))
      .toBe('`CustomIntField`=0');
  });
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

    const input = page.locator(
      '#dropdown-filter-chip-CustomKeywordListField-0-list-filter',
    );
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
