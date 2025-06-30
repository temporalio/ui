import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';
import '../test-utilities/custom-matchers';

test.describe('Dark Mode Dropdown on Mobile', () => {
  const localStorageKey = 'dark mode';

  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await page.goto('/');
    // Open the profile menu that contains the dark mode button
    await page.getByTestId('nav-profile-button').click();
  });

  test('user can select System Default option via dropdown menu', async ({
    page,
  }) => {
    const button = page
      .getByTestId('dark-mode-menu-button')
      .locator('visible=true');
    await expect(button).toBeVisible();

    await button.click();
    await page.getByRole('menuitem', { name: 'System Default' }).click();
    await expect(button).toHaveAccessibleName('System Default');
    await expect(page).toHaveLocalStorageItem(localStorageKey, 'system');
  });

  test('user can select Night option via dropdown menu', async ({ page }) => {
    const button = page
      .getByTestId('dark-mode-menu-button')
      .locator('visible=true');
    await expect(button).toBeVisible();

    await button.click();
    await page.getByRole('menuitem', { name: 'Night' }).click();
    await expect(button).toHaveAccessibleName('Night');
    await expect(page).toHaveLocalStorageItem(localStorageKey, true);
  });

  test('user can select Day option via dropdown menu', async ({ page }) => {
    const button = page
      .getByTestId('dark-mode-menu-button')
      .locator('visible=true');
    await expect(button).toBeVisible();

    await button.click();
    await page.getByRole('menuitem', { name: 'Day' }).click();
    await expect(button).toHaveAccessibleName('Day');
    await expect(page).toHaveLocalStorageItem(localStorageKey, false);
  });
});
