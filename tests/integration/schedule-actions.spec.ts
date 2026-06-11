import { expect, type Request, test } from '@playwright/test';

import { mockScheduleApi, mockSchedulesApis } from '~/test-utilities/mock-apis';

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
