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

  test('user can select and persist a color palette', async ({ page }) => {
    const userMenu = page.locator('#user-menu');
    const menuWidth = await userMenu.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));

    expect(menuWidth.scroll).toBeLessThanOrEqual(menuWidth.client);

    await page.getByTestId('day-mode').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    const initialPresentation = await page.evaluate(() => {
      const content = document.querySelector<HTMLElement>('#content');
      const table = document.querySelector<HTMLElement>('table');
      const bounds = (element: HTMLElement | null) => {
        if (!element) return null;
        const { height, left, top, width } = element.getBoundingClientRect();
        return { height, left, top, width };
      };

      return {
        content: bounds(content),
        interactive: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-interactive-surface')
          .trim(),
        table: bounds(table),
      };
    });

    const emberPaletteButton = page.getByTestId('palette-ember');
    await expect(emberPaletteButton).toHaveAccessibleName('Ember palette');

    await emberPaletteButton.click();

    await expect(userMenu).toBeVisible();
    await expect(page).toHaveLocalStorageItem('color palette', 'ember');
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'ember');
    await expect(page.locator('body')).toHaveAttribute('data-palette', 'ember');

    const vaporwavePaletteButton = page.getByTestId('palette-vaporwave');
    await expect(vaporwavePaletteButton).toHaveAccessibleName(
      'Vaporwave palette',
    );

    await vaporwavePaletteButton.click();

    await expect(userMenu).toBeVisible();
    await expect(page).toHaveLocalStorageItem('color palette', 'vaporwave');
    await expect(page.locator('html')).toHaveAttribute(
      'data-palette',
      'vaporwave',
    );
    await expect(page.locator('body')).toHaveAttribute(
      'data-palette',
      'vaporwave',
    );

    const vaporwavePresentation = await page.evaluate(() => {
      const content = document.querySelector<HTMLElement>('#content');
      const table = document.querySelector<HTMLElement>('table');
      const bounds = (element: HTMLElement | null) => {
        if (!element) return null;
        const { height, left, top, width } = element.getBoundingClientRect();
        return { height, left, top, width };
      };

      return {
        background: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface-background')
          .trim(),
        content: bounds(content),
        interactive: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-interactive-surface')
          .trim(),
        table: bounds(table),
      };
    });

    expect(vaporwavePresentation.interactive).not.toBe(
      initialPresentation.interactive,
    );
    expect(vaporwavePresentation.content).toEqual(initialPresentation.content);
    expect(vaporwavePresentation.table).toEqual(initialPresentation.table);

    await page.getByTestId('night-mode').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const darkPaletteTokens = await page.evaluate(() => {
      const inheritedPaletteScope = document.createElement('div');
      inheritedPaletteScope.dataset.palette = 'vaporwave';

      const forcedDarkPaletteScope = document.createElement('div');
      forcedDarkPaletteScope.dataset.palette = 'vaporwave';
      forcedDarkPaletteScope.dataset.theme = 'dark';

      document.body.append(inheritedPaletteScope, forcedDarkPaletteScope);

      const background = (element: Element) =>
        getComputedStyle(element)
          .getPropertyValue('--color-surface-background')
          .trim();

      const tokens = {
        forcedDark: background(forcedDarkPaletteScope),
        inherited: background(inheritedPaletteScope),
        root: background(document.documentElement),
      };

      inheritedPaletteScope.remove();
      forcedDarkPaletteScope.remove();

      return tokens;
    });

    expect(darkPaletteTokens.root).not.toBe(vaporwavePresentation.background);
    expect(darkPaletteTokens.inherited).toBe(darkPaletteTokens.root);
    expect(darkPaletteTokens.forcedDark).toBe(darkPaletteTokens.root);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute(
      'data-palette',
      'vaporwave',
    );
  });
});
