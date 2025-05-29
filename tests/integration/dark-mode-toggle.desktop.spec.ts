import { expect, test } from '@playwright/test';

import {
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await page.goto('/namespaces/default/workflows');
    await waitForWorkflowsApis(page, false);
  });

  test('user can toggle dark mode between on, off, and system default', async ({
    page,
  }) => {
    const nightLabel = 'Night';
    const systemDefaultLabel = 'System Default';
    const dayLabel = 'Day';

    // starts on day mode
    // const button = page.getByRole('button', { name: dayLabel });
    const button = page.getByTestId('dark-mode-icon-button');

    await expect(button).toBeVisible();

    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      null, // nothing in local storage yet
    );

    // after day is system mode
    await button.click();
    await expect(button).toHaveAttribute('aria-label', systemDefaultLabel);
    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      JSON.stringify('system'),
    );

    // after system is dark mode
    await button.click();
    await expect(button).toHaveAttribute('aria-label', nightLabel);
    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      JSON.stringify(true),
    );

    // cycle back to day
    await button.click();
    await expect(button).toHaveAttribute('aria-label', dayLabel);
    expect(await page.evaluate(() => localStorage.getItem('dark mode'))).toBe(
      JSON.stringify(false),
    );
  });
});
