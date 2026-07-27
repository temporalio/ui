import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';
import '../test-utilities/custom-matchers';

test.describe('Dark Mode Dropdown', () => {
  const localStorageKey = 'dark mode';

  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await page.goto('/');
    await page.getByTestId('user-menu-trigger').click();
    const menuButton = page.getByTestId('dark-mode-toggle-buttons');
    await expect(menuButton).toBeVisible();
  });

  test('user can select System Default option via dropdown menu', async ({
    page,
  }) => {
    const systemModeButton = page.getByTestId('system-mode');
    await expect(systemModeButton).toHaveAccessibleName('System Default');
    await systemModeButton.click();
    await expect(page).toHaveLocalStorageItem(localStorageKey, 'system');
  });

  test('user can select Night option via dropdown menu', async ({ page }) => {
    const nightModeButton = page.getByTestId('night-mode');
    await expect(nightModeButton).toHaveAccessibleName('Night');
    await nightModeButton.click();
    await expect(page).toHaveLocalStorageItem(localStorageKey, true);
  });

  test('user can select Day option via dropdown menu', async ({ page }) => {
    const dayModeButton = page.getByTestId('day-mode');
    await expect(dayModeButton).toHaveAccessibleName('Day');
    await dayModeButton.click();
    await expect(page).toHaveLocalStorageItem(localStorageKey, false);
  });
});
