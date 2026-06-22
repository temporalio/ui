import { expect, type Page, type Request, test } from '@playwright/test';

import { mockSchedulesApis } from '~/test-utilities/mock-apis';

const createScheduleUrl = '/namespaces/default/schedules/create';

const fillBaseFields = async (page: Page) => {
  await page.getByTestId('schedule-name-input').fill('test');
  await page.getByTestId('schedule-type-input').fill('test');
  await page.getByTestId('schedule-workflow-id-input').fill('test');
  await page.getByTestId('schedule-task-queue-input').fill('test');
};

const isCreateRequest = (request: Request) =>
  request.method() === 'POST' &&
  request.url().includes('/schedules/test') &&
  !request.url().includes('/update') &&
  !request.url().includes('/patch');

test.describe('Creates Schedule Successfully', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page, true, false, {
      customAttributes: {
        attributeOne: 'Keyword',
        attributeTwo: 'Keyword',
      },
    });
    await page.goto(createScheduleUrl);
  });

  test('fills out interval-based schedule and submits', async ({ page }) => {
    await fillBaseFields(page);
    await page.getByTestId('spec-type-0-button').click();
    await page.getByRole('option', { name: 'Interval' }).click();
    await page.getByLabel('Time Interval').fill('90');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByTestId('loading')).toBeVisible();
  });

  test.describe('Multiple Inputs', () => {
    test('adds and removes input rows', async ({ page }) => {
      await expect(page.getByTestId('add-input')).toBeVisible();
      await expect(page.getByTestId('remove-input-0')).toBeHidden();

      await page.getByTestId('add-input').click();
      await expect(page.getByTestId('remove-input-0')).toBeVisible();
      await expect(page.getByTestId('remove-input-1')).toBeVisible();

      await page.getByTestId('remove-input-1').click();
      await expect(page.getByTestId('remove-input-0')).toBeHidden();
    });

    test('does not duplicate editors after add -> remove -> add', async ({
      page,
    }) => {
      const editors = page.locator('[id^="input-"] .cm-content');

      await expect(editors).toHaveCount(1);

      await page.getByTestId('add-input').click();
      await expect(editors).toHaveCount(2);

      await page.getByTestId('remove-input-1').click();
      await expect(editors).toHaveCount(1);

      await page.getByTestId('add-input').click();
      await expect(editors).toHaveCount(2);
    });

    test('removing the first input keeps the correct remaining content', async ({
      page,
    }) => {
      const editors = page.locator('[id^="input-"] .cm-content');

      await page.getByTestId('add-input').click();
      await expect(editors).toHaveCount(2);

      await editors.nth(0).fill('"first"');
      await editors.nth(1).fill('"second"');

      await page.getByTestId('remove-input-0').click();

      await expect(editors).toHaveCount(1);
      await expect(editors.nth(0)).toHaveText('"second"');
    });
  });

  test('fills out schedule with custom search attributes and submits', async ({
    page,
  }) => {
    await fillBaseFields(page);
    await page.getByTestId('spec-type-0-button').click();
    await page.getByRole('option', { name: 'Interval' }).click();
    await page.getByLabel('Time Interval').fill('90');

    await page.getByTestId('workflows-tab').click();
    const workflowsTab = page.getByTestId('workflows-panel');
    await expect(
      workflowsTab.getByTestId('add-search-attribute-button'),
    ).toBeEnabled();
    await workflowsTab.getByTestId('add-search-attribute-button').click();
    await expect(
      workflowsTab.getByTestId('search-attribute-select-button'),
    ).toBeEnabled();
    await workflowsTab.getByTestId('search-attribute-select-button').click();
    await expect(
      workflowsTab.getByRole('option', { name: 'attributeOne' }),
    ).toBeVisible();
    await workflowsTab.getByRole('option', { name: 'attributeOne' }).click();
    await workflowsTab
      .getByTestId('custom-search-attribute-value')
      .fill('workflow-value');

    await page.getByTestId('schedule-tab').click();
    const scheduleTab = page.getByTestId('schedule-panel');
    await expect(
      scheduleTab.getByTestId('add-search-attribute-button'),
    ).toBeEnabled();
    await scheduleTab.getByTestId('add-search-attribute-button').click();
    await expect(
      scheduleTab.getByTestId('search-attribute-select-button'),
    ).toBeEnabled();
    await scheduleTab.getByTestId('search-attribute-select-button').click();
    await expect(
      scheduleTab.getByRole('option', { name: 'attributeTwo' }),
    ).toBeVisible();
    await scheduleTab.getByRole('option', { name: 'attributeTwo' }).click();
    await scheduleTab
      .getByTestId('custom-search-attribute-value')
      .fill('schedule-value');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByTestId('loading')).toBeVisible();
  });

  test('submits a weekly spec that runs in every month', async ({ page }) => {
    await fillBaseFields(page);
    await page.getByTestId('spec-type-0-button').click();
    await page.getByRole('option', { name: 'Days of Week' }).click();
    await page.getByRole('radio', { name: 'Weekdays' }).click();

    const createRequest = page.waitForRequest(isCreateRequest);
    await page.getByTestId('create-schedule-button').click();
    const body = (await createRequest).postDataJSON();

    expect(body.schedule.spec.cronString).toEqual([]);
    expect(body.schedule.spec.structuredCalendar).toHaveLength(1);

    const calendar = body.schedule.spec.structuredCalendar[0];
    expect(calendar.dayOfWeek).toEqual([{ start: 1, end: 5 }]);
    expect(calendar.month).toEqual([{ start: 1, end: 12 }]);
    expect(calendar.dayOfMonth).toEqual([{ start: 1, end: 31 }]);
  });

  test('submits the cron expression exactly as entered', async ({ page }) => {
    await fillBaseFields(page);
    await page.getByPlaceholder('* * * * *').fill('0 12 * * *');

    const createRequest = page.waitForRequest(isCreateRequest);
    await page.getByTestId('create-schedule-button').click();
    const body = (await createRequest).postDataJSON();

    expect(body.schedule.spec.cronString).toEqual(['0 12 * * *']);
    expect(body.schedule.spec.structuredCalendar).toEqual([]);
  });

  test('rejects cron expressions containing "#"', async ({ page }) => {
    await fillBaseFields(page);
    await page.getByPlaceholder('* * * * *').fill('0 0 * * 1#2');

    await page.getByTestId('create-schedule-button').click();

    await expect(
      page.getByText('Cron string format invalid').first(),
    ).toBeVisible();
    await expect(page.getByTestId('loading')).toBeHidden();
  });

  test('re-anchors the end time when the timezone changes', async ({
    page,
  }) => {
    await fillBaseFields(page);
    await page.getByTestId('spec-type-0-button').click();
    await page.getByRole('option', { name: 'Interval' }).click();
    await page.getByLabel('Time Interval').fill('90');

    await page.locator('#end-date-on').check();

    await page.locator('#timezoneName').fill('Tokyo');
    await page.getByRole('option', { name: /Tokyo/ }).first().click();

    const createRequest = page.waitForRequest(isCreateRequest);
    await page.getByTestId('create-schedule-button').click();
    const body = (await createRequest).postDataJSON();

    expect(body.schedule.spec.timezoneName).toContain('Tokyo');
    expect(body.schedule.spec.endTime).toMatch(/T14:59:59\.000Z$/);
  });

  test('removing the only spec resets it to a fresh cron spec', async ({
    page,
  }) => {
    const cronInput = page.getByPlaceholder('* * * * *');
    await cronInput.fill('0 12 * * *');
    await page
      .getByRole('button', { name: '+ Add another schedule spec' })
      .click();
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);

    await page.getByRole('button', { name: 'Delete' }).last().click();
    await expect(page.getByText('At 12:00, every day.').first()).toBeVisible();
    await expect(cronInput).toBeHidden();

    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(cronInput).toBeVisible();
    await expect(cronInput).toHaveValue('');
  });

  test('snaps an emptied catchup window back to its default on blur', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Edit Schedule Policies' }).click();

    const catchupWindow = page.locator('#catchup-window-policy-duration');
    await expect(catchupWindow).toHaveValue('365');

    await catchupWindow.fill('');
    await catchupWindow.blur();

    await expect(page.locator('#catchup-window-policy-duration')).toHaveValue(
      '365',
    );
    await expect(
      page.locator('#catchup-window-policy-duration-unit-select'),
    ).toHaveValue('day(s)');
  });
});
