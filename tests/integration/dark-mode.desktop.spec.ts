import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';
import '../test-utilities/custom-matchers';

test.describe('Dark Mode Dropdown', () => {
  const localStorageKey = 'dark mode';

  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await page.goto('/');
  });

  test('user can select System Default option via dropdown menu', async ({
    page,
  }) => {
    const menuButton = page.getByTestId('dark-mode-menu-button');
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await page.getByRole('menuitem', { name: 'System Default' }).click();
    await expect(menuButton).toHaveAccessibleName('System Default');
    await expect(page).toHaveLocalStorageItem(localStorageKey, 'system');
  });

  test('user can select Night option via dropdown menu', async ({ page }) => {
    const menuButton = page.getByTestId('dark-mode-menu-button');
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await page.getByRole('menuitem', { name: 'Night' }).click();
    await expect(menuButton).toHaveAccessibleName('Night');
    await expect(page).toHaveLocalStorageItem(localStorageKey, true);
  });

  test('user can select Day option via dropdown menu', async ({ page }) => {
    const menuButton = page.getByTestId('dark-mode-menu-button');
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await page.getByRole('menuitem', { name: 'Day' }).click();
    await expect(menuButton).toHaveAccessibleName('Day');
    await expect(page).toHaveLocalStorageItem(localStorageKey, false);
  });
});
