import { expect, type Page, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowCompleted,
  makeWorkflowStarted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow, WORKFLOW_API } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;
const initialEvents: HistoryEvent[] = [
  makeWorkflowStarted(1),
  makeActivityScheduled(2, 'RefreshActivity'),
  makeActivityStarted(3, 2),
];
const activityCompletion = makeActivityCompleted(4, 2, 3);
const workflowCompletion = makeWorkflowCompleted(5);

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

async function mockRunDetail(page: Page, liveEvents: HistoryEvent[]) {
  const runningWorkflow = {
    ...mockWorkflow,
    workflowExecutionInfo: {
      ...mockWorkflow.workflowExecutionInfo,
      status: 'Running',
      closeTime: '',
      historyLength: String(initialEvents.length),
    },
    pendingActivities: [],
    pendingChildren: [],
  };
  const requests = { describe: 0, initial: 0, reverse: 0, live: 0 };
  const state = { completed: false };
  const liveRequested = gate();
  const liveResponse = gate();

  await mockWorkflowApis(page, runningWorkflow);
  await page.route(WORKFLOW_API, (route) => {
    requests.describe += 1;
    return route.fulfill({
      json: state.completed
        ? {
            ...runningWorkflow,
            workflowExecutionInfo: {
              ...runningWorkflow.workflowExecutionInfo,
              status: 'Completed',
              closeTime: '2024-01-01T00:00:01Z',
              historyLength: '5',
            },
          }
        : runningWorkflow,
    });
  });
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
    return route.fulfill({ json: historyPage(initialEvents) });
  });
  await page.route(EVENT_HISTORY_API_REVERSE, (route) => {
    requests.reverse += 1;
    return route.fulfill({ json: historyPage([...initialEvents].reverse()) });
  });

  return { requests, state, liveRequested, liveResponse };
}

async function openHistory(page: Page, refreshOff: boolean) {
  await page.clock.install();
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await page.goto(`${historyUrl}?refresh_off=${refreshOff}&sort=ascending`);
  await expect(page.getByTestId('event-summary-table')).toBeVisible();
  await page.getByTestId('feed').click();
  await expect(page.getByTestId('event-summary-row')).toHaveCount(3);
  await expect(page.locator('[data-eventid="2"]')).toContainText(
    'RefreshActivity',
  );
  await expect(page.getByTestId('execution-status')).toHaveText('Running');
}

test.describe('Workflow run detail refresh', () => {
  test('loads initial history with refresh off without live history or ambient Describe polls', async ({
    page,
  }) => {
    const { requests, liveResponse } = await mockRunDetail(page, []);
    try {
      await openHistory(page, true);
      await expect(page.getByTestId('pause')).toHaveText('Auto Refresh Off');
      expect(requests.initial).toBeGreaterThan(0);
      expect(requests.reverse).toBeGreaterThan(0);
      expect(requests.describe).toBe(1);
      expect(requests.live).toBe(0);

      const before = { ...requests };
      await page.clock.runFor(30_000);

      expect(requests).toEqual(before);
      await expect(page.getByTestId('event-summary-row')).toHaveCount(3);
    } finally {
      liveResponse.release();
    }
  });

  test('receives a live completion after enabling refresh and stops requests when disabled again', async ({
    page,
  }) => {
    const { requests, liveRequested, liveResponse } = await mockRunDetail(
      page,
      [activityCompletion],
    );
    try {
      await openHistory(page, true);
      await page.getByTestId('pause').click();
      await expect(page.getByTestId('pause')).toHaveText('Auto Refresh On');
      await expect(page).not.toHaveURL(/refresh_off=true/);
      await liveRequested.promise;
      await expect(page.locator('[data-eventid="4"]')).toHaveCount(0);

      liveResponse.release();
      await expect(page.locator('[data-eventid="4"]')).toBeVisible();
      await expect(page.getByTestId('event-summary-row')).toHaveCount(4);
      await page.clock.runFor(10_000);
      await expect.poll(() => requests.describe).toBeGreaterThan(1);

      await page.getByTestId('pause').click();
      await expect(page.getByTestId('pause')).toHaveText('Auto Refresh Off');
      await expect(page).toHaveURL(/refresh_off=true/);
      const before = { ...requests };
      await page.clock.runFor(30_000);

      expect(requests).toEqual(before);
      await expect(page.locator('[data-eventid="4"]')).toBeVisible();
    } finally {
      liveResponse.release();
    }
  });

  test('keeps the final history tail when Describe completes before the held terminal history response', async ({
    page,
  }) => {
    const { requests, state, liveRequested, liveResponse } =
      await mockRunDetail(page, [activityCompletion, workflowCompletion]);
    try {
      await openHistory(page, false);
      await liveRequested.promise;
      await expect(page.locator('[data-eventid="5"]')).toHaveCount(0);
      state.completed = true;

      await page.clock.runFor(10_000);
      await expect(page.getByTestId('execution-status')).toHaveText(
        'Completed',
      );
      await expect(page.locator('[data-eventid="4"]')).toHaveCount(0);
      await expect(page.locator('[data-eventid="5"]')).toHaveCount(0);

      liveResponse.release();
      await expect(page.locator('[data-eventid="4"]')).toBeVisible();
      await expect(page.locator('[data-eventid="5"]')).toBeVisible();
      await expect(page.getByTestId('event-summary-row')).toHaveCount(5);

      const before = { ...requests };
      await page.clock.runFor(30_000);
      expect(requests).toEqual(before);
      await expect(page.locator('[data-eventid="5"]')).toBeVisible();
    } finally {
      liveResponse.release();
    }
  });
});
