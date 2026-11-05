import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkflowExecution } from '$lib/types/workflows';

import {
  fetchBidirectional,
  type FetchBidirectionalParams,
} from './fetch-bidirectional';
import { createGroupedEventBuffer } from './grouped-event-buffer';
import { type LivePollOptions, runLivePoll } from './live-poll';
import {
  makeWorkflowCompleted,
  makeWorkflowStarted,
} from './test-helpers/synthetic-events';
import { WorkflowHistoryController } from './workflow-history-controller.svelte.js';

vi.mock('./fetch-bidirectional', () => ({ fetchBidirectional: vi.fn() }));
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

const stats: Awaited<ReturnType<typeof fetchBidirectional>> = {
  durationMs: 1,
  totalEvents: 2,
  overlap: 0,
  ascPages: 1,
  descPages: 1,
  eventsPerSecond: 2,
  winner: 'tie',
};

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
const polls: {
  options: LivePollOptions;
  result: ReturnType<typeof deferred<string>>;
}[] = [];
const controllers: WorkflowHistoryController[] = [];

function request(index: number) {
  const value = requests[index];
  if (!value) throw new Error(`Missing history request ${index}`);
  return value;
}

function poll(index: number) {
  const value = polls[index];
  if (!value) throw new Error(`Missing live poll ${index}`);
  return value;
}

function createController(runId = 'run-1') {
  const buffer = createGroupedEventBuffer();
  const controller = new WorkflowHistoryController({
    workflowExecutionIdentity: {
      namespace: 'default',
      workflowId: 'workflow-1',
      runId,
    },
    buffer,
    maximumPageSize: 20,
    pauseAfterPages: 2,
  });
  controllers.push(controller);
  return { controller, buffer };
}

function progress(index: number, totalEstimated = 10, descMinId = 8) {
  request(index).options.onProgress?.({
    ascEvents: 1,
    descEvents: 3,
    ascPages: 1,
    descPages: 1,
    elapsedMs: 1,
    ascMaxId: 1,
    descMinId,
    totalEstimated,
  });
}

beforeEach(() => {
  requests.length = 0;
  polls.length = 0;
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
      const result = deferred<string>();
      polls.push({ options, result });
      return result.promise;
    });
});

afterEach(async () => {
  for (const controller of controllers.splice(0)) controller.dispose();
  for (const { result } of requests) result.resolve(stats);
  for (const { result } of polls) result.resolve('');
  await Promise.all([
    ...requests.map(({ result }) => result.promise.catch(() => {})),
    ...polls.map(({ result }) => result.promise.catch(() => {})),
  ]);
});

