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

    await page.getByLabel('Name*').type('e2e-schedule-1');
    await page.getByLabel('Workflow Type*').type('test-type-e2e');
    await page.getByLabel('Workflow Id*').type('e2e-1234');
    await page.getByLabel('Task Queue*').type('default');
    await page.locator('#schedule-input').getByRole('textbox').type('abc');
    await page.getByRole('textbox', { name: 'hrs.' }).type('1');
    const createSchedule = page.getByRole('button', {
      name: 'Create Schedule',
    });
    await expect(createSchedule).toBeDisabled();

    await page.locator('#schedule-input').getByRole('textbox').clear();
    await page.locator('#schedule-input').getByRole('textbox').type('123');
    await expect(createSchedule).toBeEnabled();
  });
});
