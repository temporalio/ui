import { expect, test } from '@playwright/test';

import {
  mockScheduleApi,
  mockSchedulesApis,
  WORKFLOWS_COUNT_API,
} from '~/test-utilities/mock-apis';

const schedulesUrl = '/namespaces/default/schedules';
const scheduleEditUrl = '/namespaces/default/schedules/test-schedule/edit';

test.describe('Schedules List with schedules', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page);
    await mockScheduleApi(page);
  });

  test('selects schedule and edits', async ({ page }) => {
    await page.goto(schedulesUrl);

    await page.waitForResponse(WORKFLOWS_COUNT_API);

    const createButton = page.getByTestId('create-schedule');
    await expect(createButton.first()).toBeEnabled();

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
});
