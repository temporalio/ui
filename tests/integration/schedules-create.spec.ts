import { expect, test } from '@playwright/test';

import { mockSchedulesApis } from '~/test-utilities/mock-apis';

const createScheduleUrl = '/namespaces/default/schedules/create';

test.describe('Creates Schedule Successfully', () => {
  test.beforeEach(async ({ page }) => {
    await mockSchedulesApis(page, true, {
      customAttributes: {
        attributeOne: 'Keyword',
        attributeTwo: 'Keyword',
      },
    });
    await page.goto(createScheduleUrl);
  });

  test('fills out interval-based schedule and submits', async ({ page }) => {
    await page.getByTestId('schedule-name-input').fill('test');
    await page.getByTestId('schedule-type-input').fill('test');
    await page.getByTestId('schedule-workflow-id-input').fill('test');
    await page.getByTestId('schedule-task-queue-input').fill('test');
    await page.getByTestId('interval-tab').click();
    await page.getByTestId('days-input').fill('1');
    await page.getByTestId('hour-interval-input').fill('2');
    await page.getByTestId('minute-interval-input').fill('30');
    await page.getByTestId('second-interval-input').fill('0');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByText('Creating Schedule...')).toBeVisible();
  });

  test('fills out schedule with custom search attributes and submits', async ({
    page,
  }) => {
    await page.getByTestId('schedule-name-input').fill('test');
    await page.getByTestId('schedule-type-input').fill('test');
    await page.getByTestId('schedule-workflow-id-input').fill('test');
    await page.getByTestId('schedule-task-queue-input').fill('test');
    await page.getByTestId('interval-tab').click();
    await page.getByTestId('days-input').fill('1');
    await page.getByTestId('hour-interval-input').fill('2');
    await page.getByTestId('minute-interval-input').fill('30');
    await page.getByTestId('second-interval-input').fill('0');

    await page.getByTestId('workflows-tab').click();
    const workflowsTab = page.getByTestId('workflows-panel');
    await expect(
      workflowsTab.getByTestId('add-search-attribute-button'),
    ).toBeEnabled();
    await workflowsTab.getByTestId('add-search-attribute-button').click();
    const selectInput = workflowsTab.getByTestId(
      'custom-search-attribute-select',
    );
    await expect(selectInput).toBeEnabled();
    await selectInput.click();
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
    await scheduleTab.getByTestId('custom-search-attribute-select').click();

    await scheduleTab.getByRole('option', { name: 'attributeTwo' }).click();
    await scheduleTab
      .getByTestId('custom-search-attribute-value')
      .fill('schedule-value');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByText('Creating Schedule...')).toBeVisible();
  });
});
