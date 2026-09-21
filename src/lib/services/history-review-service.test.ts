import { beforeEach, describe, expect, it, vi } from 'vitest';

import { groupEvents } from '$lib/models/event-groups';
import { toEventHistory } from '$lib/models/event-history';
import type { HistoryEvent } from '$lib/types/events';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import { isWorkflowTaskGroup } from './grouped-event-buffer';
import {
  buildHistoryReviewItems,
  HistoryReviewError,
  type HistoryReviewItem,
  reviewHistory,
  toHistoryReviewErrorMessage,
  toHistoryReviewRequests,
} from './history-review-service';
import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeLocalActivityMarker,
  makeNexusOperationScheduled,
  makeStartChildWorkflowInitiated,
  makeTimerFired,
  makeTimerStarted,
  makeWorkflowStarted,
  makeWorkflowTaskGroup,
  makeWorkflowUpdateAccepted,
} from './test-helpers/synthetic-events';

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

const SECRETS = [
  'SECRET-WORKFLOW-INPUT',
  'SECRET-ACTIVITY-INPUT',
  'SECRET-ACTIVITY-RESULT',
  'SECRET-FAILURE-MESSAGE',
  'SECRET-STACK-TRACE',
  'SECRET-HEADER',
  'SECRET-USER-SUMMARY',
  'SECRET-USER-DETAILS',
  'SECRET-MEMO-VALUE',
  'SECRET-SEARCH-ATTRIBUTE-VALUE',
  'SECRET-LOCAL-ACTIVITY-SUMMARY',
  'SECRET-MARKER-DETAILS',
  'SECRET-UPDATE-ARGS',
  'SECRET-SIGNAL-INPUT',
  'SECRET-CHILD-INPUT',
  'SECRET-NEXUS-INPUT',
];

const payload = (value: string) => ({
  metadata: { encoding: btoa('json/plain') },
  data: btoa(JSON.stringify(value)),
});

const withAttributes = (
  event: HistoryEvent,
  key: string,
  attributes: Record<string, unknown>,
): HistoryEvent => {
  const record = event as unknown as Record<string, Record<string, unknown>>;
  return {
    ...event,
    [key]: { ...record[key], ...attributes },
  } as unknown as HistoryEvent;
};

const makeActivityFailed = (
  eventId: number,
  scheduledEventId: number,
  startedEventId: number,
): HistoryEvent =>
  ({
    eventId: String(eventId),
    eventTime: '2024-01-01T00:00:00.000000000Z',
    eventType: 'ActivityTaskFailed',
    version: '0',
    taskId: String(eventId * 10),
    links: [],
    activityTaskFailedEventAttributes: {
      scheduledEventId: String(scheduledEventId),
      startedEventId: String(startedEventId),
      identity: 'worker@host',
      retryState: 'MaximumAttemptsReached',
      failure: {
        message: 'SECRET-FAILURE-MESSAGE',
        stackTrace: 'SECRET-STACK-TRACE',
        applicationFailureInfo: { type: 'CardDeclined' },
      },
    },
  }) as unknown as HistoryEvent;

const userMetadata = {
  summary: payload('SECRET-USER-SUMMARY'),
  details: payload('SECRET-USER-DETAILS'),
};

const makeSignaled = (eventId: number): HistoryEvent =>
  ({
    eventId: String(eventId),
    eventTime: '2024-01-01T00:00:00.000000000Z',
    eventType: 'WorkflowExecutionSignaled',
    version: '0',
    taskId: String(eventId * 10),
    links: [],
    workflowExecutionSignaledEventAttributes: {
      signalName: 'approve-order',
      input: { payloads: [payload('SECRET-SIGNAL-INPUT')] },
      identity: 'client@host',
    },
  }) as unknown as HistoryEvent;

const makeGenericMarker = (eventId: number): HistoryEvent =>
  ({
    eventId: String(eventId),
    eventTime: '2024-01-01T00:00:00.000000000Z',
    eventType: 'MarkerRecorded',
    version: '0',
    taskId: String(eventId * 10),
    links: [],
    markerRecordedEventAttributes: {
      markerName: 'Version',
      details: { data: { payloads: [payload('SECRET-MARKER-DETAILS')] } },
      workflowTaskCompletedEventId: String(eventId - 1),
    },
  }) as unknown as HistoryEvent;

