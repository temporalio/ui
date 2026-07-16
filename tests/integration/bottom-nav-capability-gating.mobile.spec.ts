import { expect, type Page, test } from '@playwright/test';

import {
  mockClusterApi,
  mockSystemInfoApi,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

const openBottomNavDrawer = async (page: Page) => {
  await page.goto('/namespaces/default/workflows');
  await waitForWorkflowsApis(page, false);
  await page.getByTestId('nav-menu-button').click();
};

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
});

test('hides the Nexus link when the server lacks the nexus capability', async ({
  page,
}) => {
  await mockClusterApi(page, { serverVersion: '1.31.0' });
  await mockSystemInfoApi(page, { capabilities: { nexus: false } });

  await openBottomNavDrawer(page);

  await expect(
    page.getByRole('link', { name: 'Nexus', exact: true }),
  ).toHaveCount(0);
});

test('shows the Nexus link when the server supports nexus', async ({
  page,
}) => {
  await mockClusterApi(page, { serverVersion: '1.31.0' });
  await mockSystemInfoApi(page, { capabilities: { nexus: true } });

  await openBottomNavDrawer(page);

  await expect(
    page.getByRole('link', { name: 'Nexus', exact: true }),
  ).toBeVisible();
});

test('hides the Standalone Activities link on servers older than 1.30.0', async ({
  page,
}) => {
  await mockClusterApi(page, { serverVersion: '1.29.0' });

  await openBottomNavDrawer(page);

  await expect(
    page.getByRole('link', { name: 'Standalone Activities' }),
  ).toHaveCount(0);
});

test('shows the Standalone Activities link on servers 1.30.0 and newer', async ({
  page,
}) => {
  await mockClusterApi(page, { serverVersion: '1.30.0' });

  await openBottomNavDrawer(page);

  await expect(
    page.getByRole('link', { name: 'Standalone Activities' }),
  ).toBeVisible();
});
