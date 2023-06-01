import { test, expect } from '@playwright/test';
import { mockNamespacesApi } from '../test-utilities/mock-apis';
import { setLocalStorage } from '../test-utilities/mock-local-storage';

const address = process.env.E2E_UI_ADDRESS ?? 'http://localhost:8233';

test.beforeEach(async ({ page }) => {
  await page.goto(address);
});

test('New Top Navigation modal overlay is present', async ({ page }) => {
  await expect(page.getByTestId('overlay-modal')).toBeVisible();
  await expect(page.getByTestId('overlay-title')).toBeVisible();
  await expect(page.getByTestId('overlay-title')).toHaveText(
    'Check out the new top navigation!',
  );
  await expect(
    page.getByRole('button', { name: 'Got it!' }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Got it!' }).first().click();

  await expect(page.getByTestId('overlay-modal')).not.toBeVisible();
});

test('Top Navigation current namespace is present', async ({ page }) => {
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
  await page.getByTestId('namespace-select-button').click();
  await expect(page.locator('#namespace-search')).toBeFocused();
  await expect(page.getByRole('link', { name: 'default' })).toBeVisible();
});

test('Top Navigation current namespace is present and has other namespaces to search and navigate to', async ({
  page,
}) => {
  await mockNamespacesApi(page);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
  await expect(
    page.getByTestId('data-encoder-status-configured'),
  ).toBeVisible();

  await page.getByTestId('namespace-select-button').click();
  await expect(page.locator('#namespace-search')).toBeFocused();
  await expect(page.getByRole('link', { name: 'default' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'temporal-system' }),
  ).not.toBeVisible();

  await page.locator('#namespace-search').type('some');
  await expect(page.getByRole('link', { name: 'default' })).not.toBeVisible();

  await page.getByRole('link', { name: 'some-other-namespace' }).click();
  await expect(page.getByTestId('namespace-name')).toHaveText(
    'some-other-namespace',
  );
});

test('Top Navigation current namespace is present and has other namespaces to search and stays open with space press', async ({
  page,
}) => {
  await mockNamespacesApi(page);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);

  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
  await expect(
    page.getByTestId('data-encoder-status-configured'),
  ).toBeVisible();

  await page.getByTestId('namespace-select-button').click();
  await expect(page.locator('#namespace-search')).toBeFocused();
  await expect(page.getByRole('link', { name: 'default' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'some-other-namespace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'temporal-system' }),
  ).not.toBeVisible();

  await page.locator('#namespace-search').type('some other namespace');
  await expect(page.getByRole('link', { name: 'default' })).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: 'some-other-namespace' }),
  ).not.toBeVisible();
});

test('Top Navigation current namespace is not present on non-namespace specific pages', async ({
  page,
}) => {
  await mockNamespacesApi(page);
  await setLocalStorage('viewedFeatureTags', JSON.stringify(['topNav']), page);
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();

  await page.getByRole('link', { name: 'Namespaces' }).click();
  await expect(page.getByTestId('namespace-select-button')).not.toBeVisible();
  await page.getByRole('link', { name: 'Workflows' }).first().click();
  await expect(page.getByTestId('namespace-select-button')).toBeVisible();
});