const buildHistory = () => {
  const raw: HistoryEvent[] = [
    withAttributes(
      makeWorkflowStarted(1),
      'workflowExecutionStartedEventAttributes',
      {
        input: { payloads: [payload('SECRET-WORKFLOW-INPUT')] },
        header: { fields: { token: payload('SECRET-HEADER') } },
        memo: { fields: { note: payload('SECRET-MEMO-VALUE') } },
        searchAttributes: {
          indexedFields: {
            CustomerTier: payload('SECRET-SEARCH-ATTRIBUTE-VALUE'),
          },
        },
      },
    ),
    ...makeWorkflowTaskGroup(2),
    withAttributes(
      makeActivityScheduled(5, 'ChargeCard'),
      'activityTaskScheduledEventAttributes',
      { input: { payloads: [payload('SECRET-ACTIVITY-INPUT')] } },
    ),
    withAttributes(
      makeActivityStarted(6, 5),
      'activityTaskStartedEventAttributes',
      {
        attempt: 3,
        lastFailure: { message: 'SECRET-FAILURE-MESSAGE' },
      },
    ),
    makeActivityFailed(7, 5, 6),
    makeActivityScheduled(8, 'SendReceipt'),
    makeActivityStarted(9, 8),
    withAttributes(
      makeActivityCompleted(10, 8, 9),
      'activityTaskCompletedEventAttributes',
      { result: { payloads: [payload('SECRET-ACTIVITY-RESULT')] } },
    ),
    makeTimerStarted(11, 'payment-window'),
    makeTimerFired(12, 11),
    {
      ...withAttributes(
        makeLocalActivityMarker(13),
        'markerRecordedEventAttributes',
        {
          details: {
            data: {
              payloads: [
                {
                  metadata: { encoding: btoa('json/plain') },
                  data: btoa(
                    JSON.stringify({
                      ActivityType: 'SECRET-LOCAL-ACTIVITY-SUMMARY',
                    }),
                  ),
                },
              ],
            },
            result: { payloads: [payload('SECRET-LOCAL-ACTIVITY-SUMMARY')] },
          },
        },
      ),
      userMetadata,
    } as unknown as HistoryEvent,
    makeGenericMarker(14),
    withAttributes(
      makeWorkflowUpdateAccepted(15),
      'workflowExecutionUpdateAcceptedEventAttributes',
      {
        acceptedRequest: {
          input: {
            name: 'set-address',
            args: { payloads: [payload('SECRET-UPDATE-ARGS')] },
          },
        },
      },
    ),
    makeSignaled(16),
    {
      ...withAttributes(
        makeStartChildWorkflowInitiated(17),
        'startChildWorkflowExecutionInitiatedEventAttributes',
        { input: { payloads: [payload('SECRET-CHILD-INPUT')] } },
      ),
      userMetadata,
    } as unknown as HistoryEvent,
    withAttributes(
      makeNexusOperationScheduled(18),
      'nexusOperationScheduledEventAttributes',
      { input: payload('SECRET-NEXUS-INPUT') },
    ),
  ];

  const events = toEventHistory(raw);
  const groups = groupEvents(events, 'ascending').filter(
    (group) => !isWorkflowTaskGroup(group),
  );
  return { events, groups };
};

const item = (id: number): HistoryReviewItem => ({
  id: String(id),
  kind: 'event',
  category: 'workflow',
  name: 'WorkflowTaskScheduled',
  classification: 'Scheduled',
  eventCount: 1,
  attempt: 0,
  pending: false,
});

