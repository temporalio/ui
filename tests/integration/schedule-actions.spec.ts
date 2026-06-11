import { expect, type Request, test } from '@playwright/test';

import {
  mockSchedule,
  mockScheduleApi,
  mockSchedulesApis,
} from '~/test-utilities/mock-apis';

const scheduleUrl = '/namespaces/default/schedules/test-schedule';

const isPatchRequest = (request: Request) =>
  request.method() === 'POST' &&
  request.url().includes('/schedules/test-schedule/patch');

test.describe('Schedule actions', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page);
    await mockScheduleApi(page);
    await page.goto(scheduleUrl);
    await expect(page.getByTestId('schedule-name')).toContainText(
      'test-schedule',
    );
  });

  test('trigger pre-selects Allow All and sends it', async ({ page }) => {
    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('trigger-schedule').click();

    const modal = page.locator('#trigger-schedule-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#overlap-policy-AllowAll')).toBeChecked();

    const patchRequest = page.waitForRequest(isPatchRequest);
    await modal.getByTestId('confirm-modal-button').click();
    const body = (await patchRequest).postDataJSON();

    expect(body.patch.triggerImmediately.overlapPolicy).toBe('AllowAll');
  });

  test('trigger modal resets its overlap policy when reopened', async ({
    page,
  }) => {
    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('trigger-schedule').click();

    const modal = page.locator('#trigger-schedule-modal');
    await expect(modal).toBeVisible();
    await modal.locator('#overlap-policy-Skip').check();
    await expect(modal.locator('#overlap-policy-Skip')).toBeChecked();

    await modal.getByTestId('cancel-modal-button').click();
    await expect(modal).toBeHidden();

    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('trigger-schedule').click();
    await expect(modal).toBeVisible();
    await expect(modal.locator('#overlap-policy-AllowAll')).toBeChecked();
  });

  test('action modals stay usable after a successful backfill', async ({
    page,
  }) => {
    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('backfill-schedule').click();

    const backfillModal = page.locator('#backfill-schedule-modal');
    await expect(backfillModal).toBeVisible();

    const patchRequest = page.waitForRequest(isPatchRequest);
    await backfillModal.getByTestId('confirm-modal-button').click();
    const body = (await patchRequest).postDataJSON();

    expect(body.patch.backfillRequest).toHaveLength(1);
    expect(body.patch.backfillRequest[0].startTime).toBeTruthy();
    expect(body.patch.backfillRequest[0].endTime).toBeTruthy();

    await expect(backfillModal).toBeHidden();

    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('trigger-schedule').click();

    const triggerModal = page.locator('#trigger-schedule-modal');
    await expect(triggerModal).toBeVisible();
    await expect(
      triggerModal.getByTestId('confirm-modal-button'),
    ).toBeEnabled();
  });

  test('backfill modal shows times based on the schedule timezone', async ({
    page,
  }) => {
    await mockScheduleApi(page, {
      ...mockSchedule,
      schedule: {
        ...mockSchedule.schedule,
        spec: { ...mockSchedule.schedule.spec, timezoneName: 'Asia/Tokyo' },
      },
    });
    await page.goto(scheduleUrl);
    await expect(page.getByTestId('schedule-name')).toContainText(
      'test-schedule',
    );

    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('backfill-schedule').click();

    const modal = page.locator('#backfill-schedule-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Based on Asia/Tokyo')).toBeVisible();
  });

  test('backfill rejects an end time before the start time', async ({
    page,
  }) => {
    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('backfill-schedule').click();

    const modal = page.locator('#backfill-schedule-modal');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText('Based on Universal Standard Time (UTC)'),
    ).toBeVisible();

    const popup = modal.locator('.z-30');
    await modal.locator('#backfill-start-date').click();
    await popup.getByRole('button', { name: 'Next Month' }).click();
    await popup.getByRole('button', { name: '15', exact: true }).click();

    await expect(
      modal.getByText('End time must be after the start time.'),
    ).toBeVisible();
    await expect(modal.getByTestId('confirm-modal-button')).toBeDisabled();

    await modal.locator('#backfill-end-date').click();
    await popup.getByRole('button', { name: 'Next Month' }).click();
    await popup.getByRole('button', { name: '16', exact: true }).click();

    await expect(
      modal.getByText('End time must be after the start time.'),
    ).toBeHidden();
    await expect(modal.getByTestId('confirm-modal-button')).toBeEnabled();
  });

  test('delete confirms and issues a delete request', async ({ page }) => {
    await page.getByLabel('Schedule Actions').click();
    await page.getByTestId('delete-schedule').click();

    const modal = page.locator('#delete-schedule-modal');
    await expect(modal).toBeVisible();

    const deleteRequest = page.waitForRequest(
      (request) =>
        request.method() === 'DELETE' &&
        request.url().includes('/schedules/test-schedule'),
    );
    await modal.getByTestId('confirm-modal-button').click();
    await deleteRequest;
  });
});
