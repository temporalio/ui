import { expect, test } from '@playwright/test';

import { mockSchedulesApis } from '~/test-utilities/mock-apis';

const schedulesUrl = '/namespaces/default/schedules';

test.describe('Schedules List with no schedules', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page, true);
  });

  test('it displays enabled Create Schedule button with no schedules', async ({
    page,
  }) => {
    await page.goto(schedulesUrl);

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

  test('it displays enabled Create Schedule button with no schedules', async ({
    page,
  }) => {
    await page.goto(schedulesUrl);

    const namespace = await page.locator('h1').innerText();
    expect(namespace).toBe('0 Schedules');

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeEnabled();
  });
});