describe('buildHistoryReviewItems', () => {
  it('builds one item per group and one per event outside a group', () => {
    const items = buildHistoryReviewItems(buildHistory());
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));

    expect(items.map((i) => Number(i.id))).toEqual(
      [...items.map((i) => Number(i.id))].sort((a, b) => a - b),
    );
    expect(byId['5']).toEqual({
      id: '5',
      kind: 'group',
      category: 'activity',
      name: 'ChargeCard',
      classification: 'Failed',
      eventCount: 3,
      attempt: 3,
      pending: false,
    });
    expect(byId['8']).toMatchObject({
      kind: 'group',
      name: 'SendReceipt',
      classification: 'Completed',
      eventCount: 3,
    });
    expect(byId['11']).toMatchObject({
      kind: 'group',
      category: 'timer',
      name: 'payment-window',
      classification: 'Fired',
    });
    expect(byId['2']).toMatchObject({
      kind: 'event',
      name: 'WorkflowTaskScheduled',
      eventCount: 1,
    });
    expect(byId['6']).toBeUndefined();
    expect(byId['7']).toBeUndefined();
  });

  it('never includes payload contents or failure messages', () => {
    const history = buildHistory();
    expect(JSON.stringify(history.events)).toContain('SECRET-FAILURE-MESSAGE');

    const source = JSON.stringify(history.events);
    for (const secret of SECRETS) {
      const encoded = btoa(JSON.stringify(secret));
      expect(
        source.includes(secret) ||
          source.includes(encoded) ||
          secret === 'SECRET-LOCAL-ACTIVITY-SUMMARY',
      ).toBe(true);
    }

    const widerArgument = {
      namespace: 'default',
      workflowType: 'OrderWorkflow',
      workflowStatus: 'Failed',
      items: buildHistoryReviewItems(history).map((item) => ({
        ...item,
        summary: 'SECRET-USER-SUMMARY',
      })),
      memo: { note: 'SECRET-MEMO-VALUE' },
      searchAttributes: { CustomerTier: 'SECRET-SEARCH-ATTRIBUTE-VALUE' },
      summary: 'SECRET-USER-SUMMARY',
    };
    const [request] = toHistoryReviewRequests(widerArgument);
    const body = JSON.stringify(request);

    for (const secret of SECRETS) {
      expect(body).not.toContain(secret);
      expect(body).not.toContain(btoa(JSON.stringify(secret)));
      expect(body).not.toContain(btoa(secret));
    }
    expect(body).not.toContain('SECRET');
    expect(Object.keys(request).sort()).toEqual([
      'items',
      'namespace',
      'workflowStatus',
      'workflowType',
    ]);
    const names = request.items.map((i) => i.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'Local Activity',
        'Version',
        'set-address',
        'approve-order',
        'ChildWorkflow',
        'service.operation',
      ]),
    );
    expect(Object.keys(request.items[0]).sort()).toEqual(
      [
        'attempt',
        'category',
        'classification',
        'eventCount',
        'id',
        'kind',
        'name',
        'pending',
      ].sort(),
    );
  });

  it('limits a name to 200 characters', () => {
    const events = toEventHistory([makeActivityScheduled(1, 'a'.repeat(300))]);
    const groups = groupEvents(events, 'ascending');

    expect(buildHistoryReviewItems({ events, groups })[0].name).toHaveLength(
      200,
    );
  });
});

