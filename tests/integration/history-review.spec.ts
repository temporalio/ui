import { expect, type Page, test } from '@playwright/test';

import completedEvents from '~/fixtures/completed-event-history.json' with { type: 'json' };
import { mockSettingsApi, mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const historyUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=ascending`;
const HISTORY_REVIEW_API = '**/api/v1/history-review**';

// Events 1-11: started, workflow task (2-4), activity (5-7), workflow task
// (8-10), completed. The two workflow tasks are the routine runs.
const events = Object.values(completedEvents);
const history = {
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
};
const workflow = {
  ...mockWorkflow,
  pendingActivities: [],
  pendingChildren: [],
};

const low = { score: 0.1, confidence: 0.9, pinned: false };
const high = { score: 0.8, confidence: 0.9, pinned: false };
const pinned = { score: 1, confidence: 1, pinned: true };
const scores = {
  '1': pinned,
  '2': low,
  '3': low,
  '4': low,
  '5': high,
  '8': low,
  '9': low,
  '10': low,
  '11': pinned,
};

// The integration app calls the API on another origin, so a mocked POST with a
// JSON body needs the preflight and the CORS headers a real ui-server sends.
const mockHistoryReviewApi = async (
  page: Page,
  respond: (body: string) => {
    status?: number;
    headers?: Record<string, string>;
    json: unknown;
  },
) => {
  await page.route(HISTORY_REVIEW_API, async (route) => {
    const request = route.request();
    const corsHeaders = {
      'access-control-allow-origin':
        (await request.headerValue('origin')) ?? '*',
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers':
        (await request.headerValue('access-control-request-headers')) ?? '*',
      'access-control-expose-headers': 'Retry-After',
    };

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const {
      status = 200,
      headers = {},
      json,
    } = respond(request.postData() ?? '');
    await route.fulfill({
      status,
      headers: { ...corsHeaders, ...headers },
      json,
    });
  });
};

const mockHistory = async (page: Page, historyReviewEnabled: boolean) => {
  await mockWorkflowApis(page, workflow);
  await mockSettingsApi(page, { HistoryReviewEnabled: historyReviewEnabled });
  await page.route(EVENT_HISTORY_API, (route) =>
    route.fulfill({ json: history }),
  );
  await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
    route.fulfill({
      json: { ...history, history: { events: [...events].reverse() } },
    }),
  );
};

test.describe('History review', () => {
  test('is not shown when the setting is off', async ({ page }) => {
    await mockHistory(page, false);
    await page.goto(historyUrl);

    await expect(page.getByTestId('event-summary-row').first()).toBeVisible();
    await expect(page.getByTestId('history-review-button')).toHaveCount(0);
  });

  test('reviews, collapses runs, toggles one run, shows all, and clears', async ({
    page,
  }) => {
    await mockHistory(page, true);

    let requestBody = '';
    await mockHistoryReviewApi(page, (body) => {
      requestBody = body;
      return { json: { scores, model: 'jev-test' } };
    });

    await page.goto(historyUrl);

    const rows = page.getByTestId('event-summary-row');
    const hiddenRuns = page.getByTestId('hidden-run-row');
    const reviewButton = page.getByTestId('history-review-button');
    const status = page.getByTestId('history-review-status');

    await expect(rows).toHaveCount(11);
    await expect(reviewButton).toBeEnabled();
    await expect(reviewButton).toContainText('Review with Jev');

    await reviewButton.click();

    await expect(reviewButton).toContainText('Review again');
    await expect(hiddenRuns).toHaveCount(2);
    await expect(rows).toHaveCount(5);
    await expect(status).toContainText(
      '6 of 11 rows are routine. 5 stay visible.',
    );

    const body = JSON.parse(requestBody);
    expect(body.namespace).toBe('default');
    expect(body.items.length).toBeGreaterThan(0);
    expect(requestBody).not.toContain('payloads');
    expect(requestBody).not.toContain('"input"');
    expect(requestBody).not.toContain('"result"');
    expect(requestBody).not.toContain('ImhleSI=');

    const firstRun = hiddenRuns.first().getByRole('button');
    await expect(firstRun).toHaveAttribute('aria-expanded', 'false');
    await expect(firstRun).toContainText(
      '3 routine events hidden · events 2–4',
    );

    await firstRun.focus();
    await page.keyboard.press('Enter');
    await expect(firstRun).toHaveAttribute('aria-expanded', 'true');
    await expect(firstRun).toContainText('3 routine events shown');
    await expect(rows).toHaveCount(8);
    await expect(hiddenRuns).toHaveCount(2);

    await firstRun.click();
    await expect(firstRun).toHaveAttribute('aria-expanded', 'false');
    await expect(rows).toHaveCount(5);

    await page.getByTestId('history-review-show-all').click();
    await expect(hiddenRuns).toHaveCount(0);
    await expect(rows).toHaveCount(11);
    await expect(page.locator('[data-routine="true"]')).toHaveCount(6);

    await page.getByTestId('history-review-show-all').click();
    await expect(hiddenRuns).toHaveCount(2);

    await page.getByTestId('history-review-clear').click();
    await expect(hiddenRuns).toHaveCount(0);
    await expect(rows).toHaveCount(11);
    await expect(reviewButton).toContainText('Review with Jev');
    await expect(page.getByTestId('history-review-clear')).toHaveCount(0);
  });

  test('shows an inline error and keeps the history usable', async ({
    page,
  }) => {
    await mockHistory(page, true);
    await mockHistoryReviewApi(page, () => ({
      status: 429,
      headers: { 'Retry-After': '12' },
      json: { message: 'rate limit exceeded' },
    }));

    await page.goto(historyUrl);
    await page.getByTestId('history-review-button').click();

    await expect(page.getByTestId('history-review-status')).toContainText(
      'Too many reviews. Try again in 12 seconds.',
    );
    await expect(page.getByTestId('event-summary-row')).toHaveCount(11);
    await expect(page.getByTestId('hidden-run-row')).toHaveCount(0);
  });

  test.describe('timeline', () => {
    const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline?sort=ascending`;

    // Started + first workflow task, then five activities cloned from the
    // fixture activity. The workflow stays running with no pending work, so
    // the time from the last event to now is a collapsible idle gap.
    const [scheduled, started, completed] = events.slice(4, 7);
    const activity = (firstId: number) => [
      {
        ...scheduled,
        eventId: String(firstId),
        activityTaskScheduledEventAttributes: {
          ...scheduled.activityTaskScheduledEventAttributes,
          activityId: String(firstId),
        },
      },
      {
        ...started,
        eventId: String(firstId + 1),
        activityTaskStartedEventAttributes: {
          ...started.activityTaskStartedEventAttributes,
          scheduledEventId: String(firstId),
        },
      },
      {
        ...completed,
        eventId: String(firstId + 2),
        activityTaskCompletedEventAttributes: {
          ...completed.activityTaskCompletedEventAttributes,
          scheduledEventId: String(firstId),
          startedEventId: String(firstId + 1),
        },
      },
    ];
    const timelineEvents = [
      ...events.slice(0, 4),
      ...[5, 8, 11, 14, 17].flatMap(activity),
    ];
    const timelineHistory = {
      ...history,
      history: { events: timelineEvents },
    };
    const timelineScores = {
      '1': pinned,
      '5': high,
      '8': low,
      '11': low,
      '14': low,
      '17': pinned,
    };

    const mockTimeline = async (page: Page) => {
      await mockWorkflowApis(page, workflow);
      await mockSettingsApi(page, { HistoryReviewEnabled: true });
      await page.route(EVENT_HISTORY_API, (route) =>
        route.fulfill({ json: timelineHistory }),
      );
      await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
        route.fulfill({
          json: {
            ...timelineHistory,
            history: { events: [...timelineEvents].reverse() },
          },
        }),
      );
    };

    test('reviews, collapses group rows, toggles a run, shows all, and clears, with idle-time collapse on', async ({
      page,
    }) => {
      await mockTimeline(page);
      let reviewCalls = 0;
      await mockHistoryReviewApi(page, () => {
        reviewCalls++;
        return { json: { scores: timelineScores, model: 'jev-test' } };
      });

      await page.goto(timelineUrl);

      const idleToggle = page.getByTestId('toggle-idle-time');
      const hiddenRuns = page.getByTestId('timeline-hidden-run-row');
      const routineRows = page.locator('[data-routine="true"]');
      const graph = page.locator('#event-history-timeline-graph');
      const reviewButton = page.getByTestId('history-review-button');

      await expect(idleToggle).toBeEnabled();
      await expect(idleToggle).toContainText('Show idle time');
      await expect(reviewButton).toBeEnabled();
      const fullHeight = (await graph.boundingBox())?.height ?? 0;

      await reviewButton.click();

      await expect(hiddenRuns).toHaveCount(1);
      await expect(page.getByTestId('history-review-status')).toContainText(
        '3 of',
      );
      const runButton = hiddenRuns.getByRole('button');
      await expect(runButton).toHaveAttribute('aria-expanded', 'false');
      await expect(runButton).toContainText('3 routine events hidden');
      await expect(page.getByTestId('timeline-hidden-run-marker')).toHaveCount(
        1,
      );
      await expect
        .poll(async () => (await graph.boundingBox())?.height ?? 0)
        .toBeLessThan(fullHeight);

      // Time collapse and row collapse are independent.
      await expect(idleToggle).toContainText('Show idle time');
      await idleToggle.click();
      await expect(idleToggle).toContainText('Hide idle time');
      await expect(hiddenRuns).toHaveCount(1);
      await idleToggle.click();
      await expect(idleToggle).toContainText('Show idle time');
      await expect(hiddenRuns).toHaveCount(1);

      await runButton.focus();
      await page.keyboard.press('Enter');
      await expect(runButton).toHaveAttribute('aria-expanded', 'true');
      await expect(routineRows).toHaveCount(3);
      await expect(hiddenRuns).toHaveCount(1);

      await runButton.click();
      await expect(runButton).toHaveAttribute('aria-expanded', 'false');
      await expect(routineRows).toHaveCount(0);

      await page.getByTestId('history-review-show-all').click();
      await expect(hiddenRuns).toHaveCount(0);
      await expect(routineRows).toHaveCount(3);
      await page.getByTestId('history-review-show-all').click();
      await expect(hiddenRuns).toHaveCount(1);

      // One review, two views: the history tab reuses the scores.
      await page.getByTestId('history-tab').click();
      await expect(page.getByTestId('hidden-run-row')).not.toHaveCount(0);
      await expect(page.getByTestId('history-review-button')).toContainText(
        'Review again',
      );
      expect(reviewCalls).toBe(1);

      await page.getByTestId('timeline-tab').click();
      await expect(hiddenRuns).toHaveCount(1);

      await page.getByTestId('history-review-clear').click();
      await expect(hiddenRuns).toHaveCount(0);
      await expect(routineRows).toHaveCount(0);
      await expect(reviewButton).toContainText('Review with Jev');
    });
  });
});
