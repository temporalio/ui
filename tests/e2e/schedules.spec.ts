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
    await expect(createScheduleButton).toBeVisible();
    await createScheduleButton.click();
    await expect(page).toHaveURL(/create/);

    await page.getByTestId('schedule-name-input').fill('e2e-schedule-1');
    await page.getByTestId('schedule-type-input').fill('test-type-e2e');
    await page.getByTestId('schedule-workflow-id-input').fill('e2e-1234');
    await page.getByTestId('schedule-task-queue-input').fill('default');
    await page
      .locator('#schedule-payload-input')
      .getByRole('textbox')
      .fill('"abc"');
    await page.getByTestId('spec-type-0-button').click();
    await page.getByRole('option', { name: 'Interval' }).click();
    await page.getByLabel('Time Interval').fill('90');
    const createSchedule = page.getByRole('button', {
      name: 'Create Schedule',
    });
    await expect(createSchedule).toBeEnabled();
    await createSchedule.click();

    await expect(page).toHaveURL(/schedules$/);
    const scheduleLink = page.getByRole('link', { name: /e2e-schedule-1/ });
    await expect(scheduleLink).toBeVisible();
    await scheduleLink.click();

    await expect(page.getByTestId('schedule-name')).toContainText(
      'e2e-schedule-1',
    );
    await expect(page.getByText('Every 90 minute(s)').first()).toBeVisible();

    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('delete-schedule').click();
    await page
      .locator('#delete-schedule-modal')
      .getByTestId('confirm-modal-button')
      .click();
    await expect(page).toHaveURL(/schedules$/);
  });
});
