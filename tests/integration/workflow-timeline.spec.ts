import { expect, type Page, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const timelineUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/timeline`;

const openTimeFilter = async (page: Page) => {
  await page.getByTestId('event-time-filter').click();
  await expect(
    page.getByTestId('event-time-filter-start-section'),
  ).toBeVisible();
};

test.describe('Workflow Timeline — Event Time Filter', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
    await page.goto(timelineUrl);
    await expect(page.getByTestId('timeline-tab')).toBeVisible();
  });

  test('renders the time filter trigger inside the timeline toolbar', async ({
    page,
  }) => {
    await expect(page.getByTestId('event-time-filter')).toBeVisible();
  });

  test('opens the menu with both start and end sections', async ({ page }) => {
    await openTimeFilter(page);
    await expect(
      page.getByTestId('event-time-filter-start-section'),
    ).toBeVisible();
    await expect(
      page.getByTestId('event-time-filter-end-section'),
    ).toBeVisible();
  });

  test('end section is disabled by default and the toggle enables it', async ({
    page,
  }) => {
    await openTimeFilter(page);
    const endSection = page.getByTestId('event-time-filter-end-section');
    const endToggle = endSection.locator('#event-time-filter-end-enabled');

    await expect(endToggle).not.toBeChecked();
    await expect(endSection.locator('input#hour')).toBeDisabled();

    await endToggle.evaluate((el: HTMLInputElement) => el.click());
    await expect(endToggle).toBeChecked();
    await expect(endSection.locator('input#hour')).toBeEnabled();
  });

  test('shows the validation error and disables Apply when end is before start', async ({
    page,
  }) => {
    await openTimeFilter(page);
    const startSection = page.getByTestId('event-time-filter-start-section');
    const endSection = page.getByTestId('event-time-filter-end-section');

    // Pin both dates to the same day so the hour comparison is the deciding
    // factor (defaultStart is 2022 and defaultEnd is "now" for a running mock,
    // so days otherwise differ). DatePicker requires exactly 8 chars MM/DD/YY.
    const sameDay = '01/15/25';
    await startSection.locator('input#datepicker').fill(sameDay);
    await endSection
      .locator('#event-time-filter-end-enabled')
      .evaluate((el: HTMLInputElement) => el.click());
    await endSection.locator('input#datepicker').fill(sameDay);

    await startSection.locator('input#hour').fill('10');
    await endSection.locator('input#hour').fill('09');
    await endSection.locator('input#hour').blur();

    await expect(
      page.getByText('End time must be on or after start time'),
    ).toBeVisible();
    await expect(
      page.getByTestId('event-time-filter-apply-button'),
    ).toBeDisabled();
  });

  test('applying a start time writes time_start to the URL', async ({
    page,
  }) => {
    await openTimeFilter(page);
    const startSection = page.getByTestId('event-time-filter-start-section');

    await startSection.locator('input#hour').fill('08');
    await startSection.locator('input#minute').fill('30');
    await startSection.locator('input#second').fill('00');

    await page.getByTestId('event-time-filter-apply-button').click();

    await expect(page).toHaveURL(/time_start=/);
  });

  test('Clear all removes time filter params from the URL', async ({
    page,
  }) => {
    await openTimeFilter(page);
    await page
      .getByTestId('event-time-filter-start-section')
      .locator('input#hour')
      .fill('08');
    await page.getByTestId('event-time-filter-apply-button').click();
    await expect(page).toHaveURL(/time_start=/);

    await page.getByTestId('event-time-filter').click();
    await page.getByTestId('event-time-filter-clear-button').click();

    await expect(page).not.toHaveURL(/time_start=/);
  });
});
