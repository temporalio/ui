import { test as base, expect } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowCompleted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import {
  mockEventHistoryApi,
  mockWorkflowApis,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const secondRunId = '61797bf4-0d48-43d6-94aa-1921f7893200';
const runUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;
const secondRunUrl = `/namespaces/default/workflows/${workflowId}/${secondRunId}`;

const atSecond = (event: HistoryEvent, second: number): HistoryEvent => ({
  ...event,
  eventTime: `2024-01-01T00:00:${String(second).padStart(2, '0')}.000000000Z`,
});

const historyFor = (activityName: string): HistoryEvent[] => [
  makeWorkflowStarted(1),
  atSecond(makeActivityScheduled(2, activityName), 10),
  atSecond(makeActivityStarted(3, 2), 15),
  atSecond(makeActivityCompleted(4, 2, 3), 30),
  atSecond(makeWorkflowCompleted(5), 40),
];

const events = historyFor('SmokeFirstRunActivity');
const workflowFor = (id: string): WorkflowExecutionAPIResponse => ({
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    execution: { workflowId, runId: id },
    status: 'Completed',
    startTime: events[0].eventTime,
    executionTime: events[0].eventTime,
    closeTime: events[4].eventTime,
    historyLength: String(events.length),
  },
  pendingActivities: [],
  pendingChildren: [],
});

const test = base.extend<{ pageErrors: Error[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: Error[] = [];
      page.on('pageerror', (error) => errors.push(error));
      await use(errors);
      expect(errors.map((error) => error.message)).toEqual([]);
    },
    { auto: true },
  ],
});

