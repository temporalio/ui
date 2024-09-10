import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Schedules Page', () => {
  test('should render empty list of schedules and navigate to Create Schedule page with form', async ({
    page,
  }) => {
    test.slow();
    const scheduleButton = page.getByTestId('schedules-button');
    await scheduleButton.click();
    await expect(page).toHaveURL(/schedules/);
    const createScheduleButton = page.getByTestId('create-schedule');
    await expect(createScheduleButton).toBeVisible();
    await createScheduleButton.click();
    await expect(page).toHaveURL(/create/);

    await page.getByTestId('name').fill('e2e-schedule-1');
    await page.getByTestId('workflowType').fill('test-type-e2e');
    await page.getByTestId('workflowId').fill('e2e-1234');
    await page.getByTestId('taskQueue').fill('default');
    await page.locator('#schedule-input').getByRole('textbox').fill('abc');
    await page.getByRole('textbox', { name: 'hrs' }).fill('1');
    const createSchedule = page.getByRole('button', {
      name: 'Create Schedule',
    });
    await expect(createSchedule).toBeDisabled();

    await page.locator('#schedule-input').getByRole('textbox').clear();
    await page.locator('#schedule-input').getByRole('textbox').fill('123');
    await expect(createSchedule).toBeEnabled();
  });
});
