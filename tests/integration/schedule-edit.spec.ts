import { expect, test } from '@playwright/test';

import {
  mockSchedule,
  mockScheduleApi,
  mockSchedulesApis,
  SCHEDULES_COUNT_API,
} from '~/test-utilities/mock-apis';

const schedulesUrl = '/namespaces/default/schedules';
const scheduleEditUrl = '/namespaces/default/schedules/test-schedule/edit';

const scheduleWithInput = (data: string) => ({
  ...mockSchedule,
  schedule: {
    ...mockSchedule.schedule,
    action: {
      ...mockSchedule.schedule.action,
      startWorkflow: {
        ...mockSchedule.schedule.action.startWorkflow,
        input: {
          payloads: [
            {
              metadata: {
                encoding: 'anNvbi9wbGFpbg==',
              },
              data,
            },
          ],
        },
      },
    },
  },
});

test.describe('Schedules List with schedules', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page);
  });

  test('selects schedule and edits', async ({ page }) => {
    await mockScheduleApi(page);
    await page.goto(schedulesUrl);

    await page.waitForResponse(SCHEDULES_COUNT_API);

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton).toBeEnabled();

    const scheduleLink = page.getByRole('link', { name: /test-schedule/i });
    await expect(scheduleLink).toBeVisible();
    await scheduleLink.click();

    await expect(page.getByTestId('schedule-name')).toBeVisible();
    await expect(page.getByTestId('schedule-name')).toHaveText('test-schedule');

    const scheduleActions = page.getByLabel('Schedule Actions');
    await expect(scheduleActions).toBeVisible();
    await scheduleActions.click();

    const editButton = page.getByTestId('edit-schedule');
    await expect(editButton).toBeVisible();
    await editButton.click();
  });

  test('Edits existing schedule', async ({ page }) => {
    await mockScheduleApi(page);
    await page.goto(scheduleEditUrl);

    const heading = page.locator('h1');
    await expect(heading).toHaveText('Edit Schedule');

    const typeInput = page.getByTestId('schedule-type-input');
    await expect(typeInput).toBeVisible();
    await expect(typeInput).toHaveValue('run-regularly');
    const workflowInput = page.getByTestId('schedule-workflow-id-input');
    await expect(workflowInput).toBeVisible();
    await expect(workflowInput).toHaveValue('test123');
    await workflowInput.fill('new-workflow-id');
    const taskQueueInput = page.getByTestId('schedule-task-queue-input');
    await expect(taskQueueInput).toBeVisible();
    await expect(taskQueueInput).toHaveValue('test');

    const submitButton = page.getByTestId('create-schedule-button');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
  });

  test('edits an existing schedule with an object input payload', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));
    await mockScheduleApi(
      page,
      scheduleWithInput('eyJtZXNzYWdlIjoiaGVsbG8ifQ=='),
    );

    await page.goto(scheduleEditUrl);

    const payloadInput = page
      .locator('#schedule-payload-input')
      .getByRole('textbox');
    await expect(payloadInput).toContainText('"message"');

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await expect(payloadInput).toContainText('"message"');
    expect(pageErrors.map(({ message }) => message).join('\n')).not.toContain(
      'split is not a function',
    );
  });

  test('edits an existing schedule with a string input payload', async ({
    page,
  }) => {
    await mockScheduleApi(page, scheduleWithInput('ImhlbGxvIg=='));

    await page.goto(scheduleEditUrl);

    const payloadInput = page
      .locator('#schedule-payload-input')
      .getByRole('textbox');
    await expect(payloadInput).toContainText('"hello"');
    await expect(page.getByText('Input must be valid JSON')).toBeHidden();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await expect(payloadInput).toContainText('"hello"');
    await expect(page.getByText('Input must be valid JSON')).toBeHidden();
  });
});
