import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  makeWorkflowCompleted,
  makeWorkflowStarted,
  makeWorkflowTaskScheduled,
} from './test-helpers/synthetic-events';
import { WorkflowHistoryController } from './workflow-history-controller.svelte.js';

vi.mock('$lib/utilities/handle-error', () => ({
  handleUnauthorizedOrForbiddenError: vi.fn(),
}));

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

type HistoryRequest = {
  direction: 'ascending' | 'descending';
  token: string | undefined;
  params: Record<string, string>;
  eventIds: number[];
};

type RequestOptions = {
  token?: string;
  params: Record<string, string>;
  options: { signal: AbortSignal };
};

const PAGE_SIZE = 1000;

let lastEventId = 0;
let closeEventId = 0;
let waiters: (() => void)[] = [];
const requests: HistoryRequest[] = [];
const controllers: WorkflowHistoryController[] = [];

function makeEvent(id: number): HistoryEvent {
  if (id === 1) {
    return makeWorkflowStarted(id);
  }
  if (id === closeEventId) {
    return makeWorkflowCompleted(id);
  }
  return makeWorkflowTaskScheduled(id);
}

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}

function appendEvents(count: number, { close = false } = {}) {
  lastEventId += count;
  if (close) {
    closeEventId = lastEventId;
  }
  for (const wake of waiters.splice(0)) wake();
}

function waitForEvents(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), {
      once: true,
    });
    waiters.push(resolve);
  });
}

async function serveAscending(
  { token, params, options }: RequestOptions,
  record: HistoryRequest,
) {
  const longPoll = params.waitNewEvent === 'true';
  const pageSize = Number(params.maximumPageSize) || PAGE_SIZE;
  const first = token ? Number(token) : 1;
  if (longPoll && first > lastEventId && !closeEventId) {
    await waitForEvents(options.signal);
  }
  const last = Math.min(first + pageSize - 1, lastEventId);
  record.eventIds = range(first, last);
  const more = last < lastEventId || (longPoll && !closeEventId);
  return {
    history: { events: record.eventIds.map(makeEvent) },
    nextPageToken: more ? String(last + 1) : '',
  };
}

function serveDescending({ token, params }: RequestOptions) {
  const pageSize = Number(params.maximumPageSize) || PAGE_SIZE;
  const first = token ? Number(token) : lastEventId;
  const last = Math.max(first - pageSize + 1, 1);
  const eventIds = range(last, first).reverse();
  return {
    eventIds,
    response: {
      history: { events: eventIds.map(makeEvent) },
      nextPageToken: last > 1 ? String(last - 1) : '',
    },
  };
}

function workflow(isRunning: boolean): WorkflowExecution {
  return {
    id: 'workflow-1',
    runId: 'run-1',
    isRunning,
    historyEvents: String(lastEventId),
    pendingActivities: [],
    pendingNexusOperations: [],
  } as unknown as WorkflowExecution;
}

function createController(
  options: Partial<
    ConstructorParameters<typeof WorkflowHistoryController>[0]
  > = {},
) {
  const controller = new WorkflowHistoryController({
    workflowExecutionIdentity: {
      namespace: 'default',
      workflowId: 'workflow-1',
      runId: 'run-1',
    },
    ...options,
  });
  controllers.push(controller);
  return controller;
}

function ascending() {
  return requests.filter(({ direction }) => direction === 'ascending');
}

function descending() {
  return requests.filter(({ direction }) => direction === 'descending');
}

