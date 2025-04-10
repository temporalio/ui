import { expect, test } from '@playwright/test';

import {
  mockSchedulesApis,
  mockSearchAttributesApi,
} from '~/test-utilities/mock-apis';

const createScheduleUrl = '/namespaces/default/schedules/create';

test.describe('Creates Schedule Successfully', () => {
  test.beforeEach(async ({ page }) => {
    await mockSearchAttributesApi(page, {
      customAttributes: {
        attributeOne: 'Keyword',
        attributeTwo: 'Keyword',
      },
    });

    await mockSchedulesApis(page, true);
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
    await page.getByTestId('add-search-attribute-button').click();
    await page
      .getByTestId('custom-search-attribute-select')
      .selectOption('attributeOne');
    await page
      .getByTestId('custom-search-attribute-value')
      .fill('workflow-value');

    await page.getByTestId('schedule-tab').click();
    await page.getByTestId('add-search-attribute-button').click();
    await page
      .getByTestId('custom-search-attribute-select')
      .selectOption('attributeTwo');
    await page
      .getByTestId('custom-search-attribute-value')
      .fill('schedule-value');

    const createButton = page.getByTestId('create-schedule-button');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await expect(page.getByText('Creating Schedule...')).toBeVisible();
  });
});
