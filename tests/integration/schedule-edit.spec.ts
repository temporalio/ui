import { expect, type Request, test } from '@playwright/test';

import {
  mockMonthlyCalendarSchedule,
  mockSchedule,
  mockScheduleApi,
  mockSchedulesApis,
  mockWeeklyCalendarSchedule,
  SCHEDULES_COUNT_API,
} from '~/test-utilities/mock-apis';

const schedulesUrl = '/namespaces/default/schedules';
const scheduleEditUrl = '/namespaces/default/schedules/test-schedule/edit';

const isUpdateRequest = (request: Request) =>
  request.method() === 'POST' && request.url().includes('/update');

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
    await expect(page.getByTestId('schedule-name')).toContainText(
      'test-schedule',
    );

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

  test('applies an overlap policy change made in the drawer on save', async ({
    page,
  }) => {
    await mockScheduleApi(page);
    await page.goto(scheduleEditUrl);
    await expect(page.locator('h1')).toHaveText('Edit Schedule');

    await page.getByRole('button', { name: 'Edit Schedule Policies' }).click();
    await expect(page.getByRole('region')).toBeVisible();

    await page.locator('#overlap-policy-BufferOne').click();
    await page.getByRole('button', { name: 'Update Policies' }).click();

    // The drawer closes and the form is not remounted/reset, so the change
    // survives until the schedule is saved.
    await expect(page.getByRole('region')).toBeHidden();

    const updateRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/update'),
    );
    await page.getByTestId('create-schedule-button').click();
    const body = (await updateRequest).postDataJSON();
    expect(body.schedule.policies.overlapPolicy).toBe('BufferOne');
  });

  test('loads a weekly calendar schedule into a week spec', async ({
    page,
  }) => {
    await mockScheduleApi(page, mockWeeklyCalendarSchedule);
    await page.goto(scheduleEditUrl);

    await expect(page.locator('h1')).toHaveText('Edit Schedule');

    await expect(page.getByText('At 09:30 on weekdays.').first()).toBeVisible();
  });

  test('loads a monthly calendar schedule into a month spec', async ({
    page,
  }) => {
    await mockScheduleApi(page, mockMonthlyCalendarSchedule);
    await page.goto(scheduleEditUrl);

    await expect(page.locator('h1')).toHaveText('Edit Schedule');

    await expect(
      page.getByText('At 00:00 on days 1 and 15 of June.').first(),
    ).toBeVisible();
  });

  test('preserves spec fields the form does not model on edit', async ({
    page,
  }) => {
    await mockScheduleApi(page, {
      ...mockSchedule,
      schedule_id: 'test-schedule',
      schedule: {
        ...mockSchedule.schedule,
        spec: {
          interval: [{ interval: '300s', phase: '0s' }],
          excludeStructuredCalendar: [{ dayOfWeek: [{ start: 6, end: 6 }] }],
          startTime: '2024-03-15T18:30:00Z',
          timezoneName: 'UTC',
        },
        state: {
          // int64 fields arrive as strings from the HTTP API
          limitedActions: true,
          remainingActions: '3',
        },
      },
    });
    await page.goto(scheduleEditUrl);

    await expect(page.locator('h1')).toHaveText('Edit Schedule');
    await expect(page.locator('#endAfterOccurrences')).toHaveValue('3');

    const updateRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/update'),
    );
    await page.getByTestId('create-schedule-button').click();
    const body = (await updateRequest).postDataJSON();

    expect(body.schedule.spec.excludeStructuredCalendar).toEqual([
      { dayOfWeek: [{ start: 6, end: 6 }] },
    ]);
    expect(body.schedule.spec.startTime).toBe('2024-03-15T18:30:00Z');
    expect(body.schedule.spec.interval).toEqual([
      { interval: '300s', phase: '0s' },
    ]);
    expect(body.schedule.state.limitedActions).toBe(true);
    expect(body.schedule.state.remainingActions).toBe(3);
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

    await payloadInput.focus();
    await payloadInput.press('End');
    await payloadInput.press('x');
    await expect(payloadInput).toBeFocused();

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

  test('preserves form edits after edit fails with 403 and retries successfully', async ({
    page,
  }) => {
    await mockScheduleApi(page);
    await page.route(
      '**/schedules/test-schedule/update*',
      (route) =>
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Request unauthorized.' }),
        }),
      { times: 1 },
    );

    await page.goto(scheduleEditUrl);
    await expect(page.locator('h1')).toHaveText('Edit Schedule');

    const workflowInput = page.getByTestId('schedule-workflow-id-input');
    const taskQueueInput = page.getByTestId('schedule-task-queue-input');
    const intervalInput = page.getByLabel('Time Interval');
    const submitButton = page.getByTestId('create-schedule-button');

    await test.step('edit fields', async () => {
      await expect(workflowInput).toHaveValue('test123');
      await workflowInput.fill('new-workflow-id');
      await taskQueueInput.fill('new-task-queue');
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.getByTestId('spec-type-0-button').click();
      await page.getByRole('option', { name: 'Interval' }).click();
      await intervalInput
        .locator('..')
        .getByRole('combobox')
        .selectOption('second(s)');
      await intervalInput.fill('90');
      await page
        .getByRole('button', { name: 'Edit Schedule Policies' })
        .click();
      await page.locator('#overlap-policy-BufferOne').click();
      await page.getByRole('button', { name: 'Update Policies' }).click();
    });

    const failedBody =
      await test.step('failed submit keeps edits', async () => {
        const failedRequest = page.waitForRequest(isUpdateRequest);
        await submitButton.click();
        const body = (await failedRequest).postDataJSON();

        await expect(
          page.getByRole('alert').filter({
            hasText: 'Error editing schedule: 403: Request unauthorized.',
          }),
        ).toBeVisible();
        await expect(submitButton).toBeEnabled();
        await expect(workflowInput).toHaveValue('new-workflow-id');
        await expect(taskQueueInput).toHaveValue('new-task-queue');
        await expect(intervalInput).toHaveValue('90');
        await expect(
          page.getByTestId('toast-live-region-assertive'),
        ).toContainText('Error editing schedule: 403: Request unauthorized.');
        await expect(page).toHaveURL(scheduleEditUrl);
        return body;
      });

    await test.step('retry sends the same body and succeeds', async () => {
      const retryRequest = page.waitForRequest(isUpdateRequest);
      await submitButton.click();
      const retryBody = (await retryRequest).postDataJSON();
      expect(retryBody.schedule).toEqual(failedBody.schedule);
      expect(retryBody.schedule.action.startWorkflow).toMatchObject({
        workflowId: 'new-workflow-id',
        taskQueue: { name: 'new-task-queue' },
      });
      expect(retryBody.schedule.spec.interval).toEqual([
        { interval: '90s', phase: '0s' },
      ]);
      expect(retryBody.schedule.policies.overlapPolicy).toBe('BufferOne');
      await expect(page).toHaveURL(
        '/namespaces/default/schedules/test-schedule',
      );
    });
  });

  test('delete failure on edit page stays in the modal on 403, cancel preserves edits and retry succeeds', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'The edit-page delete button is desktop only');
    await mockScheduleApi(page);
    await page.route('**/schedules/test-schedule*', (route) => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Delete failed.' }),
        });
      }
      return route.fallback();
    });
    await page.goto(scheduleEditUrl);
    await expect(page.locator('h1')).toHaveText('Edit Schedule');

    const workflowInput = page.getByTestId('schedule-workflow-id-input');
    const taskQueueInput = page.getByTestId('schedule-task-queue-input');
    const modal = page.locator('#delete-schedule-modal');
    const confirmButton = modal.getByTestId('confirm-modal-button');

    await test.step('failed delete stays in the modal', async () => {
      await workflowInput.fill('unsaved-workflow-id');
      await taskQueueInput.fill('unsaved-task-queue');
      await page.getByTestId('delete-schedule-button').click();
      await confirmButton.click();

      await expect(modal.getByRole('alert')).toHaveText(
        'Cannot delete schedule. 403: Delete failed.',
      );
      await expect(confirmButton).toBeEnabled();
      await expect(page.getByRole('alert')).toHaveCount(1);
      await expect(page).toHaveURL(scheduleEditUrl);
    });

    await test.step('cancel clears the error and keeps edits', async () => {
      await modal.getByTestId('cancel-modal-button').click();
      await expect(modal).toBeHidden();
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.getByTestId('create-schedule-button')).toBeEnabled();
      await expect(workflowInput).toHaveValue('unsaved-workflow-id');
      await expect(taskQueueInput).toHaveValue('unsaved-task-queue');
    });

    await test.step('retry delete succeeds', async () => {
      await page.unroute('**/schedules/test-schedule*');
      await page.getByTestId('delete-schedule-button').click();
      await expect(modal.getByRole('alert')).toHaveCount(0);
      const deleteRequest = page.waitForRequest(
        (request) =>
          request.method() === 'DELETE' &&
          request.url().includes('/schedules/test-schedule'),
      );
      await confirmButton.click();
      await deleteRequest;
      await expect(page).toHaveURL(schedulesUrl);
      await expect(modal).toBeHidden();
    });
  });
});
