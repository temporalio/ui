import { expect, test } from '@playwright/test';

import {
  mockSchedulesApis,
  SCHEDULES_COUNT_API,
} from '~/test-utilities/mock-apis';

const schedulesUrl = '/namespaces/default/schedules';

test.describe('Schedules List with no schedules', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page, true, true);
  });

  test('it displays enabled Create Schedule button with no schedules', async ({
    page,
  }) => {
    await page.goto(schedulesUrl);

    await page.waitForResponse(SCHEDULES_COUNT_API);
    const namespace = page.locator('h1');
    await expect(namespace).toHaveText('0 Schedules');

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeEnabled();
  });

  test('it displays empty state when there are no schedules', async ({
    page,
  }) => {
    await page.goto(schedulesUrl);

    await page.waitForResponse(SCHEDULES_COUNT_API);
    const emptyState = page.getByText('No Schedules Found');
    await expect(emptyState).toBeVisible();
  });
});

test.describe('Schedules List with schedules', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page);
  });

  test('it displays enabled Create Schedule button with schedules', async ({
    page,
  }) => {
    await page.goto(schedulesUrl);

    await page.waitForResponse(SCHEDULES_COUNT_API);
    const namespace = page.locator('h1');
    await expect(namespace).toHaveText('15 Schedules');

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeEnabled();
  });

  test('it renders schedule table rows', async ({ page }) => {
    await page.goto(schedulesUrl);

    await page.waitForResponse(SCHEDULES_COUNT_API);
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows).toHaveCount(1);

    const scheduleLink = page.getByRole('link', { name: 'test-schedule' });
    await expect(scheduleLink).toBeVisible();

    const workflowType = page.getByText('run-regularly');
    await expect(workflowType).toBeVisible();
  });
});
