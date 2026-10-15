import { expect, test } from '@playwright/test';

import type { SettingsResponse } from '$lib/types';

import {
  mockSettingsApi,
  mockWorkflowApis,
  mockWorkflowsApis,
} from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

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

test('fullscreen tables cover the banner until restored', async ({
  page,
}, testInfo) => {
  const text = 'PRODUCTION us-east-1 customer workflows require extra care';
  await mockSettingsApi(page, { Banner: { Text: text, Color: 'error' } });
  await page.goto('/namespaces/default/workflows');

  const banner = page.getByTestId('environment-banner');
  await expect(banner).toHaveText(text);
  await page.getByTestId('table-maximize-button').click();

  const table = page.getByTestId('maximizable-table-view');
  await expect(table).toHaveCSS('position', 'fixed');
  const tableBox = await table.boundingBox();
  expect(tableBox.y).toBe(0);
  expect(tableBox.height).toBe(page.viewportSize().height);
  expect(
    await table.evaluate((element) =>
      element.contains(document.elementFromPoint(1, 1)),
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('fullscreen-table.png') });

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('table-maximize-button')).toHaveAccessibleName(
    'Maximize',
  );
  await expect(banner).toBeVisible();
  expect(
    await banner.evaluate((element) =>
      element.contains(document.elementFromPoint(1, 1)),
    ),
  ).toBe(true);
});

test('fullscreen payloads cover the banner until closed', async ({
  page,
}, testInfo) => {
  await mockWorkflowApis(page);
  await mockSettingsApi(page, {
    Banner: { Text: 'PRODUCTION', Color: 'danger' },
  });
  const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
  await page.goto(
    `/namespaces/default/workflows/${workflowId}/${runId}/history`,
  );

  const maximize = page
    .getByTestId('input-and-result')
    .getByRole('button', { name: 'Maximize Input', exact: true });
  await maximize.click();
  const payload = page.getByRole('dialog', { name: 'Input', exact: true });
  await expect(payload).toBeVisible();
  const payloadBox = await payload.boundingBox();
  expect(payloadBox.y).toBe(0);
  expect(payloadBox.height).toBe(page.viewportSize().height);
  expect(
    await payload.evaluate((element) =>
      element.contains(document.elementFromPoint(1, 1)),
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('fullscreen-payload.png'),
  });

  await page.keyboard.press('Escape');
  await expect(payload).toBeHidden();
  await expect(maximize).toBeFocused();
  expect(
    await page
      .getByTestId('environment-banner')
      .evaluate((element) => element.contains(document.elementFromPoint(1, 1))),
  ).toBe(true);
});

test('shares the banner height with portals and updates it when the banner wraps', async ({
  page,
}) => {
  await mockSettingsApi(page, {
    Banner: {
      Text: 'PRODUCTION us-east-1 customer workflows require extra care',
      Color: 'warning',
    },
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/namespaces/default/workflows');
  const banner = page.getByTestId('environment-banner');
  await expect(banner).toBeVisible();
  const wideHeight = (await banner.boundingBox()).height;

  await expect(page.locator('html')).toHaveCSS(
    '--environment-banner-height',
    `${wideHeight}px`,
  );
  await page.setViewportSize({ width: 375, height: 800 });
  await expect
    .poll(async () => (await banner.boundingBox()).height)
    .toBeGreaterThan(wideHeight);
  const wrappedHeight = (await banner.boundingBox()).height;
  await expect(page.locator('body')).toHaveCSS(
    '--environment-banner-height',
    `${wrappedHeight}px`,
  );
  expect((await page.locator('#content-wrapper').boundingBox()).y).toBe(
    wrappedHeight,
  );
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

for (const { color, token, textToken = token } of [
  { color: 'Neutral', token: 'tertiary', textToken: 'secondary' },
  { color: 'Info', token: 'information' },
  { color: 'Warning', token: 'warning' },
  { color: 'Success', token: 'success' },
  { color: 'Danger', token: 'danger' },
  { color: 'Error', token: 'error' },
  { color: 'Accent', token: 'accent' },
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
    await expect(banner).toHaveClass(new RegExp(`text-${textToken}`));
    await expect(page).toHaveTitle('Test | Workflows | default');
  });
}