test.describe('Workflow run detail smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('autoRefreshWorkflow', JSON.stringify('off'));
      localStorage.setItem('eventView', JSON.stringify('feed'));
      localStorage.setItem('eventFilterSort', JSON.stringify('descending'));
    });
    await mockWorkflowApis(page, workflowFor(runId));
    await mockEventHistoryApi(page, {
      history: { events },
      nextPageToken: null,
    });
  });

  test('navigates timeline, feed, compact, JSON, and event detail back to history', async ({
    page,
  }) => {
    await page.goto(`${runUrl}/timeline`);
    await page
      .getByRole('img', { name: `Workflow ${workflowId}: Completed` })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('img', { name: `Workflow ${workflowId}: Completed` }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Event SmokeFirstRunActivity: Completed',
      }),
    ).toBeVisible();

    await page.getByTestId('history-tab').click();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(5);
    await page.getByTestId('compact').click();
    await expect(page.getByTestId('event-summary-table')).toContainText(
      'SmokeFirstRunActivity',
    );
    await page.getByTestId('json').click();
    await expect(page.getByTestId('event-history-json')).toContainText(
      'WorkflowExecutionStarted',
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('event-history-json')).toContainText(
      'SmokeFirstRunActivity',
    );
    await expect(page.getByTestId('event-summary-table')).toBeHidden();
    await page.getByTestId('feed').click();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(5);

    await page
      .getByTestId('event-summary-row')
      .filter({ has: page.getByRole('link', { name: '2', exact: true }) })
      .getByRole('link', { name: '2', exact: true })
      .click();
    await expect(page).toHaveURL(`${runUrl}/history/events/2`);
    await expect(page.getByTestId('event-summary-log')).toContainText(
      'SmokeFirstRunActivity',
    );
    await expect(page.getByTestId('event-summary-row-expanded')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(`${runUrl}/history`);
    await expect(page.getByTestId('event-summary-row')).toHaveCount(5);
  });

  test('preserves category and sort filters across timeline and history views', async ({
    page,
  }) => {
    await page.goto(`${runUrl}/history?sort=ascending`);
    await expect(page.getByTestId('event-summary-row')).toHaveCount(5);
    await page.locator('button[aria-controls="status-menu"]').click();
    await page.locator('#event-type-menu').getByTestId('Activity').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('event-summary-row')).toHaveCount(2);
    await expect(page.getByTestId('event-summary-table')).not.toContainText(
      'SmokeFirstRunActivity',
    );
    const filteredQuery = new URL(page.url()).search;
    expect(new URL(page.url()).searchParams.get('sort')).toBe('ascending');
    expect(new URL(page.url()).searchParams.has('category')).toBe(true);

    await page.getByTestId('timeline-tab').click();
    await expect(page).toHaveURL(`${runUrl}/timeline${filteredQuery}`);
    await page
      .getByRole('img', { name: `Workflow ${workflowId}: Completed` })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('img', { name: `Workflow ${workflowId}: Completed` }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Event SmokeFirstRunActivity:/ }),
    ).toBeHidden();
    await page.getByTestId('history-tab').click();
    await expect(page).toHaveURL(`${runUrl}/history${filteredQuery}`);
    await expect(page.getByTestId('event-summary-row')).toHaveCount(2);
    await expect(page.getByTestId('event-summary-row').first()).toContainText(
      'Workflow Execution Started',
    );
    await page.getByTestId('compact').click();
    await expect(page.getByTestId('event-summary-table')).toContainText(
      'No Events Match',
    );
    await page.getByTestId('json').click();
    await expect(page.getByTestId('event-history-json')).toContainText(
      'WorkflowExecutionStarted',
    );
    await expect(page.getByRole('slider')).toHaveAttribute('max', '2');
    await page.getByTestId('feed').click();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(2);
  });

  test('waits for the workflow start before showing an elapsed-time baseline', async ({
    page,
  }) => {
    let releaseAscending = () => {};
    const ascendingHeld = new Promise<void>((resolve) => {
      releaseAscending = resolve;
    });
    await page.route(EVENT_HISTORY_API, async (route) => {
      await ascendingHeld;
      await route.fulfill({
        json: { history: { events }, nextPageToken: null },
      });
    });
    let reversePages = 0;
    await page.route(EVENT_HISTORY_API_REVERSE, async (route) => {
      reversePages += 1;
      if (reversePages === 1) {
        await route.fulfill({
          json: {
            history: { events: events.slice(1).reverse() },
            nextPageToken: 'workflow-start',
          },
        });
        return;
      }
      await ascendingHeld;
      await route.fulfill({
        json: { history: { events: [events[0]] }, nextPageToken: null },
      });
    });

    try {
      await page.goto(`${runUrl}/history`);
      const scheduled = page
        .getByTestId('event-summary-row')
        .filter({ has: page.getByRole('link', { name: '2', exact: true }) });
      await expect(scheduled).toBeVisible();
      await expect(page.getByTestId('event-summary-row')).toHaveCount(4);
      await scheduled
        .getByRole('cell')
        .filter({ visible: true })
        .nth(1)
        .hover();
      await expect(
        scheduled.getByRole('tooltip', { name: /^\+/ }),
      ).toBeHidden();

      releaseAscending();
      await expect(page.getByTestId('event-summary-row')).toHaveCount(5);
      await scheduled
        .getByRole('cell')
        .filter({ visible: true })
        .nth(1)
        .hover();
      await expect(
        scheduled.getByRole('tooltip', { name: '+10s', exact: true }),
      ).toBeVisible();
    } finally {
      releaseAscending();
    }
  });

  test('switches runs through an execution link and browser Back without leaking history', async ({
    page,
  }) => {
    const firstStarted = makeWorkflowStarted(1);
    const linkedEvents = [
      {
        ...firstStarted,
        workflowExecutionStartedEventAttributes: {
          ...firstStarted.workflowExecutionStartedEventAttributes,
          continuedExecutionRunId: secondRunId,
        },
      },
      ...events.slice(1),
    ];
    const secondEvents = historyFor('SmokeSecondRunActivity');
    await page.route(WORKFLOW_API, (route) => {
      const requestedRun = new URL(route.request().url()).searchParams.get(
        'execution.runId',
      );
      return route.fulfill({
        json: workflowFor(requestedRun === secondRunId ? secondRunId : runId),
      });
    });
    for (const api of [EVENT_HISTORY_API, EVENT_HISTORY_API_REVERSE]) {
      await page.route(api, (route) => {
        const url = new URL(route.request().url());
        const runEvents =
          url.searchParams.get('execution.runId') === secondRunId
            ? secondEvents
            : linkedEvents;
        return route.fulfill({
          json: {
            history: {
              events: url.pathname.endsWith('history-reverse')
                ? [...runEvents].reverse()
                : runEvents,
            },
            nextPageToken: null,
          },
        });
      });
    }

    await page.goto(`${runUrl}/history/events/1`);
    await expect(page.getByTestId('event-summary-log')).toBeVisible();
    const documentRequests: string[] = [];
    page.on('request', (request) => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documentRequests.push(request.url());
      }
    });
    const documentTimeOrigin = await page.evaluate(
      () => performance.timeOrigin,
    );
    await page.getByRole('link', { name: secondRunId, exact: true }).click();
    await expect(page).toHaveURL(`${secondRunUrl}/timeline`);
    await page.getByTestId('history-tab').click();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(5);
    await expect(page.getByTestId('event-summary-table')).toContainText(
      'SmokeSecondRunActivity',
    );
    await expect(page.getByTestId('event-summary-table')).not.toContainText(
      'SmokeFirstRunActivity',
    );

    await page.goBack();
    await expect(page).toHaveURL(`${secondRunUrl}/timeline`);
    await page.goBack();
    await expect(page).toHaveURL(`${runUrl}/history/events/1`);
    await page.getByTestId('history-tab').click();
    await expect(page.getByTestId('event-summary-row')).toHaveCount(5);
    await expect(page.getByTestId('event-summary-table')).toContainText(
      'SmokeFirstRunActivity',
    );
    await expect(page.getByTestId('event-summary-table')).not.toContainText(
      'SmokeSecondRunActivity',
    );
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(
      documentTimeOrigin,
    );
    expect(documentRequests).toEqual([]);
  });
});
