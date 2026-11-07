import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeTimerFired,
  makeTimerStarted,
  makeWorkflowStarted,
  makeWorkflowTaskCompleted,
  makeWorkflowTaskScheduled,
  makeWorkflowTaskStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import {
  mockEventHistoryApi,
  mockWorkflowApis,
} from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

const inGroup = <T extends object>(event: T, id: string) => ({
  ...event,
  eventGroupMarkers: [{ label: { id } }],
});

const events = [
  makeWorkflowStarted(1),
  inGroup(makeActivityScheduled(2, 'LaunchActivity'), 'satellite:A'),
  makeActivityStarted(3, 2),
  makeActivityCompleted(4, 2, 3),
  inGroup(makeTimerStarted(5), 'satellite:A'),
  makeTimerFired(6, 5),
  inGroup(makeActivityScheduled(7, 'OrbitActivity'), 'satellite:B'),
  makeActivityStarted(8, 7),
  makeActivityCompleted(9, 7, 8),
  makeActivityScheduled(10, 'UngroupedActivity'),
  makeActivityStarted(11, 10),
  makeActivityCompleted(12, 10, 11),
  inGroup(makeActivityScheduled(13, 'DockActivity'), 'satellite:C'),
  makeActivityStarted(14, 13),
  makeActivityCompleted(15, 13, 14),
  inGroup(makeTimerStarted(16), 'satellite:C'),
];

const timeline = (page: Page) => page.locator('#event-history-timeline-graph');
const eventRows = (page: Page) =>
  timeline(page).getByRole('button', { name: /^Event / });
const eventRow = (page: Page, name: string) =>
  timeline(page).getByRole('button', { name: new RegExp(`^Event ${name}`) });
const groupRow = (page: Page, name: string) =>
  timeline(page).getByRole('button', { name: new RegExp(`^${name}`) });
const toggle = (page: Page) => page.getByTestId('toggle-event-groups');

