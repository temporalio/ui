import { expect, test } from '@playwright/test';

import {
  mockSchedulesApis,
  WORKFLOWS_COUNT_API,
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

    await page.waitForResponse(WORKFLOWS_COUNT_API);
    const namespace = await page.locator('h1').innerText();
    expect(namespace).toBe('0 Schedules');

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeEnabled();
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

    await page.waitForResponse(WORKFLOWS_COUNT_API);
    const namespace = await page.locator('h1').innerText();
    expect(namespace).toBe('15 Schedules');

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeEnabled();
  });
});