function fetchedEventCount() {
  return requests.reduce((total, { eventIds }) => total + eventIds.length, 0);
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

function waitingLongPoll() {
  return vi.waitFor(() => expect(waiters).toHaveLength(1));
}

beforeEach(() => {
  lastEventId = 0;
  closeEventId = 0;
  waiters = [];
  requests.length = 0;
  vi.mocked(requestFromAPI).mockImplementation(async (route, init) => {
    const options = init as RequestOptions;
    const direction = String(route).endsWith('/history-reverse')
      ? 'descending'
      : 'ascending';
    const record: HistoryRequest = {
      direction,
      token: options.token,
      params: options.params,
      eventIds: [],
    };
    requests.push(record);
    if (direction === 'ascending') {
      return serveAscending(options, record);
    }
    const { eventIds, response } = serveDescending(options);
    record.eventIds = eventIds;
    return response;
  });
});

afterEach(() => {
  for (const controller of controllers.splice(0)) controller.dispose();
  vi.mocked(requestFromAPI).mockReset();
});

describe('WorkflowHistoryController request sequence', () => {
  describe('open Run', () => {
    it('reads history with a long-polling ascending cursor and a single descending page', async () => {
      appendEvents(2500);
      const controller = createController();

      await controller.load(workflow(true));

      expect(controller.fetchComplete).toBe(true);
      expect(descending()).toHaveLength(1);
      expect(descending()[0].token).toBeUndefined();
      expect(descending()[0].params.maximumPageSize).toBe('1000');
      expect(ascending()[0].token).toBeUndefined();
      for (const request of ascending()) {
        expect(request.params).toMatchObject({
          waitNewEvent: 'true',
          maximumPageSize: '1000',
        });
      }
      expect(controller.totalExpectedEvents).toBe(2500);
      expect(controller.descMinId).toBe(1501);
      expect(controller.history.events).toHaveLength(2500);
    });

    it('fetches at most one page twice', async () => {
      appendEvents(4321);
      const controller = createController();

      await controller.load(workflow(true));
      await waitingLongPoll();

      expect(controller.history.events).toHaveLength(4321);
      expect(fetchedEventCount()).toBeLessThanOrEqual(4321 + PAGE_SIZE);
    });

    it('continues the long-poll from the end-of-history token', async () => {
      appendEvents(1500);
      const controller = createController();

      await controller.load(workflow(true));
      await waitingLongPoll();
      const caughtUpRequests = ascending().length;
      expect(ascending().at(-1)?.token).toBe('1501');

      appendEvents(2);
      await vi.waitFor(() =>
        expect(controller.history.events).toHaveLength(1502),
      );
      await waitingLongPoll();

      const liveRequests = ascending().slice(caughtUpRequests - 1);
      expect(liveRequests.map(({ token }) => token)).toEqual(['1501', '1503']);
      expect(liveRequests[0].eventIds).toEqual([1501, 1502]);
      expect(descending()).toHaveLength(1);
    });

    it('stops at the close event when the Run closes during the load', async () => {
      appendEvents(1800, { close: true });
      const controller = createController();

      await controller.load(workflow(true));

      expect(controller.fetchComplete).toBe(true);
      expect(controller.history.events).toHaveLength(1800);
      expect(ascending().at(-1)?.eventIds.at(-1)).toBe(1800);
      expect(waiters).toHaveLength(0);
    });

    it('pauses the ascending cursor after pauseAfterPages until resumed', async () => {
      appendEvents(5000);
      const controller = createController({ pauseAfterPages: 2 });

      const load = controller.load(workflow(true));
      await vi.waitFor(() =>
        expect(controller.history.events.length).toBeGreaterThanOrEqual(2000),
      );
      await flush();
      const pausedRequests = requests.length;
      await flush();

      expect(requests).toHaveLength(pausedRequests);
      expect(ascending().length).toBeLessThanOrEqual(2);
      expect(controller.fetchComplete).toBe(false);
      const pausedAscending = ascending().length;
      const pausedAt = ascending().at(-1)?.eventIds.at(-1) ?? 0;

      controller.resume();
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(ascending()[pausedAscending].token).toBe(String(pausedAt + 1));
      expect(controller.history.events).toHaveLength(5000);
    });

    it('catches up while live updates are paused, then stops polling', async () => {
      appendEvents(2500);
      const controller = createController({ liveUpdatesPaused: true });

      await controller.load(workflow(true));
      await vi.waitFor(() => expect(controller.loading).toBe(false));

      expect(controller.fetchComplete).toBe(true);
      expect(ascending().map(({ token }) => token)).toEqual([
        undefined,
        '1001',
      ]);
      expect(waiters).toHaveLength(0);

      controller.setLiveUpdatesPaused(false);
      await waitingLongPoll();
      expect(ascending().map(({ token }) => token)).toEqual([
        undefined,
        '1001',
        '2001',
        '2501',
      ]);
    });
  });

  describe('closed Run', () => {
    it('fetches both directions without long-polling', async () => {
      appendEvents(2500, { close: true });
      const controller = createController();

      await controller.load(workflow(false));

      expect(controller.fetchComplete).toBe(true);
      expect(controller.history.events).toHaveLength(2500);
      expect(ascending().length).toBeGreaterThan(0);
      expect(descending().length).toBeGreaterThan(0);
      for (const request of requests) {
        expect(request.params).toMatchObject({
          waitNewEvent: 'false',
          maximumPageSize: '1000',
        });
      }
    });
  });
});
