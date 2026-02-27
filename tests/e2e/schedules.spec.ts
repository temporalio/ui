import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL);
});

test.describe('Schedules Page', () => {
  test('should render empty list of schedules and navigate to Create Schedule page with form', async ({
    page,
  }, {
    project: {
      use: { isMobile },
    },
  }) => {
    test.slow();
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
      await page.getByTestId('nav-menu-button').click();
    }
    const scheduleButton = page
      .getByTestId('schedules-button')
      .locator('visible=true');
    await scheduleButton.click();
    await expect(page).toHaveURL(/schedules/);
    const createScheduleButton = page.getByTestId('create-schedule');
    await expect(createScheduleButton.first()).toBeVisible();
    await createScheduleButton.first().click();
    await expect(page).toHaveURL(/create/);

    await page.getByTestId('schedule-name-input').fill('e2e-schedule-1');
    await page.getByTestId('schedule-type-input').fill('test-type-e2e');
    await page.getByTestId('schedule-workflow-id-input').fill('e2e-1234');
    await page.getByTestId('schedule-task-queue-input').fill('default');
    await page
      .locator('#schedule-payload-input')
      .getByRole('textbox')
      .fill('abc');
    await page.getByRole('textbox', { name: 'hrs' }).fill('1');
    const createSchedule = page.getByRole('button', {
      name: 'Create Schedule',
    });
    await expect(createSchedule).toBeEnabled();
  });
});
