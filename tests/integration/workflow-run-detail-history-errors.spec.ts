import { expect, type Route, test } from '@playwright/test';

import {
  makeActivityGroup,
  makeTimerGroup,
  makeWorkflowCompleted,
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
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=ascending`;
const events: HistoryEvent[] = [
  makeWorkflowStarted(1),
  ...makeActivityGroup(2, 'HistoryRecoveryActivity'),
  ...makeTimerGroup(5),
  ...makeTimerGroup(7),
  makeWorkflowCompleted(9),
];
const pageSize = 2;
const completedWorkflow: WorkflowExecutionAPIResponse = {
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    status: 'Completed',
    startTime: events[0].eventTime,
    executionTime: events[0].eventTime,
    closeTime: events[8].eventTime,
    historyLength: String(events.length),
  },
  pendingActivities: [],
  pendingChildren: [],
};

function fulfillHistoryPage(route: Route, descending: boolean) {
  const offset = Number(
    new URL(route.request().url()).searchParams.get('next_page_token') ?? 0,
  );
  const orderedEvents = descending ? [...events].reverse() : events;
  const nextOffset = offset + pageSize;
  return route.fulfill({
    json: {
      history: { events: orderedEvents.slice(offset, nextOffset) },
      nextPageToken: nextOffset < events.length ? String(nextOffset) : null,
    },
  });
}

function failHistoryPage(route: Route) {
  return route.fulfill({
    status: 503,
    json: { code: 14, message: 'History temporarily unavailable' },
  });
}

test.describe('Workflow run detail history loading errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('autoRefreshWorkflow', JSON.stringify('off'));
      localStorage.setItem('eventView', JSON.stringify('feed'));
      localStorage.setItem('eventFilterSort', JSON.stringify('ascending'));
    });
    await mockWorkflowApis(page, completedWorkflow);
  });

  test('loads every event through the healthy paginated direction when the other direction returns HTTP 503', async ({
    page,
  }) => {
    const ascendingTokens: (string | null)[] = [];
    let descendingFailures = 0;
    await page.route(EVENT_HISTORY_API_REVERSE, (route) => {
      descendingFailures += 1;
      return failHistoryPage(route);
    });
    await page.route(EVENT_HISTORY_API, (route) => {
      ascendingTokens.push(
        new URL(route.request().url()).searchParams.get('next_page_token'),
      );
      return fulfillHistoryPage(route, false);
    });

    await page.goto(historyUrl);

    await expect(page.getByTestId('workflow-id-heading')).toContainText(
      workflowId,
    );
    await expect(page.getByTestId('execution-status')).toContainText(
      'Completed',
    );
    await expect(
      page.getByTestId('event-summary-row').getByTestId('link'),
    ).toHaveText(events.map((event) => event.eventId));
    await expect(page.getByTestId('history-load-error')).toBeHidden();
    await expect(
      page.getByTestId('event-summary-table').getByRole('table'),
    ).not.toHaveAttribute('aria-busy', 'true');
    expect(descendingFailures).toBe(1);
    expect(ascendingTokens).toEqual([null, '2', '4', '6', '8']);
  });

  test('retains partial history after both directions return HTTP 503 and while retrying, then loads the remaining events', async ({
    page,
  }) => {
    let retrying = false;
    let releaseRetry = () => {};
    const retryHeld = new Promise<void>((resolve) => {
      releaseRetry = resolve;
    });
    const failedDirections = new Set<string>();
    const retryDirections = new Set<string>();
    for (const { api, descending, direction } of [
      { api: EVENT_HISTORY_API, descending: false, direction: 'ascending' },
      {
        api: EVENT_HISTORY_API_REVERSE,
        descending: true,
        direction: 'descending',
      },
    ]) {
      await page.route(api, async (route) => {
        if (retrying) {
          retryDirections.add(direction);
          await retryHeld;
          return fulfillHistoryPage(route, descending);
        }
        if (
          new URL(route.request().url()).searchParams.has('next_page_token')
        ) {
          failedDirections.add(direction);
          return failHistoryPage(route);
        }
        return fulfillHistoryPage(route, descending);
      });
    }

    try {
      await page.goto(historyUrl);

      const heading = page.getByTestId('workflow-id-heading');
      const table = page.getByTestId('event-summary-table');
      const rowIds = page.getByTestId('event-summary-row').getByTestId('link');
      const alert = page.getByTestId('history-load-error');
      const retry = page.getByRole('button', {
        name: 'Retry history loading',
        exact: true,
      });
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(
        'Unable to load the full event history.',
      );
      await expect(alert).toContainText(
        'Loaded events are still available. Retry to load the remaining history.',
      );
      await expect(heading).toContainText(workflowId);
      await expect(page.getByTestId('execution-status')).toContainText(
        'Completed',
      );
      await expect(page.getByTestId('history-tab')).toBeVisible();
      await expect(table).toBeVisible();
      await expect(rowIds).toHaveText(['1', '2', '8', '9']);
      await expect(table.getByRole('table')).not.toHaveAttribute(
        'aria-busy',
        'true',
      );
      await expect(retry).toBeVisible();
      await expect(retry).toBeEnabled();
      expect([...failedDirections].sort()).toEqual(['ascending', 'descending']);

      retrying = true;
      await retry.click();

      await expect.poll(() => retryDirections.size).toBe(2);
      await expect(table.getByRole('table')).toHaveAttribute(
        'aria-busy',
        'true',
      );
      await expect(heading).toContainText(workflowId);
      await expect(rowIds).toHaveText(['1', '2', '8', '9']);

      releaseRetry();

      await expect(rowIds).toHaveText(events.map((event) => event.eventId));
      await expect(alert).toBeHidden();
      await expect(retry).toBeHidden();
      await expect(page.getByTestId('execution-status')).toContainText(
        'Completed',
      );
      await expect(table.getByRole('table')).not.toHaveAttribute(
        'aria-busy',
        'true',
      );
    } finally {
      releaseRetry();
    }
  });
});
