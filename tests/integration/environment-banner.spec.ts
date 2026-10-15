import { expect, test } from '@playwright/test';

import type { SettingsResponse } from '$lib/types';

import { mockSettingsApi, mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
});

for (const Banner of [
  undefined,
  null,
  'invalid',
  {},
  { Text: '' },
  { Text: '   ', Color: 'Warning' },
  { Text: 'Test' },
  { Color: 'Warning' },
  { Text: 'Test', Color: '' },
  { Text: 'Test', Color: 'purple' },
  { Text: 'Test', Color: '#ff0000' },
  { Text: 42, Color: 'info' },
  { Text: 'Test', Color: { name: 'info' } },
]) {
  test(`keeps the original layout and title with banner ${JSON.stringify(Banner)}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mockSettingsApi(page, {
      Banner: Banner as SettingsResponse['Banner'],
    });
    await page.goto('/namespaces/default/workflows');

    await expect(page).toHaveTitle('Workflows | default');
    await expect(page.getByTestId('environment-banner')).toHaveCount(0);
    expect((await page.locator('#content-wrapper').boundingBox())?.y).toBe(0);
    expect(errors).toEqual([]);
  });
}

test('keeps the banner and title prefix across navigation and reloads', async ({
  page,
  isMobile,
}) => {
  await mockSettingsApi(page, {
    Banner: { Text: 'PRODUCTION', Color: 'Warning' },
  });
  // Old dismissal preferences must not hide an environment indicator.
  await page.addInitScript(() => {
    localStorage.setItem(
      'dismissed-banners',
      JSON.stringify({ 'settings-banner-text': true }),
    );
    localStorage.setItem('bannerClosed', 'true');
  });
  await page.goto('/namespaces/default/workflows');

  const banner = page.getByTestId('environment-banner');
  await expect(banner).toHaveText('PRODUCTION');
  await expect(banner.getByRole('button')).toHaveCount(0);
  await expect(page).toHaveTitle('PRODUCTION | Workflows | default');

  // eslint-disable-next-line playwright/no-conditional-in-test -- Mobile navigation opens from a menu.
  if (isMobile) {
    await page.getByTestId('nav-menu-button').click();
  }
  await page.getByTestId('import-button').locator('visible=true').click();
  await expect(page).toHaveTitle('PRODUCTION | Import Event History');
  await expect(banner).toBeVisible();

  await page.reload();
  await expect(page).toHaveTitle('PRODUCTION | Import Event History');
  await expect(banner).toBeVisible();
});

test('keeps the mobile navigation menu below the banner', async ({
  page,
  isMobile,
}) => {
  // eslint-disable-next-line playwright/no-skipped-test -- Only the mobile project renders this menu.
  test.skip(!isMobile, 'The menu is only shown on mobile');
  await mockSettingsApi(page, {
    Banner: { Text: 'PRODUCTION', Color: 'info' },
  });
  await page.goto('/namespaces/default/workflows');
  await page.getByTestId('nav-menu-button').click();

  const menu = page.locator('div[data-nav="open"]');
  const banner = page.getByTestId('environment-banner');
  await expect(menu).toBeVisible();
  await expect(banner).toBeVisible();
  expect((await menu.boundingBox()).y).toBe(
    (await banner.boundingBox()).height,
  );
});

test('reserves space for a wrapping banner when the table is maximized', async ({
  page,
}) => {
  const text = 'PRODUCTION us-east-1 customer workflows require extra care';
  await mockSettingsApi(page, { Banner: { Text: text, Color: 'error' } });
  await page.goto('/namespaces/default/workflows');

  const banner = page.getByTestId('environment-banner');
  await expect(banner).toHaveText(text);
  await page.getByTestId('table-maximize-button').click();

  const table = page.getByTestId('maximizable-table-view');
  await expect(table).toHaveCSS('position', 'fixed');
  const bannerBox = await banner.boundingBox();
  const tableBox = await table.boundingBox();
  expect(bannerBox.y).toBe(0);
  expect(tableBox.y).toBe(bannerBox.height);
  expect(tableBox.height + bannerBox.height).toBe(page.viewportSize().height);

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('table-maximize-button')).toHaveAccessibleName(
    'Maximize',
  );
  await expect(banner).toBeVisible();
});

test('shows the banner and prefixed title on the login screen', async ({
  page,
}) => {
  await mockSettingsApi(page, {
    Banner: { Text: 'STAGING', Color: 'success' },
    Auth: { Enabled: true, Options: null },
  });
  await page.goto('/login');

  await expect(page.getByTestId('environment-banner')).toHaveText('STAGING');
  await expect(page.getByTestId('environment-banner')).toHaveClass(
    /bg-surface-success/,
  );
  await expect(page).toHaveTitle('STAGING | Login');
});

for (const { color, token } of [
  { color: 'Info', token: 'information' },
  { color: 'Warning', token: 'warning' },
  { color: 'Success', token: 'success' },
  { color: 'Error', token: 'danger' },
]) {
  test(`renders the ${color ?? 'default'} color using theme presets`, async ({
    page,
  }) => {
    await mockSettingsApi(page, { Banner: { Text: 'Test', Color: color } });
    await page.goto('/namespaces/default/workflows');

    const banner = page.getByTestId('environment-banner');
    await expect(banner).toHaveText('Test');
    await expect(banner).toHaveClass(new RegExp(`bg-surface-${token}`));
    await expect(banner).toHaveClass(new RegExp(`border-${token}`));
    await expect(page).toHaveTitle('Test | Workflows | default');
  });
}
