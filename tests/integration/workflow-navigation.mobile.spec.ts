import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
  await mockWorkflowsApis(page);
});

test('Top Navigation current namespace is present', async ({ page }) => {
  const switcher = page
    .getByTestId('namespace-switcher')
    .locator('visible=true');
  await expect(switcher).toBeVisible();
  await expect(switcher).toContainText(/default/i);
});

test('Top Navigation current namespace is present and has other namespaces to search and navigate to', async ({
  page,
}) => {
  const switcher = page
    .getByTestId('namespace-switcher')
    .locator('visible=true');
  await expect(switcher).toBeVisible();
  await switcher.click();
  const searchInput = page.locator('#namespace-search');
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'default' }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'temporal-system' }),
  ).toBeHidden();

  await searchInput.clear();
  await searchInput.fill('some');
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'default' }),
  ).toBeHidden();

  await page
    .getByTestId('namespace-search-list')
    .getByRole('button', { name: 'some-other-namespace' })
    .click();
  await expect(switcher).toContainText(/some/i);
});

test('Top Navigation current namespace is present and has other namespaces to search and stays open with space press', async ({
  page,
}) => {
  const switcher = page
    .getByTestId('namespace-switcher')
    .locator('visible=true');
  await expect(switcher).toBeVisible();
  await switcher.click();
  const searchInput = page.locator('#namespace-search');
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'default' }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'temporal-system' }),
  ).toBeHidden();

  await searchInput.clear();
  await searchInput.fill('some other namespace');
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'default' }),
  ).toBeHidden();
  await expect(
    page
      .getByTestId('namespace-search-list')
      .getByRole('button', { name: 'some-other-namespace' }),
  ).toBeHidden();
});

test('Top Navigation current namespace is present on non-namespace specific pages', async ({
  page,
}) => {
  const switcher = page
    .getByTestId('namespace-switcher')
    .locator('visible=true');
  await expect(switcher).toBeVisible();
  await page.getByTestId('nav-menu-button').click();
  await page.getByRole('link', { name: 'Namespaces' }).click();
  await expect(switcher).toBeVisible();
  await page.getByTestId('nav-menu-button').click();
  await page.getByRole('link', { name: 'Workflows' }).click();
  await expect(switcher).toBeVisible();
});