describe('WorkflowHistoryController', () => {
  it('isolates buffers, progress, completion, errors, and polling per controller', async () => {
    const first = createController();
    const second = createController('run-2');
    const firstLoad = first.controller.load(workflow('run-1', true));
    const secondLoad = second.controller.load(workflow('run-2', true));

    request(0).options.onRawPage([makeWorkflowStarted(1)], true);
    progress(0);
    request(0).result.reject(new Error('history failed'));
    request(1).result.resolve(stats);
    await Promise.all([firstLoad, secondLoad]);

    expect(first.buffer.getEventArray().map((event) => event.id)).toEqual([
      '1',
    ]);
    expect(second.buffer.getEventArray()).toEqual([]);
    expect(first.controller.totalExpectedEvents).toBe(10);
    expect(second.controller.totalExpectedEvents).toBe(0);
    expect(first.controller.fetchComplete).toBe(false);
    expect(second.controller.fetchComplete).toBe(true);
    expect(first.controller.error?.message).toBe('history failed');
    expect(second.controller.error).toBeNull();
    expect(poll(0).options.signal.aborted).toBe(true);
    expect(poll(1).options.signal.aborted).toBe(false);
    expect(request(1).options).toMatchObject({
      namespace: 'default',
      workflowId: 'workflow-1',
      runId: 'run-2',
      maximumPageSize: 20,
      pauseAfterPages: 2,
    });
  });

  it('retains partial history on error and recovers without resetting during retry', async () => {
    const { controller, buffer } = createController();
    const reset = vi.spyOn(buffer, 'reset');
    const metadata = vi.spyOn(buffer, 'setPendingMetadata');
    const load = controller.load(workflow());
    request(0).options.onRawPage([makeWorkflowStarted(1)], true);
    progress(0);
    const failure = new Error('history unavailable');
    request(0).result.reject(failure);
    await load;

    expect(controller.error).toBe(failure);
    expect(controller.fetchComplete).toBe(false);
    expect(controller.loading).toBe(false);
    expect(buffer.getEventArray().map((event) => event.id)).toEqual(['1']);

    const retry = controller.retry(workflow());
    expect(reset).toHaveBeenCalledTimes(1);
    expect(metadata).toHaveBeenCalledTimes(2);
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
    request(1).options.onRawPage([makeWorkflowStarted(1)], true);
    request(1).options.onRawPage([makeWorkflowCompleted(10)], false);
    request(1).result.resolve(stats);
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

  it('keeps load reset behavior after buffered history', async () => {
    const { controller, buffer } = createController();
    const load = controller.load(workflow());
    request(0).options.onRawPage([makeWorkflowStarted(1)], true);
    progress(0);
    request(0).result.resolve(stats);
    await load;

    const nextLoad = controller.load(workflow());
    expect(buffer.getEventArray()).toEqual([]);
    expect(controller.latestEventId).toBe(0);
    expect(controller.totalExpectedEvents).toBe(0);
    expect(controller.descMinId).toBe(0);
    expect(controller.fetchComplete).toBe(false);
    request(1).result.resolve(stats);
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
    expect(requests).toHaveLength(1);
    expect(request(0).options.signal?.aborted).toBe(false);
    expect(poll(0).options.signal.aborted).toBe(false);
    request(0).result.resolve(stats);
    await load;
  });

  it('ignores stale history and poll callbacks and stale completion after retry', async () => {
    const { controller, buffer } = createController();
    const load = controller.load(workflow('run-1', true));
    const resume = vi.fn();
    request(0).options.onPause?.({ resume });
    const retry = controller.retry(workflow('run-1', true));
    expect(resume).toHaveBeenCalledOnce();
    expect(request(0).options.signal?.aborted).toBe(true);
    expect(poll(0).options.signal.aborted).toBe(true);

    request(0).options.onRawPage([makeWorkflowCompleted(10)], false);
    progress(0);
    const staleResume = vi.fn();
    request(0).options.onPause?.({ resume: staleResume });
    expect(staleResume).toHaveBeenCalledOnce();
    expect(poll(0).options.onEvent(makeWorkflowCompleted(10))).toBe(false);
    poll(0).options.onToken?.('stale-token');
    request(0).result.resolve(stats);
    poll(0).result.resolve('stale-token');
    await load;
    await Promise.resolve();

    expect(buffer.getEventArray()).toEqual([]);
    expect(controller.totalExpectedEvents).toBe(0);
    expect(controller.fetchComplete).toBe(false);
    expect(controller.error).toBeNull();
    expect(polls).toHaveLength(2);
    expect(poll(1).options.startToken).toBe('');
    request(1).result.resolve(stats);
    await retry;
  });

  it('ignores stale history and poll errors after retry', async () => {
    const { controller } = createController();
    const load = controller.load(workflow('run-1', true));
    const retry = controller.retry(workflow('run-1', true));
    request(0).result.reject(new Error('stale history'));
    poll(0).result.reject(new Error('stale poll'));
    await load;
    await Promise.resolve();
    expect(controller.error).toBeNull();
    expect(request(1).options.signal?.aborted).toBe(false);
    request(1).result.resolve(stats);
    await retry;
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
    expect(controller.resumeRequested).toBe(true);
    expect(other.resumeRequested).toBe(false);

    request(0).result.reject(new Error('retry required'));
    await load;
    const retry = controller.retry(workflow());
    const retryResume = vi.fn();
    request(2).options.onPause?.({ resume: retryResume });
    expect(retryResume).toHaveBeenCalledOnce();
    other.resume();
    expect(otherResume).toHaveBeenCalledOnce();
    request(1).result.resolve(stats);
    request(2).result.resolve(stats);
    await Promise.all([otherLoad, retry]);
  });

  it('resumes live updates per controller with its own saved poll token', async () => {
    const first = createController().controller;
    const second = createController('run-2').controller;
    const firstLoad = first.load(workflow('run-1', true));
    const secondLoad = second.load(workflow('run-2', true));
    poll(0).options.onToken?.('first-token');
    poll(1).options.onToken?.('second-token');
    first.setLiveUpdatesPaused(true);
    expect(poll(0).options.signal.aborted).toBe(true);
    expect(poll(1).options.signal.aborted).toBe(false);
    poll(0).result.resolve('ignored');
    await vi.waitFor(() => expect(polls).toHaveLength(2));
    first.setLiveUpdatesPaused(false);
    await vi.waitFor(() => expect(polls).toHaveLength(3));
    expect(poll(2).options.startToken).toBe('first-token');
    expect(poll(2).options.runId).toBe('run-1');
    request(0).result.resolve(stats);
    request(1).result.resolve(stats);
    await Promise.all([firstLoad, secondLoad]);
  });

  it('does not repoll observed closed history after a failed session and retry', async () => {
    const { controller } = createController();
    const load = controller.load(workflow('run-1', true));
    request(0).options.onRawPage([makeWorkflowCompleted(10)], false);
    expect(poll(0).options.signal.aborted).toBe(true);
    request(0).result.reject(new Error('missing middle history'));
    await load;

    const retry = controller.retry(workflow('run-1', true));
    controller.updateWorkflow(workflow('run-1', true));
    controller.setLiveUpdatesPaused(false);
    poll(0).result.resolve('');
    await Promise.resolve();
    expect(polls).toHaveLength(1);
    request(1).result.resolve(stats);
    await retry;
    expect(controller.fetchComplete).toBe(true);
  });

  it('disposes idempotently, releases pauses, ignores callbacks, and rejects loads', async () => {
    const { controller, buffer } = createController();
    const disposeHistory = vi.spyOn(controller.history, 'dispose');
    const load = controller.load(workflow('run-1', true));
    const resume = vi.fn();
    request(0).options.onPause?.({ resume });
    controller.dispose();
    controller.dispose();
    expect(disposeHistory).toHaveBeenCalledOnce();
    expect(resume).toHaveBeenCalledOnce();
    expect(request(0).options.signal?.aborted).toBe(true);
    expect(poll(0).options.signal.aborted).toBe(true);
    request(0).options.onRawPage([makeWorkflowStarted(1)], true);
    progress(0);
    expect(poll(0).options.onEvent(makeWorkflowStarted(1))).toBe(false);
    request(0).result.resolve(stats);
    await load;
    controller.resume();
    controller.updateWorkflow(workflow('run-1', true));
    controller.setLiveUpdatesPaused(false);
    expect(buffer.getEventArray()).toEqual([]);
    expect(controller.loading).toBe(false);
    expect(controller.fetchComplete).toBe(false);
    expect(controller.resumeRequested).toBe(false);
    expect(polls).toHaveLength(1);
    await expect(controller.load(workflow())).rejects.toThrow('disposed');
    await expect(controller.retry(workflow())).rejects.toThrow('disposed');
  });
});
