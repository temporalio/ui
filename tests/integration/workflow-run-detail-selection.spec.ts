import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeChildWorkflowCompleted,
  makeChildWorkflowStarted,
  makeStartChildWorkflowInitiated,
  makeWorkflowCompleted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import { mockWorkflowApis, WORKFLOW_API } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;
const graphSelector = '[id="event-history-timeline-graph"]';
const activityName = 'SelectionActivity';

const atSecond = (event: HistoryEvent, second: number): HistoryEvent => ({
  ...event,
  eventTime: `2024-01-01T00:00:${String(second).padStart(2, '0')}.000000000Z`,
});

const activityEvents = [
  makeWorkflowStarted(1),
  atSecond(makeActivityScheduled(2, activityName), 10),
  atSecond(makeActivityStarted(3, 2), 15),
  atSecond(makeActivityCompleted(4, 2, 3), 20),
];
const events = [
  ...activityEvents,
  atSecond(makeStartChildWorkflowInitiated(5), 25),
  atSecond(makeChildWorkflowStarted(6, 5), 30),
  atSecond(makeChildWorkflowCompleted(7, 5, 6), 40),
  atSecond(makeWorkflowCompleted(8), 50),
];
const childEvents = [...activityEvents, atSecond(makeWorkflowCompleted(5), 50)];

const workflowFor = (id: string, executionRunId: string) => ({
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    execution: { workflowId: id, runId: executionRunId },
    status: 'Completed',
    startTime: events[0].eventTime,
    executionTime: events[0].eventTime,
    closeTime: events[7].eventTime,
    historyLength: String(
      id === workflowId ? events.length : childEvents.length,
    ),
  },
  pendingActivities: [],
  pendingChildren: [],
});

async function openActivity(page: Page) {
  await page
    .getByRole('button', { name: `Event ${activityName}: Completed` })
    .click();
  await expect(page.locator('.panel')).toHaveCount(1);
  await expect(page.locator('.panel')).toContainText(activityName);
  await expect(
    page.locator('.panel').getByRole('button', { name: 'Close', exact: true }),
  ).toBeVisible();
}

async function toggleFilter(page: Page, name: string) {
  await page.locator('button[aria-controls="status-menu"]').click();
  await page.locator('#event-type-menu').getByTestId(name).click();
  await page.keyboard.press('Escape');
}

test.describe('Workflow timeline local selection', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page, workflowFor(workflowId, runId));
    await page.route(WORKFLOW_API, (route) => {
      const url = new URL(route.request().url());
      const id = decodeURIComponent(url.pathname.split('/').at(-1) ?? '');
      return route.fulfill({
        json: workflowFor(id, url.searchParams.get('execution.runId') ?? runId),
      });
    });
    for (const api of [EVENT_HISTORY_API, EVENT_HISTORY_API_REVERSE]) {
      await page.route(api, (route) => {
        const url = new URL(route.request().url());
        const historyEvents = url.pathname.includes('/workflows/child-5/')
          ? childEvents
          : events;
        return route.fulfill({
          json: {
            history: {
              events: url.pathname.endsWith('history-reverse')
                ? [...historyEvents].reverse()
                : historyEvents,
            },
            nextPageToken: null,
          },
        });
      });
    }
    await page.goto(`${timelineUrl}?sort=ascending&refresh_off=true`);
    await page
      .getByRole('img', { name: `Workflow ${workflowId}: Completed` })
      .scrollIntoViewIfNeeded();
  });

  test('closes the selected panel on sort navigation without hiding the selected group', async ({
    page,
  }) => {
    await openActivity(page);
    await page.getByTestId('zoom-in').click();
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('sort') === null,
    );
    await expect(page.getByTestId('zoom-in')).toHaveText('Descending');
    await expect(page.locator('.panel')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: `Event ${activityName}: Completed` }),
    ).toBeVisible();
    await openActivity(page);
    await page
      .locator('.panel')
      .getByRole('button', { name: 'Close', exact: true })
      .click();
    await expect(page.locator('.panel')).toHaveCount(0);
  });

  test('closes the selected panel on category navigation and does not resurrect it when restored', async ({
    page,
  }) => {
    await openActivity(page);
    await toggleFilter(page, 'Activity');
    await expect(page).toHaveURL(/category=/);
    await expect(
      page.getByRole('button', { name: `Event ${activityName}: Completed` }),
    ).toHaveCount(0);
    await expect(page.locator('.panel')).toHaveCount(0);

    await toggleFilter(page, 'Activity');
    await expect(page).not.toHaveURL(/category=/);
    await expect(
      page.getByRole('button', { name: `Event ${activityName}: Completed` }),
    ).toBeVisible();
    await expect(page.locator('.panel')).toHaveCount(0);
    await openActivity(page);
  });

  test('discards a completed selection when the pending and failed filter removes its group', async ({
    page,
  }) => {
    await openActivity(page);
    await toggleFilter(page, 'Pending and Failed');
    await expect(
      page.getByRole('button', { name: `Event ${activityName}: Completed` }),
    ).toHaveCount(0);
    await expect(page.locator('.panel')).toHaveCount(0);

    await toggleFilter(page, 'All');
    await expect(
      page.getByRole('button', { name: `Event ${activityName}: Completed` }),
    ).toBeVisible();
    await expect(page.locator('.panel')).toHaveCount(0);
    await openActivity(page);
  });

  test('keeps parent selection independent of the child mini-timeline graph', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Event ChildWorkflow:/ }).click();
    const panel = page.locator('.panel');
    const childGraph = panel.locator(graphSelector);
    await expect(
      childGraph.getByRole('img', { name: 'Workflow child-5: Completed' }),
    ).toBeVisible();
    await expect(
      childGraph.getByRole('button', {
        name: `Event ${activityName}: Completed`,
      }),
    ).toBeDisabled();
    await expect(childGraph.locator('.panel')).toHaveCount(0);
    await expect(panel).toHaveCount(1);
    await expect(panel).toContainText('ChildWorkflow');

    await panel.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.locator('.panel')).toHaveCount(0);
    await expect(page.locator(graphSelector)).toHaveCount(1);
    await openActivity(page);
    await expect(page.locator('.panel').locator(graphSelector)).toHaveCount(0);
    await expect(page.locator('.panel')).not.toContainText('ChildWorkflow');
  });
});
