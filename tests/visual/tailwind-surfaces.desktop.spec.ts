import { expect, type Page, test } from '@playwright/test';

import { mockNow, waitForImages } from './fixed-now';
import {
  mockClusterApi,
  mockNamespaceApis,
  mockSchedulesApis,
  mockWorkflowApis,
} from '../test-utilities/mock-apis';
import { mockDate } from '../test-utilities/mock-date';
import { SCHEDULE_API } from '../test-utilities/mocks/schedules';
import {
  mockCompletedWorkflow,
  mockWorkflow,
} from '../test-utilities/mocks/workflow';

const createScheduleUrl = '/namespaces/default/schedules/create';
const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockWorkflow;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;
const {
  workflowExecutionInfo: {
    execution: {
      workflowId: completedWorkflowId,
      runId: completedWorkflowRunId,
    },
  },
} = mockCompletedWorkflow;
const completedWorkflowUrl = `/namespaces/default/workflows/${completedWorkflowId}/${completedWorkflowRunId}/history`;
const scheduleUrl = '/namespaces/default/schedules/test-schedule';
const screenshotOptions = {
  fullPage: true,
  maxDiffPixels: 100,
} as const;

const setTheme = async (page: Page, dark: boolean) => {
  await page.addInitScript((useDarkMode) => {
    window.localStorage.setItem('dark mode', String(useDarkMode));
  }, dark);
};

const mockSchedulePage = async (page: Page) => {
  await mockSchedulesApis(page, true, false, {
    customAttributes: {
      attributeOne: 'Keyword',
      attributeTwo: 'Keyword',
    },
  });
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(mockDate);
  await page.addInitScript(mockNow);
});

test('schedule form in light mode', async ({ page }) => {
  await mockSchedulePage(page);
  await setTheme(page, false);
  await page.goto(createScheduleUrl);

  await expect(
    page.getByRole('heading', { name: 'Create Schedule' }),
  ).toBeVisible();
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'schedule-create-light.png',
    screenshotOptions,
  );
});

test('schedule form with an open control', async ({ page }) => {
  await mockSchedulePage(page);
  await setTheme(page, false);
  await page.goto(createScheduleUrl);

  await page.getByTestId('spec-type-0-button').click();
  await expect(page.getByRole('option', { name: 'Interval' })).toBeVisible();
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'schedule-create-select-open.png',
    screenshotOptions,
  );
});

test('schedule form validation in dark mode', async ({ page }) => {
  await mockSchedulePage(page);
  await setTheme(page, true);
  await page.goto(createScheduleUrl);

  await page.getByTestId('schedule-name-input').fill('nightly');
  await page.getByTestId('schedule-type-input').fill('NightlyWorkflow');
  await page.getByTestId('schedule-workflow-id-input').fill('nightly-workflow');
  await page.getByTestId('schedule-task-queue-input').fill('nightly');
  await page.getByPlaceholder('* * * * *').fill('0 0 * * 1#2');
  await page.getByTestId('create-schedule-button').click();

  await expect(
    page.getByText('Cron string format invalid').first(),
  ).toBeVisible();
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'schedule-create-dark-invalid.png',
    screenshotOptions,
  );
});

test('workflow timeline in dark mode', async ({ page }) => {
  await mockWorkflowApis(page);
  await setTheme(page, true);
  await page.goto(timelineUrl);

  await expect(
    page.getByRole('button', { name: 'Event LongActivity: Scheduled' }),
  ).toBeVisible();
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'workflow-timeline-dark.png',
    screenshotOptions,
  );
});

test('workflow reset modal in light mode', async ({ page }) => {
  await mockWorkflowApis(page, mockCompletedWorkflow);
  await mockClusterApi(page, { serverVersion: '1.24.0' });
  await setTheme(page, false);
  await page.goto(completedWorkflowUrl);

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(
    page.getByTestId('reset-confirmation-modal').locator('visible=true'),
  ).toBeVisible();
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'workflow-reset-modal-light.png',
    screenshotOptions,
  );
});

test('schedule loading state in dark mode', async ({ page }) => {
  await mockNamespaceApis(page);
  await page.route(SCHEDULE_API, () => {});
  await setTheme(page, true);
  await page.goto(scheduleUrl);

  await expect(page.getByTestId('schedule-name')).toContainText(
    'test-schedule',
  );
  await waitForImages(page);
  await expect(page).toHaveScreenshot(
    'schedule-loading-dark.png',
    screenshotOptions,
  );
});
