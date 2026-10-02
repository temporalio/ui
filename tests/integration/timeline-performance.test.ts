import { type CDPSession, expect, type Route, test } from '@playwright/test';

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
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const GROUP_COUNT = Number(process.env.TIMELINE_STRESS_GROUPS ?? 10_000);
const FIXTURE_SEED = 0x5eed_2026;
const PAGE_SIZE = 1_000;
const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

const withTime = (event: HistoryEvent, milliseconds: number): HistoryEvent => ({
  ...event,
  eventTime: new Date(Date.UTC(2024, 0, 1) + milliseconds).toISOString(),
});

const buildHistory = (): HistoryEvent[] => {
  const started = withTime(makeWorkflowStarted(1), 0);
  const startAttributes = started.workflowExecutionStartedEventAttributes;
  if (startAttributes) {
    startAttributes.firstExecutionRunId = runId;
    startAttributes.originalExecutionRunId = runId;
  }
  const events = [started];
  for (let index = 0; index < GROUP_COUNT; index += 1) {
    const scheduledId = index * 3 + 2;
    const startedId = scheduledId + 1;
    const completedId = scheduledId + 2;
    const baseTime = index * 10;
    events.push(
      withTime(
        makeActivityScheduled(
          scheduledId,
          `stress-${FIXTURE_SEED}-${index}-activity-with-a-deliberately-long-label`,
        ),
        baseTime + 1,
      ),
      withTime(makeActivityStarted(startedId, scheduledId), baseTime + 2),
      withTime(
        makeActivityCompleted(completedId, scheduledId, startedId),
        baseTime + 9,
      ),
    );
  }
  events.push(
    withTime(makeWorkflowCompleted(events.length + 1), GROUP_COUNT * 10 + 1),
  );
  return events;
};

const heapUsed = async (session: CDPSession): Promise<number> => {
  await session.send('HeapProfiler.collectGarbage');
  const response = (await session.send('Performance.getMetrics')) as {
    metrics: { name: string; value: number }[];
  };
  return (
    response.metrics.find(({ name }) => name === 'JSHeapUsedSize')?.value ?? 0
  );
};

