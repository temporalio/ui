import { expect, type Page, test } from '@playwright/test';

import { mockNow, waitForImages } from './fixed-now';
import {
  mockGlobalApis,
  mockNamespaceApi,
  mockSchedulesApis,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockWorkflowApis,
} from '../test-utilities/mock-apis';
import { mockDate } from '../test-utilities/mock-date';
import { mockWorkflow } from '../test-utilities/mocks/workflow';

const createScheduleUrl = '/namespaces/default/schedules/create';
const startWorkflowUrl = '/namespaces/default/workflows/start-workflow';
const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockWorkflow;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

const setTheme = async (page: Page, dark: boolean) => {
  await page.addInitScript((useDarkMode) => {
    window.localStorage.setItem('dark mode', String(useDarkMode));
  }, dark);
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(mockDate);
  await page.addInitScript(mockNow);
});

test('schedule form on a narrow viewport', async ({ page }) => {
  await mockSchedulesApis(page, true);
  await setTheme(page, false);
  await page.goto(createScheduleUrl);

  await expect(
    page.getByRole('heading', { name: 'Create Schedule' }),
  ).toBeVisible();
  await waitForImages(page);
  await expect(page).toHaveScreenshot('schedule-create-mobile-light.png', {
    fullPage: true,
  });
});

test('expanded workflow form on a narrow viewport', async ({ page }) => {
  await mockGlobalApis(page);
  await mockNamespaceApi(page);
  await mockSettingsApi(page, {
    StartWorkflowDisabled: false,
  });
  await mockSearchAttributesApi(page);
  await setTheme(page, false);
  await page.goto(startWorkflowUrl);

  await page.getByText('More options').click();
  await expect(page.getByTestId('start-workflow')).toHaveText('Start Workflow');
  await waitForImages(page);
  await expect(page).toHaveScreenshot('workflow-start-mobile-expanded.png', {
    fullPage: true,
  });
});

test('workflow timeline on a narrow dark viewport', async ({ page }) => {
  await mockWorkflowApis(page);
  await setTheme(page, true);
  await page.goto(timelineUrl);

  const timelineGraph = page.getByRole('img', {
    name: /^Workflow /,
  });
  await expect(timelineGraph).toBeVisible();
  await timelineGraph.scrollIntoViewIfNeeded();
  await waitForImages(page);
  await expect(page).toHaveScreenshot('workflow-timeline-mobile-dark.png');
});
