import { expect, test } from '@playwright/test';

import { mockWorkersPageApis, WORKERS_API } from '~/test-utilities/mock-apis';

const workersUrl = '/namespaces/default/workers';

test.describe('Worker Instances Tab', () => {
  test.describe('with worker heartbeats enabled and workers', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkersPageApis(page);
    });

    test('renders the workers table with data', async ({ page }) => {
      await page.goto(workersUrl);
      await page.waitForResponse(WORKERS_API);

      const table = page.getByRole('table', { name: 'Workers' });
      await expect(table).toBeVisible();

      const rows = table.locator('tbody tr');
      await expect(rows).toHaveCount(2);

      await expect(rows.first()).toContainText('worker-instance-1');
      await expect(rows.first()).toContainText('my-deployment');
      await expect(rows.first()).toContainText('build-abc123');
      await expect(rows.first()).toContainText('my-task-queue');

      await expect(rows.nth(1)).toContainText('worker-instance-2');
    });
  });

  test.describe('with worker heartbeats enabled and no workers', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkersPageApis(page, { empty: true });
    });

    test('renders the SDK warning empty state', async ({ page }) => {
      await page.goto(workersUrl);
      await page.waitForResponse(WORKERS_API);

      const sdkWarning = page.getByTestId('worker-heartbeats-sdk-warning');
      await expect(sdkWarning).toBeVisible();
    });
  });

  test.describe('with worker heartbeats disabled', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkersPageApis(page, { heartbeatsEnabled: false });
    });

    test('renders the heartbeats disabled empty state', async ({ page }) => {
      await page.goto(workersUrl);

      const disabledState = page.getByTestId('worker-heartbeats-disabled');
      await expect(disabledState).toBeVisible();
    });
  });
});