test.describe('Timeline event groups', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
    await mockEventHistoryApi(page, {
      history: { events },
      nextPageToken: null,
    });
    await page.goto(timelineUrl);
    await page
      .getByRole('img', { name: `Workflow ${workflowId}: Running` })
      .scrollIntoViewIfNeeded();
    await expect(groupRow(page, 'satellite:A')).toBeVisible();
  });

  test('shows one row per event group by default', async ({ page }) => {
    await expect(toggle(page)).toHaveText('Hide Event Groups');
    await expect(groupRow(page, 'satellite:A')).toContainText('5 events');
    await expect(groupRow(page, 'satellite:B')).toContainText('3 events');
    await expect(eventRows(page)).toHaveCount(0);

    await toggle(page).click();

    await expect(toggle(page)).toHaveText('Show Event Groups');
    await expect(groupRow(page, 'satellite:A')).toHaveCount(0);
    await expect(eventRow(page, 'UngroupedActivity')).toBeVisible();

    await toggle(page).click();

    await expect(toggle(page)).toHaveText('Hide Event Groups');
    await expect(groupRow(page, 'satellite:A')).toBeVisible();
  });

  test('expands and closes an event group', async ({ page }) => {
    const row = groupRow(page, 'satellite:A');
    await expect(row).toHaveAttribute('aria-expanded', 'false');

    await row.click();

    const header = page.getByTestId('selected-event-group-header');
    await expect(header).toContainText('satellite:A');
    await expect(header).toContainText('5 events');
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(eventRows(page)).toHaveCount(2);
    await expect(eventRow(page, 'LaunchActivity')).toBeVisible();
    await expect(page.getByTestId('close-event-group')).toBeFocused();

    await page.getByTestId('close-event-group').click();

    await expect(header).toHaveCount(0);
    await expect(eventRows(page)).toHaveCount(0);
    await expect(row).toHaveAttribute('aria-expanded', 'false');
    await expect(row).toBeFocused();
  });

  test('hides the duration when every event shares a timestamp', async ({
    page,
  }) => {
    await groupRow(page, 'satellite:A').click();

    await expect(page.getByTestId('selected-event-group-header')).toBeVisible();
    await expect(page.getByTestId('selected-event-group-duration')).toHaveCount(
      0,
    );
  });

  test('narrows event groups with the event group filter', async ({ page }) => {
    await page
      .locator('button[aria-controls="event-group-filter-menu"]')
      .click();
    await page
      .locator('#event-group-filter-menu')
      .getByRole('menuitem', { name: /satellite:B/ })
      .click();
    await page.keyboard.press('Escape');

    await expect(groupRow(page, 'satellite:B')).toBeVisible();
    await expect(groupRow(page, 'satellite:A')).toHaveCount(0);
  });

  test('narrows event groups to their pending and failed lifecycles', async ({
    page,
  }) => {
    await expect(groupRow(page, 'satellite:C')).toContainText('4 events');

    await page.locator('button[aria-controls="event-type-filter"]').click();
    await page
      .locator('#event-type-filter')
      .getByTestId('Pending and Failed')
      .click();
    await page.keyboard.press('Escape');

    await expect(groupRow(page, 'satellite:A')).toHaveCount(0);
    const row = groupRow(page, 'satellite:C');
    await expect(row).toContainText('1 event');

    await row.click();

    const header = page.getByTestId('selected-event-group-header');
    await expect(header).toContainText('1 event');
    await expect(eventRows(page)).toHaveCount(1);
  });

  test('restores the pending and failed filter from the URL', async ({
    page,
  }) => {
    await page.goto(`${timelineUrl}?status=pending`);
    await page
      .getByRole('img', { name: `Workflow ${workflowId}: Running` })
      .scrollIntoViewIfNeeded();

    await expect(groupRow(page, 'satellite:C')).toContainText('1 event');
    await expect(groupRow(page, 'satellite:A')).toHaveCount(0);
  });

  test('shows the pending and failed filter after History was left on JSON', async ({
    page,
  }) => {
    await page.getByTestId('history-tab').click();
    await page.getByTestId('json').click();
    await page.goto(`${timelineUrl}?status=pending`);

    const filterButton = page.locator(
      'button[aria-controls="event-type-filter"]',
    );
    await expect(filterButton.locator('.bg-interactive-primary')).toHaveCount(
      1,
    );
    await filterButton.click();
    await expect(
      page
        .locator('#event-type-filter')
        .getByTestId('Pending and Failed')
        .getByRole('checkbox'),
    ).toBeChecked();
  });

  test('stays off when switching to History and back', async ({ page }) => {
    await toggle(page).click();
    await expect(eventRow(page, 'UngroupedActivity')).toBeVisible();

    await page.getByTestId('history-tab').click();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
    await page.getByTestId('timeline-tab').click();

    await expect(toggle(page)).toHaveText('Show Event Groups');
    await expect(groupRow(page, 'satellite:A')).toHaveCount(0);
    await expect(eventRow(page, 'UngroupedActivity')).toBeVisible();
  });
});

test.describe('Timeline event groups only on workflow tasks', () => {
  test('hides the toggle but keeps the event group filter', async ({
    page,
  }) => {
    await mockWorkflowApis(page);
    await mockEventHistoryApi(page, {
      history: {
        events: [
          makeWorkflowStarted(1),
          makeWorkflowTaskScheduled(2),
          makeWorkflowTaskStarted(3, 2),
          inGroup(makeWorkflowTaskCompleted(4, 2), 'satellite:A'),
          makeActivityScheduled(5, 'UngroupedActivity'),
          makeActivityStarted(6, 5),
          makeActivityCompleted(7, 5, 6),
        ],
      },
      nextPageToken: null,
    });
    await page.goto(timelineUrl);
    await page
      .getByRole('img', { name: `Workflow ${workflowId}: Running` })
      .scrollIntoViewIfNeeded();
    await expect(eventRow(page, 'UngroupedActivity')).toBeVisible();

    await expect(
      page.locator('button[aria-controls="event-group-filter-menu"]'),
    ).toBeVisible();
    await expect(toggle(page)).toHaveCount(0);
  });
});
