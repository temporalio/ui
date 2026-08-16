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

  test('user can select and persist a color palette', async ({ page }) => {
    const emberPaletteButton = page.getByTestId('palette-ember');
    await expect(emberPaletteButton).toHaveAccessibleName('Ember palette');

    await emberPaletteButton.click();

    await expect(page).toHaveLocalStorageItem('color palette', 'ember');
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'ember');
    await expect(page.locator('body')).toHaveAttribute('data-palette', 'ember');

    const vaporwavePaletteButton = page.getByTestId('palette-vaporwave');
    await expect(vaporwavePaletteButton).toHaveAccessibleName(
      'Vaporwave palette',
    );

    await vaporwavePaletteButton.click();

    await expect(page).toHaveLocalStorageItem('color palette', 'vaporwave');
    await expect(page.locator('html')).toHaveAttribute(
      'data-palette',
      'vaporwave',
    );
    await expect(page.locator('body')).toHaveAttribute(
      'data-palette',
      'vaporwave',
    );
  });
});
