import { test, expect } from '@playwright/test';

const workflowsUrl = '/namespaces/default/workflows';
const apiUrl = 'http://localhost:8233/api/v1';
const workflowsApi = apiUrl + '/namespaces/default/workflows?query=';

test('requests workflows', async ({ page }) => {
  await page.goto(workflowsUrl);
  await page.waitForRequest(workflowsApi);
});

test('it displays the namespace', async ({ page }) => {
  await page.goto(workflowsUrl);

  const namespace = await page.getByTestId('namespace-name').innerText();
  expect(namespace).toBe('default');

  await page.goto('/namespaces/not-real/workflows');

  const fictitiousNamespace = await page
    .getByTestId('namespace-name')
    .innerText();
  expect(fictitiousNamespace).toBe('not-real');
});

test('it has the correct defaults for basic query filters', async ({
  page,
}) => {
  await page.goto(workflowsUrl);
  expect(await page.locator('#workflow-id-filter').inputValue()).toBe('');
  expect(await page.locator('#workflow-type-filter').inputValue()).toBe('');
  expect(await page.locator('#execution-status-filter').inputValue()).toBe(
    'null',
  );
  expect(await page.locator('#time-range-filter').inputValue()).toBe('null');
  expect(await page.locator('#filter-by-relative-time').inputValue()).toBe(
    'UTC',
  );
});

for (const [selector, parameter] of [
  ['#workflow-id-filter', 'WorkflowId'],
  ['#workflow-type-filter', 'WorkflowType'],
]) {
  test(`updates ${parameter} query parameter on input`, async ({ page }) => {
    const input = 'test';
    const expectedQuery = encodeURIComponent(`${parameter}="${input}"`);

    await page.goto(workflowsUrl);
    await page.fill(selector, input);

    await page.waitForRequest(workflowsApi + expectedQuery);

    expect(page.url()).toMatch(expectedQuery);
  });
}

for (const status of [
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
]) {
  const expectedQuery = encodeURIComponent(`ExecutionStatus="${status}"`);

  test(`updates ExecutionStatus query parameter to ${status} when selected`, async ({
    page,
  }) => {
    await page.goto(workflowsUrl);
    await page.locator('#execution-status-filter').selectOption(status);

    await page.waitForRequest(workflowsApi + expectedQuery);

    expect(page.url()).toMatch(expectedQuery);
  });

  test(`sets the basic query filters correctly when navigating to ?query=${expectedQuery}`, async ({
    page,
  }) => {
    await page.goto(workflowsUrl + '?query=' + expectedQuery);
    await page
      .locator('#execution-status-filter')
      .evaluate((select) => select.nodeValue === status);
  });

  test(`sets the advanced query correctly when navigating to ?query=${expectedQuery}`, async ({
    page,
  }) => {
    await page.goto(workflowsUrl + '?search=advanced&query=' + expectedQuery);
    const query = await page.locator('#advanced-search').inputValue();
    expect(query).toBe(`ExecutionStatus="${status}"`);
  });
}

test('toggle to advanced search', async ({ page }) => {
  await page.goto(workflowsUrl);
  await page.getByRole('link', { name: 'Advanced Search' }).click();

  await expect(page.getByRole('link', { name: 'Basic Search' })).toBeVisible();
  await expect(page.locator('#advanced-search')).toBeVisible();

  expect(page.url()).toMatch('?search=advanced');
});

test('it loads the basic search when the parameter is set', async ({
  page,
}) => {
  await page.goto(workflowsUrl + '?search=basic');

  await expect(
    page.getByRole('link', { name: 'Advanced Search' }),
  ).toBeVisible();
});

test('it loads the advanced search when the parameter is set', async ({
  page,
}) => {
  await page.goto(workflowsUrl + '?search=advanced');

  await expect(page.getByRole('link', { name: 'Basic Search' })).toBeVisible();
  await expect(page.locator('#advanced-search')).toBeVisible();
});
