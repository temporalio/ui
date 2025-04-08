import { expect, test } from '@playwright/test';

import { mockSchedulesApis } from '~/test-utilities/mock-apis';

const schedulesUrl = '/namespaces/default/schedules';
const createScheduleUrl = '/namespaces/default/schedules/create';

test.describe('Create Schedule Calendar Configuration', () => {
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
    await page.getByLabel('Days').fill('1');
    await page.getByLabel('Hours').fill('2');
    await page.getByLabel('Minutes').fill('30');
    await page.getByLabel('Seconds').fill('0');

    const createButton = page.getByRole('button', { name: /create/i });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page).toHaveURL(schedulesUrl);
    await page.getByRole('link', { name: 'test' }).click();
    await expect(page).toHaveURL('/namespaces/default/schedules/test');
    await expect(page.getByTestId('schedule-name')).toHaveText('test');
  });
});
