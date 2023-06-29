import { test, expect } from '@playwright/test';
import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
  await mockWorkflowsApis(page);
});

test('Top Navigation current namespace is present', async ({ page }) => {
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
  await page.getByTestId('namespace-select-button').click();
  await expect(page.locator('#namespace-search')).toBeFocused();
  await expect(page.getByRole('link', { name: 'default' })).toBeVisible();
});

test('Top Navigation current namespace is present and has other namespaces to search and navigate to', async ({
  page,
}) => {
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
  await page.getByTestId('namespace-select-button').click();
  await expect(page.locator('#namespace-search')).toBeFocused();
  await expect(page.getByRole('link', { name: 'default' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'temporal-system' }),
  ).toBeHidden();

  await page.locator('#namespace-search').type('some');
  await expect(page.getByRole('link', { name: 'default' })).toBeHidden();

  await page.getByRole('link', { name: 'some-other-namespace' }).click();
  await expect(page.getByTestId('namespace-name')).toHaveText(
    'some-other-namespace',
  );
});

test('Top Navigation current namespace is present and has other namespaces to search and stays open with space press', async ({
  page,
}) => {
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
  await page.getByTestId('namespace-select-button').click();
  await expect(page.locator('#namespace-search')).toBeFocused();
  await expect(page.getByRole('link', { name: 'default' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'temporal-system' }),
  ).toBeHidden();

  await page.locator('#namespace-search').type('some other namespace');
  await expect(page.getByRole('link', { name: 'default' })).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'some-other-namespace' }),
  ).toBeHidden();
});

test('Top Navigation current namespace is not present on non-namespace specific pages', async ({
  page,
}) => {
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();

  await page.getByRole('link', { name: 'Namespaces' }).click();
  await expect(page.getByTestId('namespace-select-button')).toBeHidden();
  await page.getByRole('link', { name: 'Workflows' }).first().click();
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
});
