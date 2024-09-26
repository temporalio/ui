import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
  await mockWorkflowsApis(page);
});

test('Top Navigation current namespace is present', async ({ page }) => {
  const switcher = page.getByTestId('namespace-switcher');
  await expect(switcher).toBeVisible();
  await switcher.click();
  await expect(switcher).toBeFocused();
  await expect(page.getByRole('option', { name: 'default' })).toBeVisible();
});

test('Top Navigation current namespace is present and has other namespaces to search and navigate to', async ({
  page,
}) => {
  const switcher = page.getByTestId('namespace-switcher');
  await expect(switcher).toBeVisible();
  await switcher.click();
  await expect(switcher).toBeFocused();
  await expect(page.getByRole('option', { name: 'default' })).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'temporal-system' }),
  ).toBeHidden();

  await switcher.clear();
  await switcher.type('some');
  await expect(page.getByRole('option', { name: 'default' })).toBeHidden();

  await page.getByRole('option', { name: 'some-other-namespace' }).click();
  await expect(switcher).toHaveValue('some-other-namespace');
});

test('Top Navigation current namespace is present and has other namespaces to search and stays open with space press', async ({
  page,
}) => {
  const switcher = page.getByTestId('namespace-switcher');
  await expect(switcher).toBeVisible();
  await switcher.click();
  await expect(switcher).toBeFocused();
  await expect(page.getByRole('option', { name: 'default' })).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'temporal-system' }),
  ).toBeHidden();

  await switcher.clear();
  await switcher.type('some other namespace');
  await expect(page.getByRole('option', { name: 'default' })).toBeHidden();
  await expect(
    page.getByRole('option', { name: 'some-other-namespace' }),
  ).toBeHidden();
});

test('Top Navigation current namespace is present on non-namespace specific pages', async ({
  page,
}) => {
  const switcher = page.getByTestId('namespace-switcher');

  await expect(switcher).toBeVisible();
  await page.getByRole('link', { name: 'Namespaces' }).click();
  await page.getByRole('link', { name: 'Workflows' }).first().click();
  await expect(switcher).toBeVisible();
});
