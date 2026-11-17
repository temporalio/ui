import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  fetchBidirectional,
  type FetchBidirectionalParams,
  fetchHistoryTail,
  type FetchHistoryTailParams,
} from './fetch-bidirectional';
import { createGroupedEventBuffer } from './grouped-event-buffer';
import { type LivePollOptions, runLivePoll } from './live-poll';
import {
  makeWorkflowCompleted,
  makeWorkflowStarted,
  makeWorkflowTaskScheduled,
} from './test-helpers/synthetic-events';
import { WorkflowHistoryController } from './workflow-history-controller.svelte.js';

vi.mock('./fetch-bidirectional', () => ({
  fetchBidirectional: vi.fn(),
  fetchHistoryTail: vi.fn(),
}));
vi.mock('./live-poll', () => ({ runLivePoll: vi.fn() }));

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function workflow(runId = 'run-1', isRunning = false): WorkflowExecution {
  return {
    name: 'TestWorkflow',
    id: 'workflow-1',
    runId,
    startTime: '2024-01-01T00:00:00Z',
    endTime: '',
    executionTime: '2024-01-01T00:00:00Z',
    status: isRunning ? 'Running' : 'Completed',
    historyEvents: '10',
    historySizeBytes: '0',
    externalPayloadCount: undefined,
    externalPayloadSizeBytes: undefined,
    memo: {},
    pendingChildren: [],
    pendingNexusOperations: [],
    pendingActivities: [],
    stateTransitionCount: '0',
    url: '',
    isRunning,
    isPaused: false,
    canBeTerminated: isRunning,
    callbacks: [],
    workflowExtendedInfo: {},
  };
}

const requests: {
  options: FetchBidirectionalParams;
  result: ReturnType<
    typeof deferred<Awaited<ReturnType<typeof fetchBidirectional>>>
  >;
}[] = [];
const tails: {
  options: FetchHistoryTailParams;
  result: ReturnType<typeof deferred<HistoryEvent[]>>;
}[] = [];
const polls: {
  options: LivePollOptions;
  result: ReturnType<typeof deferred<void>>;
}[] = [];
const controllers: WorkflowHistoryController[] = [];

function request(index: number) {
  const value = requests[index];
  if (!value) throw new Error(`Missing history request ${index}`);
  return value;
}

function tail(index: number) {
  const value = tails[index];
  if (!value) throw new Error(`Missing history tail ${index}`);
  return value;
}

function poll(index: number) {
  const value = polls[index];
  if (!value) throw new Error(`Missing live poll ${index}`);
  return value;
}

function createController(
  runId = 'run-1',
  options: { pauseAfterPages?: number; liveUpdatesPaused?: boolean } = {
    pauseAfterPages: 2,
  },
) {
  const buffer = createGroupedEventBuffer();
  const controller = new WorkflowHistoryController({
    workflowExecutionIdentity: {
      namespace: 'default',
      workflowId: 'workflow-1',
      runId,
    },
    buffer,
    maximumPageSize: 20,
    ...options,
  });
  controllers.push(controller);
  return { controller, buffer };
}

function progress(index: number, totalEstimated = 10, descMinId = 8) {
  request(index).options.onProgress?.({
    descMinId,
    totalEstimated,
  });
}

function pollEvents(index: number, ids: number[], token?: string) {
  for (const id of ids) poll(index).options.onEvent(makeEvent(id));
  if (token !== undefined) poll(index).options.onToken?.(token);
}

function makeEvent(id: number): HistoryEvent {
  return id === 1 ? makeWorkflowStarted(id) : makeWorkflowTaskScheduled(id);
}

function tailEvents(ids: number[]): HistoryEvent[] {
  return ids.map(makeEvent).reverse();
}

async function settle() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

beforeEach(() => {
  requests.length = 0;
  tails.length = 0;
  polls.length = 0;
  vi.mocked(fetchHistoryTail)
    .mockReset()
    .mockImplementation((options) => {
      const result = deferred<HistoryEvent[]>();
      tails.push({ options, result });
      return result.promise;
    });
  vi.mocked(fetchBidirectional)
    .mockReset()
    .mockImplementation((options) => {
      const result = deferred<Awaited<ReturnType<typeof fetchBidirectional>>>();
      requests.push({ options, result });
      return result.promise;
    });
  vi.mocked(runLivePoll)
    .mockReset()
    .mockImplementation((options) => {
      const result = deferred<void>();
      polls.push({ options, result });
      return result.promise;
    });
});

