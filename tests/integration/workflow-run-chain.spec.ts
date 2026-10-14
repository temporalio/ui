import { expect, test } from '@playwright/test';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeChildWorkflowCompleted,
  makeChildWorkflowStarted,
  makeLocalActivityMarker,
  makeNexusOperationCompleted,
  makeNexusOperationScheduled,
  makeNexusOperationStarted,
  makeStartChildWorkflowInitiated,
  makeTimerFired,
  makeTimerStarted,
  makeWorkflowStarted,
  makeWorkflowUpdateAccepted,
  makeWorkflowUpdateCompleted,
} from '$src/lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$src/lib/types/events';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow, WORKFLOW_API } from '~/test-utilities/mocks/workflow';

// Exercise real Svelte derivations with live retry metadata: the shared workflow
// formatter mutates its input, so passing reactive pending activities used to
// throw state_unsafe_mutation when the chain Timeline mounted.
test('chain shows ten runs, navigates to the first, and follows rollover without mutating live state', async ({
  page,
}) => {
  test.setTimeout(60_000);
  let latest = 25;
  const fullPageRequests: number[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const workflowId = 'chain-navigation';
  const runId = (index: number) => `chain-run-${index}`;
  const longName =
    'ProcessAnOrderWithAnIntentionallyVeryLongActivityTypeNameThatMustNotWrap';
  const history = (index: number): HistoryEvent[] => {
    const first = makeWorkflowStarted(1);
    first.workflowExecutionStartedEventAttributes!.continuedExecutionRunId =
      index > 1 ? runId(index - 1) : '';
    const events = [first, makeActivityScheduled(2, longName)];
    if (index < latest)
      events.push(makeActivityStarted(3, 2), makeActivityCompleted(4, 2, 3));
    for (let timer = 0; timer < 35; timer++) {
      const id = events.length + 1;
      events.push(
        makeTimerStarted(id, `wait-${timer}`),
        makeTimerFired(id + 1, id),
      );
    }
    if (index >= 25) {
      const id = events.length + 1;
      events.push(
        makeStartChildWorkflowInitiated(id),
        makeChildWorkflowStarted(id + 1, id),
        makeChildWorkflowCompleted(id + 2, id, id + 1),
        makeLocalActivityMarker(id + 3),
        makeNexusOperationScheduled(id + 4),
        makeNexusOperationStarted(id + 5, id + 4),
        makeNexusOperationCompleted(id + 6, id + 4),
        makeWorkflowUpdateAccepted(id + 7),
        makeWorkflowUpdateCompleted(id + 8, id + 7),
        {
          eventId: String(id + 9),
          eventType: 'WorkflowExecutionSignaled',
          workflowExecutionSignaledEventAttributes: { signalName: 'ready' },
        } as unknown as HistoryEvent,
        {
          eventId: String(id + 10),
          eventType: 'MarkerRecorded',
          markerRecordedEventAttributes: { markerName: 'Version' },
        } as unknown as HistoryEvent,
      );
    }
    if (index < latest)
      events.push({
        eventId: String(events.length + 1),
        eventType: 'WorkflowExecutionContinuedAsNew',
        workflowExecutionContinuedAsNewEventAttributes: {
          newExecutionRunId: runId(index + 1),
        },
      } as unknown as HistoryEvent);
    return events.map((event, offset) => ({
      ...event,
      eventTime: new Date(
        Date.now() - (latest - index + 1) * 30_000 + offset * 100,
      ).toISOString(),
    }));
  };
  await mockWorkflowApis(page, mockWorkflow);
  await page.route(WORKFLOW_API, (route) => {
    const index =
      Number(
        new URL(route.request().url()).searchParams
          .get('execution.runId')
          ?.split('-')
          .at(-1),
      ) || latest;
    const events = history(index);
    return route.fulfill({
      json: {
        ...mockWorkflow,
        workflowExecutionInfo: {
          ...mockWorkflow.workflowExecutionInfo,
          execution: { workflowId, runId: runId(index) },
          startTime: events[0].eventTime,
          executionTime: events[0].eventTime,
          closeTime: index < latest ? events.at(-1)!.eventTime : '',
          status: index < latest ? 'ContinuedAsNew' : 'Running',
          historyLength: String(events.length),
        },
        pendingActivities:
          index === latest
            ? [
                {
                  activityId: '2',
                  activityType: { name: longName },
                  state: 'PENDING_ACTIVITY_STATE_SCHEDULED',
                  attempt: 3,
                  maximumAttempts: 10,
                  lastFailure: {
                    message: 'Transient failure',
                    source: 'TypeScriptSDK',
                    applicationFailureInfo: {
                      type: 'TransientError',
                      nonRetryable: false,
                    },
                  },
                  scheduledTime: events[1].eventTime,
                },
              ]
            : [],
        pendingChildren: [],
        pendingNexusOperations: [],
      },
    });
  });
  for (const matcher of [EVENT_HISTORY_API, EVENT_HISTORY_API_REVERSE])
    await page.route(matcher, (route) => {
      const url = new URL(route.request().url());
      const index =
        Number(url.searchParams.get('execution.runId')?.split('-').at(-1)) ||
        latest;
      if (url.searchParams.get('maximumPageSize') === '1000')
        fullPageRequests.push(index);
      let events = history(index);
      if (url.pathname.includes('reverse')) events = events.reverse();
      if (url.searchParams.get('maximumPageSize') === '1')
        events = events.slice(0, 1);
      if (url.searchParams.get('waitNewEvent') === 'true') events = [];
      return route.fulfill({
        json: { history: { events }, nextPageToken: '' },
      });
    });
  await page.goto(
    `/namespaces/default/workflows/${workflowId}/chain?run=${runId(25)}`,
  );
  const header = page.getByTestId('chain-focused-run');
  const runRows = page.getByTestId('chain-overview').getByRole('button');
  await expect(runRows).toHaveCount(10);
  const overview = page.getByTestId('chain-overview');
  await expect(overview).toHaveCSS('overflow-x', 'auto');
  expect(
    await overview.evaluate(
      (element) => element.scrollHeight === element.clientHeight,
    ),
  ).toBe(true);
  await expect(runRows.last().locator('.flow-layer')).toHaveCount(8);
  expect(fullPageRequests[0]).toBe(25);
  expect(fullPageRequests.filter((index) => index < 25)).toEqual([
    24, 23, 22, 21, 20, 19, 18, 17, 16,
  ]);
  await expect(header).toHaveAttribute('data-run-id', runId(25));
  await expect(header).toContainText(runId(25));
  await expect(header.getByTestId('execution-status')).toBeVisible();
  await expect(header.locator('input')).toHaveCount(0);
  await expect(page.locator('#event-history-timeline-graph')).toBeVisible();
  const detail = page.getByTestId('chain-detail');
  await expect(detail).toHaveCSS('overflow-y', 'visible');
  await expect(detail).toHaveCSS('max-height', 'none');
  expect(
    await detail.evaluate(
      (element) => element.clientHeight >= element.scrollHeight,
    ),
  ).toBe(true);
  const pageScroller = page.locator('#content-wrapper');
  await pageScroller.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(
    await pageScroller.evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0);
  expect(
    await page.getByTestId('run-chain-view').evaluate((element) => {
      const graph = element.querySelector('#event-history-timeline-graph')!;
      const bottom = graph.getBoundingClientRect().bottom;
      return (
        bottom <= element.getBoundingClientRect().bottom &&
        bottom <=
          document.getElementById('content-wrapper')!.getBoundingClientRect()
            .bottom
      );
    }),
  ).toBe(true);
  await expect(
    page.getByRole('button', { name: /^Event wait-34 / }),
  ).toBeInViewport();
  await pageScroller.evaluate((element) => {
    element.scrollTop = 0;
  });
  const rows = page.getByTestId('chain-comparison-row');
  await expect(rows).toHaveCount(10);
  expect(
    await rows.evaluateAll((elements) =>
      elements.every(
        (element) => element.getBoundingClientRect().height === 102,
      ),
    ),
  ).toBe(true);

  // Route navigation focuses the main landmark; arrow navigation should
  // transfer focus to the run instead of outlining the entire page.
  await page.locator('#content').focus();
  for (let index = 24; index >= 1; index--) {
    await page.keyboard.press('ArrowLeft');
    await expect(header).toHaveAttribute('data-run-id', runId(index));
    await expect(runRows).toHaveCount(10);
    await expect(
      page.getByTestId('chain-overview').locator('[aria-pressed="true"]'),
    ).toBeFocused();
    expect(
      await overview.evaluate((element) => {
        const selected = element
          .querySelector('[aria-pressed="true"]')!
          .getBoundingClientRect();
        const bounds = element.getBoundingClientRect();
        return selected.left >= bounds.left && selected.right <= bounds.right;
      }),
    ).toBe(true);
  }
  await expect(
    page.getByRole('button', { name: 'Previous run', exact: true }),
  ).toBeDisabled();
  await expect(runRows.first()).toHaveAttribute('data-run-id', runId(1));
  await page.keyboard.press('ArrowRight');
  await expect(header).toHaveAttribute('data-run-id', runId(2));
  await page
    .getByRole('button', { name: 'Follow latest', exact: true })
    .click();
  await expect(header).toHaveAttribute('data-run-id', runId(25));
  const graph = page.locator('#event-history-timeline-graph');
  await graph
    .getByRole('button', { name: new RegExp(`^Event ${longName}:`) })
    .click();
  await expect(
    graph.getByRole('button', { name: 'Close', exact: true }),
  ).toBeVisible();
  await expect(
    graph.getByText('Transient failure', { exact: false }).first(),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/chain\?run=chain-run-25/);
  await graph.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(
    graph.getByRole('button', { name: 'Close', exact: true }),
  ).toHaveCount(0);
  latest = 26;
  await expect(header).toHaveAttribute('data-run-id', runId(26));
  await expect(runRows.last()).toHaveAttribute('data-run-id', runId(26));
  await expect(runRows).toHaveCount(10);
  await graph
    .getByRole('button', { name: new RegExp(`^Event ${longName}:`) })
    .click();
  await expect(
    graph.getByRole('button', { name: 'Close', exact: true }),
  ).toBeVisible();
  // Details links must use the selected successor, not the anchor in the URL.
  await expect(
    graph.getByRole('link', { name: '2', exact: true }),
  ).toHaveAttribute('href', /chain-run-26/);
  await expect(page).toHaveURL(/\/chain\?run=chain-run-25/);
  expect(errors).toEqual([]);
});
