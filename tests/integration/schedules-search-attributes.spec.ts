import { expect, test } from '@playwright/test';

import { mockSchedulesApis } from '~/test-utilities/mock-apis';

const createScheduleUrl = '/namespaces/default/schedules/create';

test.describe('Creates Schedule Successfully', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page, true);
    await page.goto(createScheduleUrl);
  });

  test('fills out interval-based schedule and submits', async ({ page }) => {
    await page.getByTestId('schedule-name-input').fill('test');
    await page.getByTestId('schedule-type-input').fill('test');
    await page.getByTestId('schedule-workflow-id-input').fill('test');
    await page.getByTestId('schedule-task-queue-input').fill('test');
    await page.getByRole('tab', { name: /interval/i }).click();
    await page.getByTestId('days-input').fill('1');
    await page.getByTestId('hour-interval-input').fill('2');
    await page.getByTestId('minute-interval-input').fill('30');
    await page.getByTestId('second-interval-input').fill('0');

    const createButton = page.getByRole('button', { name: /create/i });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await page.goto('/namespaces/default/schedules/test');
    await expect(page.getByTestId('schedule-name')).toHaveText('test');
  });
});