test.describe('Timeline performance gates', () => {
  test('keeps browser work, DOM, requests, and cleanup bounded', async ({
    page,
  }, testInfo) => {
    test.slow();
    test.setTimeout(180_000);
    const events = buildHistory();
    const closedWorkflow = {
      ...mockWorkflow,
      workflowExecutionInfo: {
        ...mockWorkflow.workflowExecutionInfo,
        closeTime: events.at(-1)?.eventTime,
        executionTime: events[0]?.eventTime,
        historyLength: String(events.length),
        historySizeBytes: String(events.length * 256),
        startTime: events[0]?.eventTime,
        status: 'Completed',
      },
      pendingActivities: [],
      pendingChildren: [],
    };
    await mockWorkflowApis(page, closedWorkflow);
    const reversedEvents = [...events].reverse();
    const fulfillHistoryPage = (
      route: Route,
      orderedEvents: HistoryEvent[],
    ) => {
      const url = new URL(route.request().url());
      const offset = Number(url.searchParams.get('nextPageToken') ?? 0);
      const nextOffset = offset + PAGE_SIZE;
      return route.fulfill({
        json: {
          history: { events: orderedEvents.slice(offset, nextOffset) },
          rawHistory: [],
          nextPageToken:
            nextOffset < orderedEvents.length ? String(nextOffset) : null,
          archived: false,
        },
      });
    };
    await page.route(EVENT_HISTORY_API, (route) =>
      fulfillHistoryPage(route, events),
    );
    await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
      fulfillHistoryPage(route, reversedEvents),
    );

    await page.addInitScript(() => {
      const measurements: { duration: number; startTime: number }[] = [];
      Object.defineProperty(window, '__timelineLongTasks', {
        configurable: true,
        value: measurements,
      });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          measurements.push({
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }).observe({ entryTypes: ['longtask'] });
    });

    let requestCount = 0;
    let activeRequests = 0;
    let peakRequests = 0;
    const relevantRequest = (url: string) => url.includes('/api/v1/');
    page.on('request', (request) => {
      if (!relevantRequest(request.url())) return;
      requestCount += 1;
      activeRequests += 1;
      peakRequests = Math.max(peakRequests, activeRequests);
    });
    const finishRequest = (url: string) => {
      if (relevantRequest(url))
        activeRequests = Math.max(0, activeRequests - 1);
    };
    page.on('requestfinished', (request) => finishRequest(request.url()));
    page.on('requestfailed', (request) => finishRequest(request.url()));

    const session = await page.context().newCDPSession(page);
    await session.send('Performance.enable');
    await session.send('HeapProfiler.enable');
    await page.goto('/namespaces/default/workflows');
    await expect(
      page.getByRole('heading', { name: 'Workflows' }),
    ).toBeVisible();
    const baselineHeapBytes = await heapUsed(session);
    requestCount = 0;
    activeRequests = 0;
    peakRequests = 0;
    const navigationStartedAt = performance.now();
    await page.goto(timelineUrl);
    await page.getByRole('button', { name: 'Full duration' }).click();
    const timeline = page.getByRole('region', { name: 'Timeline' });
    await expect(timeline).toBeVisible();
    await expect(
      timeline.locator('[data-timeline-entry-key]').first(),
    ).toBeVisible();
    const firstUsableMs = performance.now() - navigationStartedAt;
    const usableAt = await page.evaluate(() => performance.now());

    const interactionMs = await page.evaluate(async () => {
      const startedAt = performance.now();
      window.scrollBy({ top: 500, behavior: 'instant' });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      return performance.now() - startedAt;
    });
    await page.getByRole('button', { name: 'Unified' }).click();
    const resizeHandle = page.getByTestId('timeline-window-resize-end');
    const resizeBox = await resizeHandle.boundingBox();
    expect(resizeBox).not.toBeNull();
    const dragMeasurement = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          window.addEventListener(
            'pointermove',
            (event) => {
              requestAnimationFrame(() =>
                requestAnimationFrame(() =>
                  resolve(performance.now() - event.timeStamp),
                ),
              );
            },
            { once: true },
          );
        }),
    );
    await page.mouse.move(
      (resizeBox?.x ?? 0) + (resizeBox?.width ?? 0) / 2,
      (resizeBox?.y ?? 0) + (resizeBox?.height ?? 0) / 2,
    );
    await page.mouse.down();
    await page.mouse.move((resizeBox?.x ?? 0) - 20, resizeBox?.y ?? 0);
    await page.mouse.up();
    const dragInteractionMs = await dragMeasurement;
    const loadedHeapBytes = await heapUsed(session);
    const mountedRows = await timeline
      .locator('[data-timeline-entry-key]')
      .count();
    const continuationMarks = await page
      .getByTestId('timeline-continuation-bins')
      .count();
    const longestTimelineTaskMs = await page.evaluate((startTime) => {
      const tasks = (
        window as typeof window & {
          __timelineLongTasks: { duration: number; startTime: number }[];
        }
      ).__timelineLongTasks;
      return tasks
        .filter((task) => task.startTime >= startTime)
        .reduce((maximum, task) => Math.max(maximum, task.duration), 0);
    }, usableAt);

    await page.goto('/namespaces/default/workflows');
    await expect(
      page.getByRole('heading', { name: 'Workflows' }),
    ).toBeVisible();
    const cleanupHeapBytes = await heapUsed(session);
    const metrics = {
      nodeFixtureSeed: FIXTURE_SEED,
      groups: GROUP_COUNT,
      events: events.length,
      firstUsableMs,
      longestTimelineTaskMs,
      interactionMs,
      dragInteractionMs,
      baselineHeapBytes,
      loadedHeapBytes,
      cleanupHeapBytes,
      retainedAfterCleanupBytes: cleanupHeapBytes - baselineHeapBytes,
      mountedRows,
      continuationMarks,
      requestCount,
      peakRequests,
    };
    await testInfo.attach('timeline-performance.json', {
      body: Buffer.from(`${JSON.stringify(metrics, null, 2)}\n`),
      contentType: 'application/json',
    });

    expect(mountedRows).toBeLessThanOrEqual(100);
    expect(continuationMarks).toBeLessThanOrEqual(1);
    expect(peakRequests).toBeLessThanOrEqual(8);
    expect(longestTimelineTaskMs).toBeLessThan(50);
    expect(interactionMs).toBeLessThan(100);
    expect(dragInteractionMs).toBeLessThan(100);
    expect(cleanupHeapBytes - baselineHeapBytes).toBeLessThan(10 * 1024 * 1024);
  });
});
