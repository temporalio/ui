import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const eventUrl = (eventId: string) =>
  `/namespaces/default/workflows/${workflowId}/${runId}/history/events/${eventId}`;

const runningWorkflow = {
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    status: 'Running',
    closeTime: '',
  },
  pendingActivities: [],
  pendingChildren: [],
};

const historyPage = (events: HistoryEvent[]) => ({
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
});

function gate() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function mockEventDetail(
  page: Page,
  initialEvents: HistoryEvent[],
  liveEvents: HistoryEvent[] = [],
  workflow: WorkflowExecutionAPIResponse = runningWorkflow,
  reverseEvents = [...initialEvents].reverse(),
) {
  const initialResponse = gate();
  const liveResponse = gate();
  const liveRequested = gate();
  const requests = { initial: 0, reverse: 0, live: 0, navigation: 0 };

  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) requests.navigation += 1;
  });
  await mockWorkflowApis(page, workflow);
  await page.route(EVENT_HISTORY_API, async (route) => {
    if (
      new URL(route.request().url()).searchParams.get('waitNewEvent') === 'true'
    ) {
      requests.live += 1;
      if (requests.live === 1) {
        liveRequested.release();
        await liveResponse.promise;
        return route.fulfill({ json: historyPage(liveEvents) });
      }
      return route.fulfill({ json: historyPage([]) });
    }
    requests.initial += 1;
    await initialResponse.promise;
    return route.fulfill({ json: historyPage(initialEvents) });
  });
  await page.route(EVENT_HISTORY_API_REVERSE, async (route) => {
    requests.reverse += 1;
    if (reverseEvents.length < initialEvents.length) {
      if (requests.reverse === 1) {
        return route.fulfill({
          json: {
            ...historyPage(reverseEvents),
            nextPageToken: 'older-events',
          },
        });
      }
      await initialResponse.promise;
      return route.fulfill({
        json: historyPage([...initialEvents].reverse()),
      });
    }
    return route.fulfill({ json: historyPage(reverseEvents) });
  });

  return { initialResponse, liveResponse, liveRequested, requests };
}

function visibleIds(page: Page) {
  return page
    .getByTestId('event-summary-log')
    .getByTestId('event-summary-row')
    .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-eventid')));
}

