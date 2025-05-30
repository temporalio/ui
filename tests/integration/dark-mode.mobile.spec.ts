import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await page.goto('/');
  });

  test('user can toggle dark mode between on, off, and system default', async ({
    page,
  }) => {
    const nightLabel = 'Night';
    const systemDefaultLabel = 'System Default';
    const dayLabel = 'Day';

    // on mobile, the dark mode button is in the profile menu
    await page.getByTestId('nav-profile-button').click();

    // starts on day mode
    const button = page.getByTestId('dark-mode-navigation-button');

    await expect(button).toBeVisible();

    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      null, // nothing in local storage yet
    );

    // after day is system mode
    await button.click();
    await expect(button).toHaveAccessibleName(systemDefaultLabel);
    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      JSON.stringify('system'),
    );

    // after system is dark mode
    await button.click();
    await expect(button).toHaveAccessibleName(nightLabel);
    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      JSON.stringify(true),
    );

    // cycle back to day
    await button.click();
    await expect(button).toHaveAccessibleName(dayLabel);
    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      JSON.stringify(false),
    );
  });
});