describe('reviewHistory', () => {
  const options = {
    namespace: 'default',
    workflowType: 'OrderWorkflow',
    workflowStatus: 'Failed',
  };

  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
  });

  it('posts the contract request to the history-review route', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      scores: { '1': { score: 1, confidence: 1, pinned: true } },
      model: 'jev-1.13.0',
    });

    const response = await reviewHistory({ ...options, items: [item(1)] });

    expect(response).toEqual({
      scores: { '1': { score: 1, confidence: 1, pinned: true } },
      model: 'jev-1.13.0',
    });
    const [route, init] = vi.mocked(requestFromAPI).mock.calls[0];
    expect(route).toMatch(/\/api\/v1\/history-review$/);
    expect(init?.options?.method).toBe('POST');
    expect(init?.notifyOnError).toBe(false);
    expect(JSON.parse(String(init?.options?.body))).toEqual({
      ...options,
      items: [item(1)],
    });
  });

  it('sends sequential calls of at most 1000 items and merges scores', async () => {
    const items = Array.from({ length: 2300 }, (_, i) => item(i + 1));
    let inFlight = 0;
    let maxInFlight = 0;
    vi.mocked(requestFromAPI).mockImplementation(async (_route, init) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      const body = JSON.parse(String(init?.options?.body));
      inFlight--;
      return {
        scores: Object.fromEntries(
          body.items.map((i: HistoryReviewItem) => [
            i.id,
            { score: 0.1, confidence: 0.9, pinned: false },
          ]),
        ),
        model: 'jev',
      };
    });

    const { scores } = await reviewHistory({ ...options, items });

    const sizes = vi
      .mocked(requestFromAPI)
      .mock.calls.map(
        ([, init]) => JSON.parse(String(init?.options?.body)).items.length,
      );
    expect(sizes).toEqual([1000, 1000, 300]);
    expect(maxInFlight).toBe(1);
    expect(Object.keys(scores)).toHaveLength(2300);
  });

  it('sends only the contract fields when the caller passes a wider object', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({ scores: {} });

    await reviewHistory({
      ...options,
      items: [item(1)],
      memo: { note: 'SECRET-MEMO-VALUE' },
      searchAttributes: { CustomerTier: 'SECRET-SEARCH-ATTRIBUTE-VALUE' },
    } as Parameters<typeof reviewHistory>[0]);

    const [, init] = vi.mocked(requestFromAPI).mock.calls[0];
    const body = String(init?.options?.body);
    expect(Object.keys(JSON.parse(body)).sort()).toEqual([
      'items',
      'namespace',
      'workflowStatus',
      'workflowType',
    ]);
    expect(body).not.toContain('SECRET');
  });

  it('pins the first and the last row of the whole history only', async () => {
    const items = Array.from({ length: 2300 }, (_, i) => item(i + 1));
    vi.mocked(requestFromAPI).mockImplementation(async (_route, init) => {
      const body = JSON.parse(String(init?.options?.body));
      return {
        scores: Object.fromEntries(
          body.items.map((i: HistoryReviewItem) => [
            i.id,
            { score: 0.1, confidence: 0.9, pinned: false },
          ]),
        ),
      };
    });

    const { scores } = await reviewHistory({ ...options, items });

    expect(scores['1']).toEqual({ score: 0.1, confidence: 0.9, pinned: true });
    expect(scores['2300'].pinned).toBe(true);
    for (const id of ['2', '999', '1000', '1001', '2000', '2001', '2299']) {
      expect(scores[id].pinned).toBe(false);
    }
  });

  it('pins the first and the last row when the server returns no score for them', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      scores: { '2': { score: 0.1, confidence: 0.9, pinned: false } },
    });

    const { scores } = await reviewHistory({
      ...options,
      items: [item(1), item(2), item(3)],
    });

    expect(scores['1'].pinned).toBe(true);
    expect(scores['3'].pinned).toBe(true);
    expect(scores['2'].pinned).toBe(false);
  });

  it('ignores a malformed score', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      scores: { '1': { score: 'high' }, '2': { score: 0.2 } },
    });

    const { scores } = await reviewHistory({
      ...options,
      items: [item(1), item(2)],
    });

    expect(scores).toEqual({
      '1': { score: 1, confidence: 1, pinned: true },
      '2': { score: 0.2, confidence: 0, pinned: true },
    });
  });

  it('makes no call for an empty history', async () => {
    await expect(reviewHistory({ ...options, items: [] })).resolves.toEqual({
      scores: {},
      model: '',
    });
    expect(requestFromAPI).not.toHaveBeenCalled();
  });

  it('throws the shared typed error with status specific messages', async () => {
    const rejectWith = (
      statusCode: number,
      message: string,
      headers: Record<string, string> = {},
    ) => {
      vi.mocked(requestFromAPI).mockRejectedValue({
        statusCode,
        message,
        response: new Response(null, { status: statusCode, headers }),
      });
      return reviewHistory({ ...options, items: [item(1)] }).catch(
        (e: unknown) => e,
      );
    };

    const limited = await rejectWith(429, '', { 'Retry-After': '7' });
    expect(limited).toBeInstanceOf(HistoryReviewError);
    expect(toHistoryReviewErrorMessage(limited)).toBe(
      'Too many reviews. Try again in 7 seconds.',
    );
    expect(toHistoryReviewErrorMessage(await rejectWith(429, ''))).toBe(
      'Too many reviews. Try again in a moment.',
    );
    expect(toHistoryReviewErrorMessage(await rejectWith(403, 'denied'))).toBe(
      'You do not have permission to review this namespace.',
    );
    expect(toHistoryReviewErrorMessage(await rejectWith(401, 'denied'))).toBe(
      'You do not have permission to review this namespace.',
    );
    expect(
      toHistoryReviewErrorMessage(await rejectWith(502, 'model unavailable')),
    ).toBe('model unavailable');
    expect(toHistoryReviewErrorMessage(await rejectWith(504, ''))).toBe(
      'Could not complete this review. Try again.',
    );
  });
});