afterEach(async () => {
  for (const controller of controllers.splice(0)) controller.dispose();
  for (const { result } of requests) result.resolve();
  for (const { result } of tails) result.resolve([]);
  for (const { result } of polls) result.resolve();
  await Promise.all([
    ...requests.map(({ result }) => result.promise.catch(() => {})),
    ...tails.map(({ result }) => result.promise.catch(() => {})),
    ...polls.map(({ result }) => result.promise.catch(() => {})),
  ]);
});

describe('WorkflowHistoryController', () => {
  describe('closed Run', () => {
    it('loads history bidirectionally without a tail fetch or live poll', async () => {
      const { controller } = createController();
      const load = controller.load(workflow());
      request(0).options.onRawPage([makeWorkflowStarted(1)]);
      request(0).options.onRawPage([makeWorkflowCompleted(10)]);
      progress(0);
      request(0).result.resolve();
      await load;

      expect(request(0).options).toMatchObject({
        namespace: 'default',
        workflowId: 'workflow-1',
        runId: 'run-1',
        maximumPageSize: 20,
        pauseAfterPages: 2,
      });
      expect(tails).toHaveLength(0);
      expect(polls).toHaveLength(0);
      expect(controller.fetchComplete).toBe(true);
      expect(controller.totalExpectedEvents).toBe(10);
    });

    it('retains partial history on error and recovers without resetting during retry', async () => {
      const { controller, buffer } = createController();
      const load = controller.load(workflow());
      request(0).options.onRawPage([makeWorkflowStarted(1)]);
      progress(0);
      const failure = new Error('history unavailable');
      request(0).result.reject(failure);
      await load;

      expect(controller.error).toBe(failure);
      expect(controller.fetchComplete).toBe(false);
      expect(controller.loading).toBe(false);
      expect(buffer.getEventArray().map((event) => event.id)).toEqual(['1']);

      const retry = controller.retry(workflow());
      expect(controller.error).toBeNull();
      expect(controller.fetchComplete).toBe(false);
      expect(controller.loading).toBe(true);
      expect(controller.latestEventId).toBe(1);
      expect(controller.totalExpectedEvents).toBe(10);
      expect(controller.descMinId).toBe(8);
      expect(buffer.getEventArray().map((event) => event.id)).toEqual(['1']);

      progress(1, 0, 0);
      progress(1, 9, 9);
      expect(controller.totalExpectedEvents).toBe(10);
      expect(controller.descMinId).toBe(8);
      request(1).options.onRawPage([makeWorkflowStarted(1)]);
      request(1).options.onRawPage([makeWorkflowCompleted(10)]);
      request(1).result.resolve();
      await retry;
      await Promise.resolve();

      expect(controller.history.events.map((event) => event.id)).toEqual([
        '1',
        '10',
      ]);
      expect(controller.latestEventId).toBe(10);
      expect(controller.fetchComplete).toBe(true);
      expect(controller.loading).toBe(false);
      expect(controller.error).toBeNull();
    });

    it('keeps resume demand sticky across retries but isolated per controller', async () => {
      const { controller } = createController();
      const other = createController('run-2').controller;
      const load = controller.load(workflow());
      const otherLoad = other.load(workflow('run-2'));
      const resume = vi.fn();
      const otherResume = vi.fn();
      request(0).options.onPause?.({ resume });
      request(1).options.onPause?.({ resume: otherResume });
      controller.resume();
      expect(resume).toHaveBeenCalledOnce();
      expect(otherResume).not.toHaveBeenCalled();

      request(0).result.reject(new Error('retry required'));
      await load;
      const retry = controller.retry(workflow());
      const retryResume = vi.fn();
      request(2).options.onPause?.({ resume: retryResume });
      expect(retryResume).toHaveBeenCalledOnce();
      other.resume();
      expect(otherResume).toHaveBeenCalledOnce();
      request(1).result.resolve();
      request(2).result.resolve();
      await Promise.all([otherLoad, retry]);
    });
  });

  describe('open Run', () => {
    it('reads one tail page and completes once the live poll reaches it', async () => {
      const { controller, buffer } = createController();
      let loaded = false;
      const load = controller
        .load(workflow('run-1', true))
        .then(() => (loaded = true));

      expect(requests).toHaveLength(0);
      expect(tail(0).options).toMatchObject({
        namespace: 'default',
        workflowId: 'workflow-1',
        runId: 'run-1',
        maximumPageSize: 20,
      });
      expect(poll(0).options).toMatchObject({
        runId: 'run-1',
        startToken: '',
        maximumPageSize: 20,
      });

      tail(0).result.resolve(tailEvents([8, 9, 10]));
      await settle();
      expect(controller.totalExpectedEvents).toBe(10);
      expect(controller.descMinId).toBe(8);
      expect(controller.fetchComplete).toBe(false);

      pollEvents(0, [1, 2, 3, 4, 5, 6]);
      expect(controller.fetchComplete).toBe(false);
      pollEvents(0, [7]);
      expect(controller.fetchComplete).toBe(true);
      await load;

      expect(loaded).toBe(true);
      expect(controller.loading).toBe(false);
      expect(poll(0).options.signal.aborted).toBe(false);
      expect(buffer.getEventArray()).toHaveLength(10);
    });

    it('completes when the poll catches up before the tail arrives', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      pollEvents(0, [1, 2, 3, 4, 5], 'token-6');
      expect(controller.fetchComplete).toBe(false);

      tail(0).result.resolve(tailEvents([4, 5]));
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(polls).toHaveLength(1);
      expect(poll(0).options.signal.aborted).toBe(false);
    });

    it('completes from the tail alone when it holds the whole history', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([1, 2, 3]));
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(poll(0).options.signal.aborted).toBe(false);
    });

    it('pauses the poll at pauseAfterPages and resumes it from the saved token', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([50, 51]));
      await settle();
      pollEvents(0, [1, 2], 'token-3');

      expect(poll(0).options.signal.aborted).toBe(true);
      poll(0).result.resolve();
      await settle();
      controller.updateWorkflow(workflow('run-1', true));
      controller.setLiveUpdatesPaused(false);
      expect(polls).toHaveLength(1);
      expect(controller.loading).toBe(true);

      controller.resume();
      expect(poll(1).options.startToken).toBe('token-3');
      pollEvents(1, range(3, 49));
      await load;
      expect(controller.fetchComplete).toBe(true);
    });

    it('does not pause once history was requested', async () => {
      const { controller } = createController();
      controller.resume();
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([50, 51]));
      await settle();
      pollEvents(0, [1, 2], 'token-3');
      pollEvents(0, [3, 4], 'token-5');

      expect(poll(0).options.signal.aborted).toBe(false);
      pollEvents(0, range(5, 49));
      await load;
    });

    it('releases the page-limit pause when the tail closes the gap', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      pollEvents(0, [1, 2], 'token-3');
      pollEvents(0, [3, 4], 'token-5');
      expect(poll(0).options.signal.aborted).toBe(true);
      poll(0).result.resolve();
      await settle();

      tail(0).result.resolve(tailEvents([5, 6]));
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(poll(1).options.startToken).toBe('token-5');
    });

    it('catches up while live updates are paused, then stops polling', async () => {
      const { controller } = createController('run-1', {
        liveUpdatesPaused: true,
      });
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([5, 6]));
      await settle();
      controller.setLiveUpdatesPaused(true);
      expect(poll(0).options.signal.aborted).toBe(false);

      pollEvents(0, [1, 2, 3, 4], 'token-5');
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(poll(0).options.signal.aborted).toBe(true);
      poll(0).result.resolve();
      await settle();
      expect(polls).toHaveLength(1);

      controller.setLiveUpdatesPaused(false);
      expect(poll(1).options.startToken).toBe('token-5');
    });

    it('keeps reading through a close event in the tail until it catches up', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve([makeWorkflowCompleted(10), makeEvent(9)]);
      await settle();
      expect(poll(0).options.signal.aborted).toBe(false);

      pollEvents(0, range(1, 8));
      expect(poll(0).options.onEvent(makeEvent(9))).toBe(false);
      expect(poll(0).options.onEvent(makeWorkflowCompleted(10))).toBe(false);
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(poll(0).options.signal.aborted).toBe(true);
    });

    it('isolates buffers, progress, completion, errors, and polling per controller', async () => {
      const first = createController();
      const second = createController('run-2');
      const firstLoad = first.controller.load(workflow('run-1', true));
      const secondLoad = second.controller.load(workflow('run-2', true));

      tail(0).result.resolve(tailEvents([8, 9, 10]));
      tail(1).result.reject(new Error('history failed'));
      pollEvents(0, range(1, 7));
      await Promise.all([firstLoad, secondLoad]);

      expect(first.buffer.getEventArray()).toHaveLength(10);
      expect(second.buffer.getEventArray()).toEqual([]);
      expect(first.controller.totalExpectedEvents).toBe(10);
      expect(second.controller.totalExpectedEvents).toBe(0);
      expect(first.controller.fetchComplete).toBe(true);
      expect(second.controller.fetchComplete).toBe(false);
      expect(first.controller.error).toBeNull();
      expect(second.controller.error?.message).toBe('history failed');
      expect(poll(0).options.signal.aborted).toBe(false);
      expect(poll(1).options.signal.aborted).toBe(true);
      expect(poll(1).options.runId).toBe('run-2');
    });

    it('stops polling and keeps the error after the tail fails', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      const failure = new Error('history failed');
      tail(0).result.reject(failure);
      await load;

      expect(controller.loading).toBe(false);
      expect(controller.fetchComplete).toBe(false);
      expect(controller.error).toBe(failure);
      expect(tail(0).options.signal?.aborted).toBe(true);
      expect(poll(0).options.signal.aborted).toBe(true);
      poll(0).result.resolve();
      await settle();
      controller.updateWorkflow(workflow('run-1', true));
      expect(polls).toHaveLength(1);
    });

    it('rejects retryable poll errors only while catching up', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      expect(poll(0).options.shouldRetryError?.()).toBe(false);
      tail(0).result.resolve(tailEvents([2, 3]));
      pollEvents(0, [1]);
      await load;

      expect(controller.fetchComplete).toBe(true);
      expect(poll(0).options.shouldRetryError?.()).toBe(true);
    });

    it('surfaces poll errors during catch-up without restarting polling', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      const failure = new Error('poll failed');
      poll(0).result.reject(failure);
      await load;

      expect(controller.error).toBe(failure);
      expect(controller.loading).toBe(false);
      expect(controller.fetchComplete).toBe(false);
      controller.updateWorkflow(workflow('run-1', true));
      controller.setLiveUpdatesPaused(true);
      controller.setLiveUpdatesPaused(false);
      expect(polls).toHaveLength(1);
    });

    it('retries from the last acknowledged token and preserves buffered events', async () => {
      const { controller, buffer } = createController('run-1', {});
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([5, 6]));
      pollEvents(0, [1, 2], 'acknowledged-token');
      poll(0).result.reject(new Error('poll failed'));
      await load;
      expect(controller.fetchComplete).toBe(false);

      const retry = controller.retry(workflow('run-1', true));
      expect(controller.error).toBeNull();
      expect(controller.loading).toBe(true);
      expect(poll(1).options.startToken).toBe('acknowledged-token');
      tail(1).result.resolve(tailEvents([5, 6]));
      pollEvents(1, [3, 4]);
      await retry;

      expect(controller.fetchComplete).toBe(true);
      expect(buffer.getEventArray()).toHaveLength(6);
    });

    it('resets buffered history, progress, completion, and the saved poll token on a fresh load', async () => {
      const { controller, buffer } = createController();
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([2, 3]));
      pollEvents(0, [1], 'old-token');
      await load;
      expect(buffer.getEventArray()).toHaveLength(3);
      expect(controller.fetchComplete).toBe(true);

      const nextLoad = controller.load(workflow('run-1', true));
      expect(poll(0).options.signal.aborted).toBe(true);
      expect(poll(1).options.startToken).toBe('');
      expect(buffer.getEventArray()).toEqual([]);
      expect(controller.latestEventId).toBe(0);
      expect(controller.totalExpectedEvents).toBe(0);
      expect(controller.descMinId).toBe(0);
      expect(controller.fetchComplete).toBe(false);
      tail(1).result.resolve(tailEvents([1]));
      await nextLoad;
    });

    it('rejects mismatched retry identity without stopping the current session', async () => {
      const { controller } = createController();
      const load = controller.load(workflow('run-1', true));
      await expect(controller.retry(workflow('run-2'))).rejects.toThrow(
        'Workflow does not match this history controller.',
      );
      await expect(
        controller.retry({ ...workflow(), id: 'other' }),
      ).rejects.toThrow('Workflow does not match this history controller.');
      expect(tails).toHaveLength(1);
      expect(tail(0).options.signal?.aborted).toBe(false);
      expect(poll(0).options.signal.aborted).toBe(false);
      tail(0).result.resolve(tailEvents([1]));
      await load;
    });

    it('ignores stale tail and poll callbacks and errors after retry', async () => {
      const { controller, buffer } = createController();
      const load = controller.load(workflow('run-1', true));
      poll(0).options.onToken?.('saved-token');
      const retry = controller.retry(workflow('run-1', true));
      expect(tail(0).options.signal?.aborted).toBe(true);
      expect(poll(0).options.signal.aborted).toBe(true);

      expect(poll(0).options.onEvent(makeWorkflowCompleted(10))).toBe(false);
      poll(0).options.onToken?.('stale-token');
      tail(0).result.reject(new Error('stale tail'));
      poll(0).result.reject(new Error('stale poll'));
      await load;
      await settle();

      expect(buffer.getEventArray()).toEqual([]);
      expect(controller.error).toBeNull();
      expect(controller.loading).toBe(true);
      expect(polls).toHaveLength(2);
      expect(poll(1).options.startToken).toBe('saved-token');
      tail(1).result.resolve(tailEvents([1]));
      await retry;
      expect(controller.fetchComplete).toBe(true);
    });

    it('resumes live updates per controller with its own saved poll token', async () => {
      const first = createController().controller;
      const second = createController('run-2').controller;
      const firstLoad = first.load(workflow('run-1', true));
      const secondLoad = second.load(workflow('run-2', true));
      tail(0).result.resolve(tailEvents([1]));
      tail(1).result.resolve(tailEvents([1]));
      await Promise.all([firstLoad, secondLoad]);
      poll(0).options.onToken?.('first-token');
      poll(1).options.onToken?.('second-token');

      first.setLiveUpdatesPaused(true);
      expect(poll(0).options.signal.aborted).toBe(true);
      expect(poll(1).options.signal.aborted).toBe(false);
      poll(0).result.resolve();
      await settle();
      expect(polls).toHaveLength(2);
      first.setLiveUpdatesPaused(false);
      expect(polls).toHaveLength(3);
      expect(poll(2).options.startToken).toBe('first-token');
      expect(poll(2).options.runId).toBe('run-1');
    });

    it('disposes idempotently, releases pauses, ignores callbacks, and rejects loads', async () => {
      const { controller, buffer } = createController();
      const disposeHistory = vi.spyOn(controller.history, 'dispose');
      const load = controller.load(workflow('run-1', true));
      tail(0).result.resolve(tailEvents([50]));
      await settle();
      pollEvents(0, [1], 'token-2');
      expect(poll(0).options.signal.aborted).toBe(true);

      controller.dispose();
      controller.dispose();
      await load;
      expect(disposeHistory).toHaveBeenCalledOnce();
      expect(poll(0).options.onEvent(makeEvent(2))).toBe(false);
      controller.resume();
      controller.updateWorkflow(workflow('run-1', true));
      controller.setLiveUpdatesPaused(false);
      expect(buffer.getEventArray()).toHaveLength(2);
      expect(controller.loading).toBe(false);
      expect(controller.fetchComplete).toBe(false);
      expect(polls).toHaveLength(1);
      await expect(controller.load(workflow())).rejects.toThrow('disposed');
      await expect(controller.retry(workflow())).rejects.toThrow('disposed');
    });
  });
});

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