test.describe('Workflow event detail live history', () => {
  for (const requestId of ['request-for-started-activity', '123-request-id']) {
    test(`resolves ${requestId} and paginates from its event`, async ({
      page,
    }) => {
      const events = [
        makeWorkflowStarted(1),
        makeActivityScheduled(2, 'RequestIdActivity'),
        makeActivityStarted(3, 2),
        makeActivityScheduled(4),
        makeActivityScheduled(5),
      ];
      const { initialResponse, liveResponse } = await mockEventDetail(
        page,
        events,
        [],
        {
          ...runningWorkflow,
          workflowExtendedInfo: {
            requestIdInfos: { [requestId]: { eventId: '3' } },
          },
        },
      );
      try {
        initialResponse.release();
        await page.goto(eventUrl(requestId));

        await expect.poll(() => visibleIds(page)).toEqual(['3']);
        const details = page.getByTestId('event-summary-row-expanded');
        await expect(details).toHaveCount(1);
        await expect(
          details.getByText('Activity Task Scheduled', { exact: true }),
        ).toBeVisible();
        await expect(
          details.getByText('Activity Task Started', { exact: true }),
        ).toBeVisible();
        await expect(details).toContainText('RequestIdActivity');
        await page.getByTestId('load-previous').click();
        await expect.poll(() => visibleIds(page)).toEqual(['1', '2', '3']);
        await expect(page.getByTestId('load-previous')).toBeDisabled();
        await page.getByTestId('load-next').click();
        await expect
          .poll(() => visibleIds(page))
          .toEqual(['1', '2', '3', '4', '5']);
        await expect(page.getByTestId('load-next')).toBeDisabled();
        await expect(page).toHaveURL(eventUrl(requestId));
      } finally {
        initialResponse.release();
        liveResponse.release();
      }
    });
  }

  test('shows ordered ten-ID ranges with gaps and enables Next when the live tail grows', async ({
    page,
  }) => {
    const ids = [1, 2, 5, 10, 11, 13, 19, 20, 21, 24, 29, 30, 31];
    const events = ids.map((id) =>
      id === 1 ? makeWorkflowStarted(id) : makeActivityScheduled(id),
    );
    const { initialResponse, liveResponse, liveRequested, requests } =
      await mockEventDetail(page, events, [makeActivityScheduled(35)]);
    try {
      initialResponse.release();
      await page.goto(eventUrl('11'));
      await expect.poll(() => visibleIds(page)).toEqual(['11']);
      await liveRequested.promise;
      await expect.poll(() => requests.initial).toBe(1);
      await expect.poll(() => requests.reverse).toBe(1);
      const before = { ...requests };

      await page.getByTestId('load-previous').click();
      await expect
        .poll(() => visibleIds(page))
        .toEqual(['1', '2', '5', '10', '11']);
      await expect(page.getByTestId('load-previous')).toBeDisabled();

      await page.getByTestId('load-next').click();
      await expect
        .poll(() => visibleIds(page))
        .toEqual(['1', '2', '5', '10', '11', '13', '19', '20', '21']);
      await page.getByTestId('load-next').click();
      await expect.poll(() => visibleIds(page)).toEqual(ids.map(String));
      await expect(page.getByTestId('load-next')).toBeDisabled();

      liveResponse.release();
      await expect(page.getByTestId('load-next')).toBeEnabled();
      await page.getByTestId('load-next').click();
      await expect
        .poll(() => visibleIds(page))
        .toEqual([...ids, 35].map(String));
      await expect(page.getByTestId('load-next')).toBeDisabled();
      expect(requests.initial).toBe(before.initial);
      expect(requests.reverse).toBe(before.reverse);
      expect(requests.navigation).toBe(before.navigation);
      await expect(page).toHaveURL(eventUrl('11'));
    } finally {
      initialResponse.release();
      liveResponse.release();
    }
  });

  test('keeps a follower expanded while its head and live completion join the group', async ({
    page,
  }) => {
    const started = makeActivityStarted(3, 2);
    const events = [
      makeWorkflowStarted(1),
      makeActivityScheduled(2, 'LiveDetailActivity'),
      started,
    ];
    const { initialResponse, liveResponse, liveRequested, requests } =
      await mockEventDetail(
        page,
        events,
        [makeActivityCompleted(4, 2, 3)],
        runningWorkflow,
        [started],
      );
    try {
      await page.goto(eventUrl('3'));
      const details = page.getByTestId('event-summary-row-expanded');
      await expect.poll(() => visibleIds(page)).toEqual(['3']);
      await expect(
        details.getByText('Activity Task Started', { exact: true }),
      ).toBeVisible();
      await expect(
        details.getByText('Activity Task Scheduled', { exact: true }),
      ).toHaveCount(0);
      await liveRequested.promise;
      await expect.poll(() => requests.initial).toBe(1);
      await expect.poll(() => requests.reverse).toBe(2);
      const before = { ...requests };

      initialResponse.release();
      await expect(details).toContainText('LiveDetailActivity');
      await expect(
        details.getByText('Activity Task Scheduled', { exact: true }),
      ).toBeVisible();
      await expect(
        details.getByText('Activity Task Completed', { exact: true }),
      ).toHaveCount(0);

      liveResponse.release();
      await expect(
        details.getByText('Activity Task Completed', { exact: true }),
      ).toBeVisible();
      await expect(
        details.getByText('Activity Task Started', { exact: true }),
      ).toBeVisible();
      await expect(
        details.getByText('Activity Task Scheduled', { exact: true }),
      ).toBeVisible();
      await expect(details).toHaveCount(1);
      await expect.poll(() => visibleIds(page)).toEqual(['3']);
      await expect(
        page.locator('[data-eventid="3"]').getByRole('button', {
          name: /collapse/i,
        }),
      ).toHaveAttribute('aria-expanded', 'true');
      expect(requests.initial).toBe(before.initial);
      expect(requests.reverse).toBe(before.reverse);
      expect(requests.navigation).toBe(before.navigation);
      await expect(page).toHaveURL(eventUrl('3'));
    } finally {
      initialResponse.release();
      liveResponse.release();
    }
  });
});
