import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import type { HistoryEvent } from '$lib/types/events';
import type {
  WorkflowExecution,
  WorkflowExecutionIdentity,
} from '$lib/types/workflows';

import type {
  ChainClient,
  ChainError,
  ControllerCallbacks,
  DescribeParameters,
} from './types';

import {
  REFRESH_INTERVAL_MS,
  WorkflowExecutionChain,
} from './workflow-execution-chain.svelte';

const NAMESPACE = 'default';
const WORKFLOW_ID = 'chain-workflow';

const networkError = (statusCode: number) => ({
  statusCode,
  statusText: String(statusCode),
  response: {} as Response,
});

class FakeController {
  error: unknown = null;
  closeEvent: HistoryEvent | null = null;
  updateWorkflow = vi.fn();
  dispose = vi.fn();
  private _finishLoad: ((error?: unknown) => void) | null = null;

  load = vi.fn((): Promise<void> => {
    this.error = null;
    if (!this._server.holdLoads) {
      this.error = this._server.loadErrors.get(this.identity.runId) ?? null;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this._finishLoad = (error) => {
        this._finishLoad = null;
        this.error = error ?? null;
        resolve();
      };
    });
  });

  retry = vi.fn((): Promise<void> => {
    this.error = null;
    return Promise.resolve();
  });

  constructor(
    readonly identity: WorkflowExecutionIdentity,
    private readonly _callbacks: ControllerCallbacks,
    private readonly _server: FakeServer,
  ) {}

  get loading(): boolean {
    return this._finishLoad !== null;
  }

  close(closeEvent: HistoryEvent): void {
    this.closeEvent = closeEvent;
    this._callbacks.onClose(closeEvent);
  }

  firstEvent(): void {
    this._callbacks.onFirstEvent();
  }

  failLivePoll(error: ChainError): void {
    this.error = error;
    this._callbacks.onLivePollError(error);
  }

  finishLoad(error?: unknown): void {
    this._finishLoad?.(error);
  }
}

type FakeRun = {
  workflow: WorkflowExecution;
  startedEvent: HistoryEvent;
};

const makeWorkflow = (
  runId: string,
  {
    firstRunId,
    isRunning = false,
    isPaused = false,
    startTime,
  }: {
    firstRunId?: string;
    isRunning?: boolean;
    isPaused?: boolean;
    startTime?: string;
  } = {},
): WorkflowExecution =>
  ({
    id: WORKFLOW_ID,
    runId,
    firstRunId,
    isRunning,
    isPaused,
    startTime,
    status: isPaused ? 'Paused' : isRunning ? 'Running' : 'Completed',
  }) as WorkflowExecution;

const makeStartedEvent = ({
  predecessor = '',
  firstExecutionRunId,
}: {
  predecessor?: string;
  firstExecutionRunId: string;
}): HistoryEvent =>
  ({
    eventId: '1',
    eventType: 'WorkflowExecutionStarted',
    workflowExecutionStartedEventAttributes: {
      continuedExecutionRunId: predecessor,
      firstExecutionRunId,
    },
  }) as unknown as HistoryEvent;

const makeCloseEvent = (
  eventType: string,
  attributesKey: string,
  newExecutionRunId = '',
): HistoryEvent =>
  ({
    eventId: '10',
    eventType,
    [attributesKey]: { newExecutionRunId },
  }) as unknown as HistoryEvent;

const completed = (successor?: string) =>
  makeCloseEvent(
    'WorkflowExecutionCompleted',
    'workflowExecutionCompletedEventAttributes',
    successor,
  );

class FakeServer {
  runs = new Map<string, FakeRun>();
  errors = new Map<string, unknown>();
  currentRunId = '';
  controllers = new Map<string, FakeController>();
  holdLoads = false;
  loadErrors = new Map<string, unknown>();

  describe = vi.fn(
    async (
      { runId }: DescribeParameters,
      _signal?: AbortSignal,
    ): Promise<WorkflowExecution> => {
      const id = runId ?? this.currentRunId;
      const error = this.errors.get(runId ? `describe:${id}` : 'current');
      if (error) {
        throw error;
      }
      const run = this.runs.get(id);
      if (!run) {
        throw networkError(404);
      }
      return run.workflow;
    },
  );

  fetchStartedEvent = vi.fn(
    async ({ runId }: WorkflowExecutionIdentity): Promise<HistoryEvent> => {
      const error = this.errors.get(`started:${runId}`);
      if (error) {
        throw error;
      }
      const run = this.runs.get(runId);
      if (!run) {
        throw networkError(404);
      }
      return run.startedEvent;
    },
  );

  createController = vi.fn(
    (identity: WorkflowExecutionIdentity, callbacks: ControllerCallbacks) => {
      const controller = new FakeController(identity, callbacks, this);
      this.controllers.set(identity.runId, controller);
      return controller as unknown as WorkflowHistoryController;
    },
  );

  get client(): ChainClient {
    return {
      describe: this.describe,
      fetchStartedEvent: this.fetchStartedEvent,
      createController: this.createController,
    };
  }

  addChain(
    runIds: string[],
    {
      openLatest = true,
      legacy = false,
    }: { openLatest?: boolean; legacy?: boolean } = {},
  ): void {
    const [firstRunId] = runIds;
    runIds.forEach((runId, index) => {
      const isLatest = index === runIds.length - 1;
      this.runs.set(runId, {
        workflow: makeWorkflow(runId, {
          firstRunId: legacy ? undefined : firstRunId,
          isRunning: isLatest && openLatest,
          startTime: hoursIn(index),
        }),
        startedEvent: makeStartedEvent({
          predecessor: runIds[index - 1],
          firstExecutionRunId: firstRunId,
        }),
      });
    });
    this.currentRunId = runIds[runIds.length - 1];
  }

  describeCalls(runId: string): number {
    return this.describe.mock.calls.filter(
      ([parameters]) => parameters.runId === runId,
    ).length;
  }
}

const hoursIn = (hours: number) =>
  new Date(Date.UTC(2024, 0, 1) + hours * 3_600_000).toISOString();

const runIds = (count: number, prefix = 'run') =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);

const settle = async () => {
  for (let i = 0; i < 20; i++) {
    await vi.advanceTimersByTimeAsync(1);
  }
};

const createChain = (server: FakeServer, firstRunId = 'run-1') =>
  new WorkflowExecutionChain(
    { namespace: NAMESPACE, workflowId: WORKFLOW_ID, firstRunId },
    server.client,
  );

const loadChain = async (server: FakeServer, firstRunId = 'run-1') => {
  const chain = createChain(server, firstRunId);
  const loading = chain.load();
  await settle();
  await loading;
  await settle();
  return chain;
};

const chainRunIds = (chain: WorkflowExecutionChain) =>
  chain.runs.map((run) => run.runId);

describe('WorkflowExecutionChain', () => {
  let chains: WorkflowExecutionChain[] = [];
  let server: FakeServer;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    server = new FakeServer();
    chains = [];
  });

  afterEach(() => {
    for (const chain of chains) {
      chain.dispose();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const track = (chain: WorkflowExecutionChain) => {
    chains.push(chain);
    return chain;
  };

  describe('identity', () => {
    it.each([
      { namespace: '', workflowId: WORKFLOW_ID, firstRunId: 'run-1' },
      { namespace: NAMESPACE, workflowId: '', firstRunId: 'run-1' },
      { namespace: NAMESPACE, workflowId: WORKFLOW_ID, firstRunId: '' },
      {
        namespace: NAMESPACE,
        workflowId: WORKFLOW_ID,
        firstRunId: undefined as unknown as string,
      },
    ])('throws when a field is missing: %o', (identity) => {
      expect(() => new WorkflowExecutionChain(identity, server.client)).toThrow(
        /requires a namespace, Workflow ID, and first Run ID/,
      );
    });

    it('keeps its own copy of the identity', () => {
      const identity = {
        namespace: NAMESPACE,
        workflowId: WORKFLOW_ID,
        firstRunId: 'run-1',
      };
      const chain = track(new WorkflowExecutionChain(identity, server.client));
      identity.firstRunId = 'changed';

      expect(chain.identity.firstRunId).toBe('run-1');
    });
  });

  describe('load', () => {
    it('starts in the loading state', () => {
      server.addChain(['run-1']);
      const chain = track(createChain(server));

      expect(chain.status).toBe('loading');
      expect(chain.firstRun).toEqual({ status: 'loading' });
      expect(chain.latestRunId).toBeNull();
    });

    it('loads a chain whose current Run is its first Run', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));

      expect(chain.status).toBe('ready');
      expect(chainRunIds(chain)).toEqual(['run-1']);
      expect(chain.latestRunId).toBe('run-1');
      expect(chain.boundary).toBe('chainStart');
      expect(server.controllers.get('run-1')?.load).toHaveBeenCalledWith(
        server.runs.get('run-1')?.workflow,
      );
    });

    it('describes the current Run and the first Run in parallel', async () => {
      server.addChain(['run-1', 'run-2']);
      const chain = track(createChain(server));
      void chain.load();

      expect(server.describe).toHaveBeenCalledTimes(2);
      expect(server.describe).toHaveBeenCalledWith(
        { namespace: NAMESPACE, workflowId: WORKFLOW_ID },
        expect.any(AbortSignal),
      );
      expect(server.describe).toHaveBeenCalledWith(
        { namespace: NAMESPACE, workflowId: WORKFLOW_ID, runId: 'run-1' },
        expect.any(AbortSignal),
      );
      await settle();
    });

    it('loads mid-chain and walks back to the chain start', async () => {
      server.addChain(runIds(3));
      const chain = track(await loadChain(server));

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2', 'run-3']);
      expect(chain.latestRunId).toBe('run-3');
      expect(chain.boundary).toBe('chainStart');
      expect(server.createController).toHaveBeenNthCalledWith(
        1,
        { namespace: NAMESPACE, workflowId: WORKFLOW_ID, runId: 'run-3' },
        {
          onClose: expect.any(Function),
          onFirstEvent: expect.any(Function),
          onLivePollError: expect.any(Function),
        },
      );
    });

    it('falls back to the Started event on servers older than 1.25', async () => {
      server.addChain(runIds(3), { legacy: true });
      const chain = track(await loadChain(server));

      expect(chain.status).toBe('ready');
      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2', 'run-3']);
      expect(server.fetchStartedEvent).toHaveBeenCalledWith(
        { namespace: NAMESPACE, workflowId: WORKFLOW_ID, runId: 'run-3' },
        expect.any(AbortSignal),
      );
    });

    it('is closed when the current Run is already closed', async () => {
      server.addChain(runIds(2), { openLatest: false });
      const chain = track(await loadChain(server));

      expect(chain.status).toBe('closed');
      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2']);
    });
  });

  describe('describe-current failing on load', () => {
    it('sets the page error on a 404 without retrying', async () => {
      server.addChain(['run-1']);
      server.errors.set('current', networkError(404));
      const chain = track(await loadChain(server));

      expect(chain.error).toMatchObject({ statusCode: 404 });
      expect(chain.status).toBe('loading');
      expect(chain.runs).toEqual([]);
      expect(
        server.describe.mock.calls.filter(([{ runId }]) => !runId),
      ).toHaveLength(1);
    });

    it('sets the page error after retrying a 5xx', async () => {
      server.addChain(['run-1']);
      server.errors.set('current', networkError(503));
      const chain = track(await loadChain(server));

      expect(chain.error).toMatchObject({ statusCode: 503 });
      expect(chain.runs).toEqual([]);
      expect(
        server.describe.mock.calls.filter(([{ runId }]) => !runId),
      ).toHaveLength(4);
    });
  });

  describe('first-Run Describe', () => {
    it('is found', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      expect(chain.firstRun).toEqual({
        status: 'found',
        workflow: server.runs.get('run-1')?.workflow,
      });
    });

    it('is notFound on a 404', async () => {
      server.addChain(runIds(2));
      server.errors.set('describe:run-1', networkError(404));
      const chain = track(await loadChain(server));

      expect(chain.firstRun).toEqual({ status: 'notFound' });
      expect(chain.status).toBe('ready');
    });

    it('is failed on a non-404 and the page loads normally', async () => {
      server.addChain(['run-1']);
      server.errors.set('describe:run-1', networkError(500));
      const chain = track(await loadChain(server));

      expect(chain.firstRun).toMatchObject({
        status: 'failed',
        error: { statusCode: 500 },
      });
      expect(chain.status).toBe('ready');
      expect(chainRunIds(chain)).toEqual(['run-1']);
    });
  });

  describe('first Run ID mismatch', () => {
    beforeEach(() => {
      server.addChain(['old-1', 'old-2'], { openLatest: false });
      server.addChain(['new-1', 'new-2']);
    });

    it('(a) is a mismatch when the route Run is its own first Run', async () => {
      const chain = track(await loadChain(server, 'old-1'));

      expect(chain.status).toBe('mismatch');
      expect(chain.mismatch).toEqual({
        reason: 'workflowIdReused',
        currentFirstRunId: 'new-1',
      });
      expect(chain.runs).toEqual([]);
      expect(server.createController).not.toHaveBeenCalled();
    });

    it('(a) reads the route Run first Run ID from its Started event on older servers', async () => {
      server.runs.set('old-1', {
        ...server.runs.get('old-1')!,
        workflow: makeWorkflow('old-1'),
      });
      const chain = track(await loadChain(server, 'old-1'));

      expect(chain.status).toBe('mismatch');
      expect(chain.mismatch?.reason).toBe('workflowIdReused');
    });

    it('(b) redirects when a mid-chain Run ID was given', async () => {
      const chain = track(await loadChain(server, 'old-2'));

      expect(chain.redirectFirstRunId).toBe('old-1');
      expect(chain.status).toBe('loading');
      expect(chain.mismatch).toBeNull();
    });

    it('(b) redirects to the current chain for one of its mid-chain Runs', async () => {
      const chain = track(await loadChain(server, 'new-2'));

      expect(chain.redirectFirstRunId).toBe('new-1');
    });

    it('(c) shows neutral copy when the route Run is not found', async () => {
      const chain = track(await loadChain(server, 'gone'));

      expect(chain.status).toBe('mismatch');
      expect(chain.mismatch).toEqual({
        reason: 'routeChainNotFound',
        currentFirstRunId: 'new-1',
      });
      expect(chain.firstRun).toEqual({ status: 'notFound' });
    });

    it('(c) shows neutral copy when the route Run Describe fails', async () => {
      server.errors.set('describe:old-1', networkError(500));
      const chain = track(await loadChain(server, 'old-1'));

      expect(chain.status).toBe('mismatch');
      expect(chain.mismatch?.reason).toBe('routeChainNotFound');
      expect(chain.firstRun.status).toBe('failed');
    });
  });

  describe('walk back', () => {
    it('stops after 10 Runs', async () => {
      server.addChain(runIds(15));
      const chain = track(await loadChain(server));

      expect(chainRunIds(chain)).toEqual(runIds(15).slice(5));
      expect(chain.boundary).toBeNull();
      expect(chain.walking).toBe(false);
    });

    it('stops at retention on the first NotFound', async () => {
      server.addChain(runIds(5));
      server.errors.set('describe:run-2', networkError(404));
      const chain = track(await loadChain(server));

      expect(chainRunIds(chain)).toEqual(['run-3', 'run-4', 'run-5']);
      expect(chain.boundary).toBe('retention');
      expect(chain.status).toBe('ready');
    });

    it('stops at retention when the Started event is NotFound', async () => {
      server.addChain(runIds(5));
      server.errors.set('started:run-3', networkError(404));
      const chain = track(await loadChain(server));

      expect(chainRunIds(chain)).toEqual(['run-4', 'run-5']);
      expect(chain.boundary).toBe('retention');
    });

    it('loadOlder walks the next 10', async () => {
      server.addChain(runIds(25));
      const chain = track(await loadChain(server));

      chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(25).slice(5));
      expect(chain.boundary).toBeNull();

      chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(25));
      expect(chain.boundary).toBe('chainStart');
    });

    it('loadOlder does nothing once a boundary is reached', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));
      const calls = server.describe.mock.calls.length;

      chain.loadOlder();
      await settle();

      expect(server.describe.mock.calls.length).toBe(calls);
    });

    it('loadOlder does nothing while a walk is in flight', async () => {
      server.addChain(runIds(25));
      const chain = track(createChain(server));
      await chain.load();

      expect(chain.walking).toBe(true);
      chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toHaveLength(10);
    });
  });

  describe('card loading', () => {
    const controllerIds = () => [...server.controllers.keys()];

    const finishLoad = async (runId: string, error?: unknown) => {
      server.controllers.get(runId)!.finishLoad(error);
      await settle();
    };

    it('starts the Latest Run at once and holds other cards until its first event', async () => {
      server.holdLoads = true;
      server.addChain(runIds(4));
      const chain = track(await loadChain(server));

      expect(controllerIds()).toEqual(['run-4']);
      expect(chain.cardLoads.get('run-4')).toEqual({ status: 'loading' });
      expect(chain.cardLoads.get('run-3')).toEqual({ status: 'queued' });

      server.controllers.get('run-4')!.firstEvent();
      await settle();

      expect(controllerIds()).toEqual(['run-4', 'run-3']);
      expect(chain.cardLoads.get('run-3')).toEqual({ status: 'loading' });
    });

    it('loads the other cards newest first, one at a time', async () => {
      server.holdLoads = true;
      server.addChain(runIds(4));
      const chain = track(await loadChain(server));
      server.controllers.get('run-4')!.firstEvent();
      await settle();

      await finishLoad('run-3');
      expect(controllerIds()).toEqual(['run-4', 'run-3', 'run-2']);
      expect(chain.cardLoads.get('run-3')).toEqual({ status: 'loaded' });

      await finishLoad('run-2');
      expect(controllerIds()).toEqual(['run-4', 'run-3', 'run-2', 'run-1']);
    });

    it('releases the queue when the gating Run settles without events', async () => {
      server.holdLoads = true;
      server.addChain(runIds(3));
      track(await loadChain(server));

      await finishLoad('run-3');

      expect(controllerIds()).toEqual(['run-3', 'run-2']);
    });

    it('prioritizeRun starts a queued Run at once and gates the queue on it', async () => {
      server.holdLoads = true;
      server.addChain(runIds(4));
      const chain = track(await loadChain(server));
      server.controllers.get('run-4')!.firstEvent();
      await settle();

      chain.prioritizeRun('run-1');
      await settle();
      expect(controllerIds()).toEqual(['run-4', 'run-3', 'run-1']);

      await finishLoad('run-3');
      expect(server.controllers.has('run-2')).toBe(false);

      server.controllers.get('run-1')!.firstEvent();
      await settle();
      expect(server.controllers.has('run-2')).toBe(true);
    });

    it('starts a prioritized Run as soon as the walk reaches it', async () => {
      server.holdLoads = true;
      server.addChain(runIds(3));
      const chain = createChain(server);
      track(chain);
      chain.prioritizeRun('run-1');
      void chain.load();
      await settle();

      expect(controllerIds()).toEqual(['run-3', 'run-1']);
      expect(chain.cardLoads.get('run-2')).toEqual({ status: 'queued' });
    });

    it('never makes hops wait on the queue', async () => {
      server.holdLoads = true;
      server.addChain(runIds(4));
      const chain = track(await loadChain(server));

      expect(chainRunIds(chain)).toEqual(runIds(4));

      server.addChain(runIds(5));
      server.controllers.get('run-4')!.close(completed('run-5'));
      await settle();

      expect(chain.latestRunId).toBe('run-5');
      expect(controllerIds()).toEqual(['run-4', 'run-5']);
    });

    it('gates the queue on the successor after a hand-off', async () => {
      server.holdLoads = true;
      server.addChain(runIds(3));
      track(await loadChain(server));
      server.addChain(runIds(4));
      server.controllers.get('run-3')!.close(completed('run-4'));
      await settle();

      server.controllers.get('run-3')!.firstEvent();
      await settle();
      expect(server.controllers.has('run-2')).toBe(false);

      server.controllers.get('run-4')!.firstEvent();
      await settle();
      expect(server.controllers.has('run-2')).toBe(true);
    });

    it('shows a retryable error once retries are exhausted, leaving other cards running', async () => {
      server.loadErrors.set('run-2', networkError(500));
      server.addChain(runIds(3));
      const chain = track(await loadChain(server));

      expect(server.controllers.get('run-2')!.load).toHaveBeenCalledTimes(4);
      expect(chain.cardLoads.get('run-2')).toEqual({
        status: 'error',
        error: networkError(500),
        retryable: true,
      });
      expect(chain.cardLoads.get('run-1')).toEqual({ status: 'loaded' });
      expect(chain.cardLoads.get('run-3')).toEqual({ status: 'loaded' });
      expect(chain.status).toBe('ready');
    });

    it('shows NotFound without Retry, and retryCard ignores it', async () => {
      server.loadErrors.set('run-1', networkError(404));
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      expect(chain.cardLoads.get('run-1')).toMatchObject({
        status: 'error',
        retryable: false,
      });
      expect(server.controllers.get('run-1')!.load).toHaveBeenCalledTimes(1);

      chain.retryCard('run-1');
      await settle();
      expect(server.controllers.get('run-1')!.load).toHaveBeenCalledTimes(1);
    });

    it('cardLoadOf reads an unknown Run as queued', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      expect(chain.cardLoadOf('run-2')).toEqual({ status: 'loaded' });
      expect(chain.cardLoadOf('missing')).toEqual({ status: 'queued' });
    });

    it('retryCard restarts the load at the head of the queue', async () => {
      server.holdLoads = true;
      server.addChain(runIds(4));
      const chain = track(await loadChain(server));
      server.controllers.get('run-4')!.firstEvent();
      await settle();

      for (let attempt = 0; attempt < 4; attempt++) {
        await finishLoad('run-3', networkError(500));
      }
      expect(chain.cardLoads.get('run-3')).toMatchObject({ status: 'error' });
      expect(controllerIds()).toEqual(['run-4', 'run-3', 'run-2']);

      chain.retryCard('run-3');
      expect(chain.cardLoads.get('run-3')).toEqual({ status: 'queued' });
      await finishLoad('run-2');

      expect(server.controllers.get('run-3')!.loading).toBe(true);
      expect(server.controllers.get('run-3')!.load).toHaveBeenCalledTimes(5);
      expect(server.controllers.has('run-1')).toBe(false);

      await finishLoad('run-3');
      expect(chain.cardLoads.get('run-3')).toEqual({ status: 'loaded' });
      expect(server.controllers.has('run-1')).toBe(true);
    });

    it('surfaces a terminal live-poll error on a loaded card and resumes history on retry', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));
      const controller = server.controllers.get('run-2')!;
      expect(chain.cardLoads.get('run-2')).toEqual({ status: 'loaded' });

      controller.failLivePoll(networkError(403));

      expect(chain.cardLoads.get('run-2')).toEqual({
        status: 'error',
        error: networkError(403),
        retryable: true,
      });

      chain.retryCard('run-2');
      await settle();

      expect(controller.retry).toHaveBeenCalledOnce();
      expect(controller.retry).toHaveBeenCalledWith(
        server.runs.get('run-2')!.workflow,
      );
      expect(controller.load).toHaveBeenCalledOnce();
      expect(chain.cardLoads.get('run-2')).toEqual({ status: 'loaded' });
    });

    it('leaves a live-poll error during the load to the load itself', async () => {
      server.holdLoads = true;
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));
      const controller = server.controllers.get('run-2')!;

      controller.failLivePoll(networkError(403));
      expect(chain.cardLoads.get('run-2')).toEqual({ status: 'loading' });

      await finishLoad('run-2', networkError(403));
      expect(chain.cardLoads.get('run-2')).toMatchObject({ status: 'error' });

      chain.retryCard('run-2');
      await finishLoad('run-2');

      expect(controller.retry).not.toHaveBeenCalled();
      expect(chain.cardLoads.get('run-2')).toEqual({ status: 'loaded' });
    });

    it('starts no more cards after dispose', async () => {
      server.holdLoads = true;
      server.addChain(runIds(3));
      const chain = await loadChain(server);
      server.controllers.get('run-3')!.firstEvent();
      await settle();

      chain.dispose();
      await finishLoad('run-2');

      expect(server.controllers.has('run-1')).toBe(false);
      expect(chain.cardLoads.get('run-2')).toEqual({ status: 'loading' });
    });
  });

  describe('hand-off', () => {
    it.each([
      [
        'continue-as-new',
        makeCloseEvent(
          'WorkflowExecutionContinuedAsNew',
          'workflowExecutionContinuedAsNewEventAttributes',
          'run-2',
        ),
      ],
      [
        'retry after failure',
        makeCloseEvent(
          'WorkflowExecutionFailed',
          'workflowExecutionFailedEventAttributes',
          'run-2',
        ),
      ],
      [
        'retry after timeout',
        makeCloseEvent(
          'WorkflowExecutionTimedOut',
          'workflowExecutionTimedOutEventAttributes',
          'run-2',
        ),
      ],
      ['cron', completed('run-2')],
    ])('follows the successor on %s', async (_, closeEvent) => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);

      server.controllers.get('run-1')!.close(closeEvent);
      await settle();

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2']);
      expect(chain.latestRunId).toBe('run-2');
      expect(chain.status).toBe('ready');
      expect(server.controllers.get('run-2')?.load).toHaveBeenCalledWith(
        server.runs.get('run-2')?.workflow,
      );
      expect(server.controllers.get('run-1')?.dispose).not.toHaveBeenCalled();
    });

    it('keeps following when the successor closes too', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2', 'run-3']);

      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();
      server.controllers.get('run-2')!.close(completed('run-3'));
      await settle();

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2', 'run-3']);
      expect(chain.latestRunId).toBe('run-3');
    });

    it('keeps following from a requested successor that closed first', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2', 'run-3']);
      chain.prioritizeRun('run-2');
      await chain.requestRun('run-2');
      expect(chain.detachedRuns).toHaveLength(1);
      await settle();

      server.controllers.get('run-2')!.close(completed('run-3'));
      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2', 'run-3']);
      expect(chain.detachedRuns).toEqual([]);
      expect(chain.latestRunId).toBe('run-3');
    });

    it('is closed when the close event names no successor', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));

      server.controllers
        .get('run-1')!
        .close(
          makeCloseEvent(
            'WorkflowExecutionTerminated',
            'workflowExecutionTerminatedEventAttributes',
          ),
        );
      await settle();

      expect(chain.status).toBe('closed');
      expect(chain.latestRunId).toBe('run-1');
      expect(server.createController).toHaveBeenCalledTimes(1);
    });

    it('hands off when a Run already closed at load names a successor', async () => {
      server.addChain(['run-1'], { openLatest: false });
      const chain = track(await loadChain(server));
      expect(chain.status).toBe('closed');
      server.addChain(['run-1', 'run-2']);

      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(chain.status).toBe('ready');
      expect(chain.latestRunId).toBe('run-2');
    });

    it('ignores a second close from the same Run', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);
      const controller = server.controllers.get('run-1')!;

      controller.close(completed('run-2'));
      controller.close(completed('run-2'));
      await settle();

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2']);
      expect(server.createController).toHaveBeenCalledTimes(2);
    });

    it('ignores a later close from an earlier Run', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2', 'run-3']);
      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();
      const describeCalls = server.describe.mock.calls.length;

      server.controllers.get('run-1')!.close(completed('run-3'));
      await settle();

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2']);
      expect(chain.latestRunId).toBe('run-2');
      expect(chain.status).toBe('ready');
      expect(server.describe.mock.calls.length).toBe(describeCalls);
    });
  });

  describe('fresh Describe', () => {
    it('re-describes the open Latest Run every 10s', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      const initial = server.describeCalls('run-1');
      const refreshed = makeWorkflow('run-1', {
        firstRunId: 'run-1',
        isRunning: true,
      });
      server.runs.set('run-1', {
        ...server.runs.get('run-1')!,
        workflow: refreshed,
      });

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS - 100);
      expect(server.describeCalls('run-1')).toBe(initial);

      await vi.advanceTimersByTimeAsync(100);
      await settle();
      expect(server.describeCalls('run-1')).toBe(initial + 1);
      expect(
        server.controllers.get('run-1')?.updateWorkflow,
      ).toHaveBeenCalledWith(refreshed);
      expect(chain.runs[0].workflow).toBe(refreshed);

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();
      expect(server.describeCalls('run-1')).toBe(initial + 2);
    });

    it('does not re-describe a closed Latest Run', async () => {
      server.addChain(['run-1'], { openLatest: false });
      track(await loadChain(server));
      const initial = server.describeCalls('run-1');

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 3);

      expect(server.describeCalls('run-1')).toBe(initial);
    });

    it('describes once more on close, then stops', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      const initial = server.describeCalls('run-1');
      const closed = makeWorkflow('run-1', { firstRunId: 'run-1' });
      server.runs.set('run-1', {
        ...server.runs.get('run-1')!,
        workflow: closed,
      });

      server.controllers.get('run-1')!.close(completed());
      await settle();

      expect(server.describeCalls('run-1')).toBe(initial + 1);
      expect(chain.runs[0].workflow).toBe(closed);
      expect(
        server.controllers.get('run-1')?.updateWorkflow,
      ).toHaveBeenCalledWith(closed);

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 3);
      expect(server.describeCalls('run-1')).toBe(initial + 1);
    });

    it('moves the re-describe to the successor after a hand-off', async () => {
      server.addChain(['run-1']);
      track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);
      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();
      const run1 = server.describeCalls('run-1');
      const run2 = server.describeCalls('run-2');

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();

      expect(server.describeCalls('run-1')).toBe(run1);
      expect(server.describeCalls('run-2')).toBe(run2 + 1);
    });
  });

  describe('paused Latest Run', () => {
    const setLatestWorkflow = (
      runId: string,
      state: { isRunning?: boolean; isPaused?: boolean },
    ) => {
      const run = server.runs.get(runId)!;
      const workflow = makeWorkflow(runId, {
        firstRunId: 'run-1',
        startTime: run.workflow.startTime,
        ...state,
      });
      server.runs.set(runId, { ...run, workflow });
      return workflow;
    };

    it('keeps a chain loaded while paused open and re-describes it', async () => {
      server.addChain(['run-1']);
      setLatestWorkflow('run-1', { isPaused: true });
      const chain = track(await loadChain(server));
      const initial = server.describeCalls('run-1');

      expect(chain.status).toBe('ready');
      expect(chain.runs[0].workflow.status).toBe('Paused');

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();

      expect(server.describeCalls('run-1')).toBe(initial + 1);
    });

    it('keeps refreshing through running → paused → running while pinned elsewhere', async () => {
      server.addChain(['run-1', 'run-2']);
      const chain = track(await loadChain(server));
      chain.prioritizeRun('run-1');
      const controller = server.controllers.get('run-2')!;

      const paused = setLatestWorkflow('run-2', { isPaused: true });
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();

      expect(chain.status).toBe('ready');
      expect(chain.runs.at(-1)?.workflow).toBe(paused);
      expect(controller.updateWorkflow).toHaveBeenLastCalledWith(paused);

      const resumed = setLatestWorkflow('run-2', { isRunning: true });
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();

      expect(chain.status).toBe('ready');
      expect(chain.runs.at(-1)?.workflow).toBe(resumed);
      expect(controller.updateWorkflow).toHaveBeenLastCalledWith(resumed);

      const describes = server.describeCalls('run-2');
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();
      expect(server.describeCalls('run-2')).toBe(describes + 1);
    });

    it('closes when a paused Run closes without a successor', async () => {
      server.addChain(['run-1']);
      setLatestWorkflow('run-1', { isPaused: true });
      const chain = track(await loadChain(server));
      const initial = server.describeCalls('run-1');

      server.controllers
        .get('run-1')!
        .close(
          makeCloseEvent(
            'WorkflowExecutionTerminated',
            'workflowExecutionTerminatedEventAttributes',
          ),
        );
      await settle();

      expect(chain.status).toBe('closed');
      expect(server.describeCalls('run-1')).toBe(initial + 1);
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 3);
      expect(server.describeCalls('run-1')).toBe(initial + 1);
    });

    it('hands off when a paused Run closes with a successor', async () => {
      server.addChain(['run-1']);
      setLatestWorkflow('run-1', { isPaused: true });
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);

      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(chain.latestRunId).toBe('run-2');
      expect(chain.status).toBe('ready');
    });
  });

  describe('discovery errors', () => {
    it('sets discoveryError when a walk-back hop exhausts its retries', async () => {
      server.addChain(runIds(4));
      server.errors.set('describe:run-2', networkError(503));
      const chain = track(await loadChain(server));

      expect(chain.hasDiscoveryError).toBe(true);
      expect(chain.status).toBe('ready');
      expect(chainRunIds(chain)).toEqual(['run-3', 'run-4']);
      expect(chain.latestRunId).toBe('run-4');

      server.errors.clear();
      chain.retryDiscovery();
      await settle();

      expect(chain.hasDiscoveryError).toBe(false);
      expect(chain.status).toBe('ready');
      expect(chainRunIds(chain)).toEqual(runIds(4));
      expect(chain.boundary).toBe('chainStart');
    });

    it('keeps the Latest Run when a hand-off hop fails, and retries it', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);
      server.errors.set('started:run-2', networkError(500));

      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(chain.hasDiscoveryError).toBe(true);
      expect(chain.latestRunId).toBe('run-1');

      server.errors.clear();
      chain.retryDiscovery();
      await settle();

      expect(chain.status).toBe('ready');
      expect(chain.latestRunId).toBe('run-2');
    });

    it('sets discoveryError when a re-describe fails, and resumes on retry', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.errors.set('describe:run-1', networkError(502));

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();

      expect(chain.hasDiscoveryError).toBe(true);
      const failed = server.describeCalls('run-1');
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 2);
      expect(server.describeCalls('run-1')).toBe(failed);

      server.errors.clear();
      chain.retryDiscovery();
      await settle();

      expect(chain.status).toBe('ready');
      expect(server.describeCalls('run-1')).toBe(failed + 1);
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
      await settle();
      expect(server.describeCalls('run-1')).toBe(failed + 2);
    });

    it('sets discoveryError when the final Describe fails', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.errors.set('describe:run-1', networkError(500));

      server.controllers.get('run-1')!.close(completed());
      await settle();

      expect(chain.hasDiscoveryError).toBe(true);
      expect(chain.status).toBe('closed');

      server.errors.clear();
      chain.retryDiscovery();
      await settle();

      expect(chain.hasDiscoveryError).toBe(false);
      expect(chain.status).toBe('closed');
    });

    it('takes the close time from the close event until the final Describe succeeds', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.errors.set('describe:run-1', networkError(500));
      const closeTime = hoursIn(2);

      expect(chain.closeTime).toBeUndefined();

      server.controllers.get('run-1')!.close({
        ...completed(),
        eventTime: closeTime,
      } as HistoryEvent);
      await settle();

      expect(chain.hasDiscoveryError).toBe(true);
      expect(chain.closeTime).toBe(closeTime);

      const endTime = hoursIn(3);
      server.runs.get('run-1')!.workflow.endTime = endTime;
      server.errors.clear();
      chain.retryDiscovery();
      await settle();

      expect(chain.closeTime).toBe(endTime);
    });

    it('stays closed while an older-Run walk fails and is retried', async () => {
      server.addChain(runIds(4), { openLatest: false });
      const endTime = hoursIn(5);
      server.runs.get('run-4')!.workflow.endTime = endTime;
      server.errors.set('describe:run-2', networkError(503));
      const chain = track(await loadChain(server));

      expect(chain.status).toBe('closed');
      expect(chain.hasDiscoveryError).toBe(true);
      expect(chain.closeTime).toBe(endTime);

      chain.retryDiscovery();
      expect(chain.status).toBe('closed');
      await settle();

      expect(chain.status).toBe('closed');
      expect(chain.hasDiscoveryError).toBe(true);

      server.errors.clear();
      chain.retryDiscovery();
      await settle();

      expect(chain.status).toBe('closed');
      expect(chain.hasDiscoveryError).toBe(false);
      expect(chainRunIds(chain)).toEqual(runIds(4));
      expect(chain.closeTime).toBe(endTime);
    });
  });

  describe('dispose', () => {
    it('disposes every controller and stops the re-describe', async () => {
      server.addChain(['run-1']);
      const chain = await loadChain(server);
      server.addChain(['run-1', 'run-2']);
      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();
      const calls = server.describe.mock.calls.length;

      chain.dispose();
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 3);

      expect(server.controllers.get('run-1')?.dispose).toHaveBeenCalled();
      expect(server.controllers.get('run-2')?.dispose).toHaveBeenCalled();
      expect(server.describe.mock.calls.length).toBe(calls);
    });

    it('aborts in-flight requests and drops their results', async () => {
      server.addChain(runIds(3));
      let resolveCurrent: (workflow: WorkflowExecution) => void = () => {};
      let signal: AbortSignal | undefined;
      server.describe.mockImplementationOnce((_, requestSignal) => {
        signal = requestSignal;
        return new Promise((resolve) => {
          resolveCurrent = resolve;
        });
      });
      const chain = createChain(server);
      const loading = chain.load();

      chain.dispose();
      resolveCurrent(server.runs.get('run-3')!.workflow);
      await loading;
      await settle();

      expect(signal?.aborted).toBe(true);
      expect(chain.runs).toEqual([]);
      expect(chain.latestRunId).toBeNull();
      expect(chain.error).toBeNull();
      expect(chain.firstRun).toEqual({ status: 'loading' });
      expect(server.createController).not.toHaveBeenCalled();
    });

    it('drops a walk-back hop that resolves after dispose', async () => {
      server.addChain(runIds(3));
      const chain = createChain(server);
      await chain.load();

      chain.dispose();
      await settle();

      expect(chainRunIds(chain)).toEqual(['run-3']);
    });

    it('ignores close events after dispose', async () => {
      server.addChain(['run-1']);
      const chain = await loadChain(server);
      server.addChain(['run-1', 'run-2']);

      chain.dispose();
      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(chain.latestRunId).toBe('run-1');
      expect(server.createController).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestRun', () => {
    it('hops the requested Run in parallel with load and starts its controller', async () => {
      server.holdLoads = true;
      server.addChain(runIds(12));
      const chain = track(createChain(server));
      chain.prioritizeRun('run-1');
      chain.requestRun('run-1');
      void chain.load();
      await settle();

      expect(chain.requestedRuns.get('run-1')).toEqual({
        status: 'found',
        run: {
          runId: 'run-1',
          workflow: server.runs.get('run-1')?.workflow,
          startedEvent: server.runs.get('run-1')?.startedEvent,
        },
      });
      expect(server.controllers.get('run-1')?.load).toHaveBeenCalledWith(
        server.runs.get('run-1')?.workflow,
      );
      expect(chainRunIds(chain)).not.toContain('run-1');
    });

    it('does not load a requested Run twice when the walk reaches it', async () => {
      server.addChain(runIds(3));
      const chain = track(createChain(server));
      chain.requestRun('run-1');
      chain.prioritizeRun('run-1');
      void chain.load();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(3));
      expect(server.controllers.get('run-1')?.load).toHaveBeenCalledTimes(1);
      expect(chain.cardLoads.get('run-1')).toEqual({ status: 'loaded' });
    });

    it('uses the window Run when it is already loaded', async () => {
      server.addChain(runIds(3));
      const chain = track(await loadChain(server));
      const describeCallCount = server.describe.mock.calls.length;

      chain.requestRun('run-2');

      expect(chain.requestedRuns.get('run-2')).toEqual({
        status: 'found',
        run: chain.runs[1],
      });
      expect(server.describe.mock.calls.length).toBe(describeCallCount);
    });

    it('classifies a missing Run as not found', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      chain.requestRun('missing');
      await settle();

      expect(chain.requestedRuns.get('missing')).toEqual({
        status: 'notFound',
      });
      expect(server.controllers.has('missing')).toBe(false);
    });

    it('classifies a Run from another chain as wrong chain', async () => {
      server.addChain(runIds(2));
      server.runs.set('other-1', {
        workflow: makeWorkflow('other-1', { firstRunId: 'other-1' }),
        startedEvent: makeStartedEvent({ firstExecutionRunId: 'other-1' }),
      });
      const chain = track(await loadChain(server));

      chain.requestRun('other-1');
      await settle();

      expect(chain.requestedRuns.get('other-1')).toEqual({
        status: 'wrongChain',
        firstRunId: 'other-1',
      });
      expect(server.controllers.has('other-1')).toBe(false);
    });

    it('reads the first Run ID from the Started event on older servers', async () => {
      server.addChain(runIds(2), { legacy: true });
      server.runs.set('other-1', {
        workflow: makeWorkflow('other-1'),
        startedEvent: makeStartedEvent({ firstExecutionRunId: 'other-1' }),
      });
      const chain = track(await loadChain(server));

      chain.requestRun('other-1');
      await settle();

      expect(chain.requestedRuns.get('other-1')?.status).toBe('wrongChain');
    });

    it('keeps a failed request after retries are exhausted', async () => {
      server.addChain(runIds(2));
      server.runs.set('run-x', server.runs.get('run-1')!);
      server.errors.set('describe:run-x', networkError(503));
      const chain = track(await loadChain(server));

      chain.requestRun('run-x');
      await vi.advanceTimersByTimeAsync(30_000);

      expect(chain.requestedRuns.get('run-x')?.status).toBe('failed');
    });

    it('requests each Run once', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      chain.requestRun('missing');
      chain.requestRun('missing');
      await settle();

      expect(server.describeCalls('missing')).toBe(1);
    });
  });

  describe('detached Runs', () => {
    const addBranch = (
      predecessor: string,
      startTime: string | undefined,
      runId = 'branch',
    ) => {
      server.runs.set(runId, {
        workflow: makeWorkflow(runId, { firstRunId: 'run-1', startTime }),
        startedEvent: makeStartedEvent({
          predecessor,
          firstExecutionRunId: 'run-1',
        }),
      });
    };

    const loadWithRequest = async (runId: string) => {
      const chain = track(createChain(server));
      chain.requestRun(runId);
      chain.prioritizeRun(runId);
      void chain.load();
      await settle();
      return chain;
    };

    const detachedRunIds = (chain: WorkflowExecutionChain) =>
      chain.detachedRuns.map((run) => run.runId);

    const holdNextDescribe = () => {
      const describe = server.describe.getMockImplementation()!;
      let release!: () => void;
      server.describe.mockImplementationOnce(async (parameters, signal) => {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return describe(parameters, signal);
      });
      return () => release();
    };

    it('detaches a requested Run the first walk misses', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-2');

      expect(chainRunIds(chain)).toEqual(runIds(15).slice(5));
      expect(detachedRunIds(chain)).toEqual(['run-2']);
      expect(chain.detachedOffPath).toBe(false);
      expect(chain.requestedRuns.get('run-2')?.status).toBe('found');
    });

    it('does not detach a requested Run the first walk reaches', async () => {
      server.addChain(runIds(10));
      const chain = await loadWithRequest('run-2');

      expect(chainRunIds(chain)).toEqual(runIds(10));
      expect(chain.detachedRuns).toEqual([]);
    });

    it('merges the group into the window when the walk reaches it', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-2');
      await chain.loadDetachedPredecessor();
      await settle();

      await chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(15));
      expect(chain.detachedRuns).toEqual([]);
      expect(chain.boundary).toBe('chainStart');
      expect(server.describeCalls('run-2')).toBe(1);
      expect(server.describeCalls('run-1')).toBe(2);
    });

    it('stops the walk at the boundary the group reached', async () => {
      server.addChain(runIds(15));
      server.runs.delete('run-1');
      const chain = await loadWithRequest('run-2');
      await chain.loadDetachedPredecessor();
      expect(chain.detachedBoundary).toBe('retention');

      await chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(15).slice(1));
      expect(chain.boundary).toBe('retention');
      expect(chain.detachedBoundary).toBeNull();
    });

    it('‹ grows the group backwards one hop at a time', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-3');

      expect(await chain.loadDetachedPredecessor()).toBe('run-2');
      expect(detachedRunIds(chain)).toEqual(['run-2', 'run-3']);
      expect(chain.cardLoads.has('run-2')).toBe(true);

      expect(await chain.loadDetachedPredecessor()).toBe('run-1');
      expect(detachedRunIds(chain)).toEqual(['run-1', 'run-2', 'run-3']);

      expect(await chain.loadDetachedPredecessor()).toBeNull();
      expect(chain.detachedBoundary).toBe('chainStart');
      expect(chainRunIds(chain)).toEqual(runIds(15).slice(5));
    });

    it('‹ selects the window card instead of duplicating it, and marks the group off-path', async () => {
      server.addChain(runIds(15));
      addBranch('run-10', undefined);
      const chain = await loadWithRequest('branch');
      expect(chain.detachedOffPath).toBe(false);
      const describes = server.describe.mock.calls.length;

      expect(await chain.loadDetachedPredecessor()).toBe('run-10');

      expect(detachedRunIds(chain)).toEqual(['branch']);
      expect(chain.detachedOffPath).toBe(true);
      expect(server.describe.mock.calls.length).toBe(describes);
    });

    it('moves shared ancestry into the window and keeps the off-path Run detached', async () => {
      server.addChain(runIds(15));
      addBranch('run-3', undefined);
      const chain = await loadWithRequest('branch');
      await chain.loadDetachedPredecessor();
      await chain.loadDetachedPredecessor();
      expect(detachedRunIds(chain)).toEqual(['run-2', 'run-3', 'branch']);

      await chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(15));
      expect(detachedRunIds(chain)).toEqual(['branch']);
      expect(chain.detachedOffPath).toBe(true);
      expect(chain.boundary).toBe('chainStart');
      expect(server.describeCalls('run-3')).toBe(1);
    });

    it('keeps the window boundary the shared ancestry reached', async () => {
      server.addChain(runIds(15));
      server.runs.delete('run-2');
      addBranch('run-3', undefined);
      const chain = await loadWithRequest('branch');
      await chain.loadDetachedPredecessor();
      await chain.loadDetachedPredecessor();
      expect(chain.detachedBoundary).toBe('retention');

      await chain.loadOlder();
      await settle();

      expect(chainRunIds(chain)).toEqual(runIds(15).slice(2));
      expect(chain.boundary).toBe('retention');
      expect(detachedRunIds(chain)).toEqual(['branch']);
      expect(chain.detachedBoundary).toBeNull();
    });

    it.each([
      ['‹', 'the window walk'],
      ['the window walk', '‹'],
    ])(
      'keeps a shared ancestor unique when %s fetches it before %s',
      async (first) => {
        server.addChain(runIds(15));
        addBranch('run-5', undefined);
        const chain = await loadWithRequest('branch');
        const releaseHop = holdNextDescribe();

        const walks =
          first === '‹'
            ? [chain.loadDetachedPredecessor(), chain.loadOlder()]
            : [chain.loadOlder(), chain.loadDetachedPredecessor()];
        releaseHop();
        await settle();
        await Promise.all(walks);

        expect(chainRunIds(chain)).toEqual(runIds(15));
        expect(detachedRunIds(chain)).toEqual(['branch']);
        expect(chain.detachedOffPath).toBe(true);
        expect(server.describeCalls('run-5')).toBe(1);
      },
    );

    it('is off-path once the window walk loads a Run that started before it', async () => {
      server.addChain(runIds(15));
      addBranch('run-3', hoursIn(2.5));
      const chain = await loadWithRequest('branch');

      expect(detachedRunIds(chain)).toEqual(['branch']);
      expect(chain.detachedOffPath).toBe(false);

      await chain.loadOlder();
      await settle();

      expect(chain.detachedOffPath).toBe(true);
      expect(detachedRunIds(chain)).toEqual(['branch']);
      expect(chainRunIds(chain)).toEqual(runIds(15));
    });

    it('is off-path at once when the first window already started before it', async () => {
      server.addChain(runIds(15));
      addBranch('run-10', hoursIn(9.5));
      const chain = await loadWithRequest('branch');

      expect(detachedRunIds(chain)).toEqual(['branch']);
      expect(chain.detachedOffPath).toBe(true);
    });

    it('keeps the group across selection changes', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-2');

      chain.prioritizeRun(null);
      chain.prioritizeRun('run-8');
      await chain.requestRun('run-8');
      chain.prioritizeRun('run-2');

      expect(detachedRunIds(chain)).toEqual(['run-2']);
      expect(await chain.requestRun('run-2')).toEqual({
        status: 'found',
        run: chain.detachedRuns[0],
      });
    });

    it('replaces the group when another detached Run is requested, and restores it on Back', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-2');

      chain.prioritizeRun('run-4');
      await chain.requestRun('run-4');
      expect(detachedRunIds(chain)).toEqual(['run-4']);

      chain.prioritizeRun('run-2');
      await chain.requestRun('run-2');
      expect(detachedRunIds(chain)).toEqual(['run-2']);
      expect(server.describeCalls('run-2')).toBe(1);
    });

    it('restores a Run the group walked back to without hopping it again', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-3');
      await chain.loadDetachedPredecessor();

      chain.prioritizeRun('run-5');
      await chain.requestRun('run-5');
      chain.prioritizeRun('run-2');
      await chain.requestRun('run-2');

      expect(detachedRunIds(chain)).toEqual(['run-2']);
      expect(server.describeCalls('run-2')).toBe(1);
    });

    it('does not hop a Run again when the walk reaches a replaced pin', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-2');
      chain.prioritizeRun('run-4');
      await chain.requestRun('run-4');

      await chain.loadOlder();

      expect(chainRunIds(chain)).toEqual(runIds(15));
      expect(server.describeCalls('run-2')).toBe(1);
    });

    it('describes a pinned successor again on hand-off', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);
      chain.prioritizeRun('run-2');
      await chain.requestRun('run-2');
      server.addChain(['run-1', 'run-2'], { openLatest: false });

      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(chain.latestRunId).toBe('run-2');
      expect(chain.runs.at(-1)?.workflow.isRunning).toBe(false);
    });

    it('resets the boundary and off-path state when the group changes', async () => {
      server.addChain(runIds(15));
      addBranch('run-10', undefined);
      const chain = await loadWithRequest('run-2');
      await chain.loadDetachedPredecessor();
      await chain.loadDetachedPredecessor();
      expect(chain.detachedBoundary).toBe('chainStart');

      chain.prioritizeRun('branch');
      await chain.requestRun('branch');
      expect(chain.detachedBoundary).toBeNull();
      await chain.loadDetachedPredecessor();
      expect(chain.detachedOffPath).toBe(true);

      chain.prioritizeRun('run-3');
      await chain.requestRun('run-3');
      expect(detachedRunIds(chain)).toEqual(['run-3']);
      expect(chain.detachedOffPath).toBe(false);
    });

    it('drops a failed walk of the replaced group from Retry', async () => {
      server.addChain(runIds(15));
      server.errors.set('describe:run-2', networkError(503));
      const chain = await loadWithRequest('run-3');
      const walking = chain.loadDetachedPredecessor();
      await settle();
      await walking;
      expect(chain.hasDiscoveryError).toBe(true);

      chain.prioritizeRun('run-5');
      await chain.requestRun('run-5');

      expect(chain.status).toBe('ready');
      expect(detachedRunIds(chain)).toEqual(['run-5']);
    });

    it('ignores a walk that resolves after the group was replaced', async () => {
      server.addChain(runIds(15));
      const chain = await loadWithRequest('run-3');
      const describe = server.describe.getMockImplementation()!;
      let releaseHop!: () => void;
      server.describe.mockImplementationOnce(async (parameters, signal) => {
        await new Promise<void>((resolve) => {
          releaseHop = resolve;
        });
        return describe(parameters, signal);
      });

      const walking = chain.loadDetachedPredecessor();
      expect(chain.detachedWalking).toBe(true);
      chain.prioritizeRun('run-5');
      await chain.requestRun('run-5');
      expect(chain.detachedWalking).toBe(false);

      releaseHop();
      expect(await walking).toBeNull();
      expect(chain.detachedWalking).toBe(false);
      expect(detachedRunIds(chain)).toEqual(['run-5']);
    });

    it('ignores a request that resolves after another Run was pinned', async () => {
      server.addChain(runIds(15));
      const chain = track(await loadChain(server));
      const releaseRequest = holdNextDescribe();
      chain.prioritizeRun('run-2');
      void chain.requestRun('run-2');

      chain.prioritizeRun('run-4');
      await chain.requestRun('run-4');
      releaseRequest();
      await settle();

      expect(detachedRunIds(chain)).toEqual(['run-4']);
      expect(chain.cardLoadOf('run-2').status).toBe('queued');
    });

    it('does not start the card of a request that resolves after jumping to live', async () => {
      server.addChain(runIds(15));
      const chain = track(await loadChain(server));
      const releaseRequest = holdNextDescribe();
      chain.prioritizeRun('run-2');
      void chain.requestRun('run-2');

      chain.prioritizeRun(null);
      releaseRequest();
      await settle();

      expect(chain.detachedRuns).toEqual([]);
      expect(chain.cardLoadOf('run-2').status).toBe('queued');
    });

    it('attaches the current pin when an older pin resolves later during a walk', async () => {
      server.addChain(runIds(25));
      const chain = track(await loadChain(server));
      const releaseWalk = holdNextDescribe();
      const walking = chain.loadOlder();
      const releaseRequest = holdNextDescribe();
      chain.prioritizeRun('run-2');
      void chain.requestRun('run-2');

      chain.prioritizeRun('run-3');
      await chain.requestRun('run-3');
      releaseRequest();
      await settle();
      releaseWalk();
      await settle();
      await walking;

      expect(detachedRunIds(chain)).toEqual(['run-3']);
      expect(chain.cardLoadOf('run-2').status).toBe('queued');
    });

    it('does not attach a pin deferred by a walk once it is no longer pinned', async () => {
      server.addChain(runIds(25));
      const chain = track(await loadChain(server));
      const releaseWalk = holdNextDescribe();
      const walking = chain.loadOlder();
      chain.prioritizeRun('run-2');
      await chain.requestRun('run-2');
      expect(chain.detachedRuns).toEqual([]);

      chain.prioritizeRun('run-20');
      releaseWalk();
      await settle();
      await walking;

      expect(chainRunIds(chain)).toEqual(runIds(25).slice(5));
      expect(chain.detachedRuns).toEqual([]);
    });

    const handOffToWalkedBackRun = async () => {
      server.addChain(['run-1', 'run-2']);
      const chain = track(await loadChain(server));
      server.addChain(runIds(4));
      server.holdLoads = true;
      chain.prioritizeRun('run-4');
      await chain.requestRun('run-4');
      await chain.loadDetachedPredecessor();
      expect(detachedRunIds(chain)).toEqual(['run-3', 'run-4']);
      expect(chain.cardLoadOf('run-3').status).toBe('queued');

      server.controllers.get('run-2')!.close(completed('run-3'));
      await settle();
      return chain;
    };

    it('starts the card of a queued successor on hand-off', async () => {
      const chain = await handOffToWalkedBackRun();
      chain.prioritizeRun(null);
      await settle();

      expect(chain.latestRunId).toBe('run-3');
      expect(chain.cardLoadOf('run-3').status).toBe('loading');

      server.addChain(runIds(5));
      server.controllers.get('run-3')!.close(completed('run-5'));
      await settle();

      expect(chain.latestRunId).toBe('run-5');
    });

    it('keeps the rest of the group detached when its oldest Run becomes the Latest Run', async () => {
      const chain = await handOffToWalkedBackRun();

      expect(chainRunIds(chain)).toEqual(['run-1', 'run-2', 'run-3']);
      expect(detachedRunIds(chain)).toEqual(['run-4']);
      expect(chain.detachedOffPath).toBe(true);
      expect(chain.detachedBoundary).toBeNull();
    });
  });

  describe('pending successor', () => {
    it('names the successor until its hop resolves', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.addChain(['run-1', 'run-2']);

      server.controllers.get('run-1')!.close(completed('run-2'));
      expect(chain.pendingSuccessorRunId).toBe('run-2');

      await settle();

      expect(chain.pendingSuccessorRunId).toBeNull();
      expect(chain.latestRunId).toBe('run-2');
    });

    it('clears when the hop fails', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      server.controllers.get('run-1')!.close(completed('run-2'));
      await vi.advanceTimersByTimeAsync(30_000);

      expect(chain.pendingSuccessorRunId).toBeNull();
      expect(chain.hasDiscoveryError).toBe(true);
    });
  });

  describe('requestRun result', () => {
    it('resolves with the settled request and reuses it', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      const firstRequest = chain.requestRun('missing');
      const secondRequest = chain.requestRun('missing');
      await settle();

      expect(secondRequest).toBe(firstRequest);
      await expect(firstRequest).resolves.toEqual({ status: 'notFound' });
    });

    it('resolves a Run already in the window at once', async () => {
      server.addChain(runIds(2));
      const chain = track(await loadChain(server));

      await expect(chain.requestRun('run-1')).resolves.toEqual({
        status: 'found',
        run: chain.runs[0],
      });
    });
  });

  describe('prioritizeRun(null)', () => {
    it('gates the queue on the Latest Run again', async () => {
      server.holdLoads = true;
      server.addChain(runIds(4));
      const chain = track(await loadChain(server));
      chain.prioritizeRun('run-1');
      await settle();

      chain.prioritizeRun(null);
      server.controllers.get('run-4')!.firstEvent();
      await settle();

      expect(server.controllers.has('run-3')).toBe(true);
    });
  });

  describe('whenLoaded', () => {
    it('resolves once load settles, whatever the outcome', async () => {
      server.addChain(['run-1']);
      server.errors.set('current', networkError(404));
      const chain = track(createChain(server));
      let loaded = false;
      void chain.whenLoaded().then(() => {
        loaded = true;
      });

      await settle();
      expect(loaded).toBe(false);

      void chain.load();
      await settle();
      expect(loaded).toBe(true);
      expect(chain.error).not.toBeNull();
    });

    it('resolves on dispose', async () => {
      server.addChain(['run-1']);
      const chain = createChain(server);
      let loaded = false;
      void chain.whenLoaded().then(() => {
        loaded = true;
      });

      chain.dispose();
      await settle();

      expect(loaded).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('emits a hand-off with the new Latest Run', async () => {
      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      const listener = vi.fn();
      chain.subscribe(listener);
      server.addChain(['run-1', 'run-2']);

      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        type: 'handOff',
        runId: 'run-2',
      });
    });

    it('emits closed when the chain closes, but not for a chain closed at load', async () => {
      server.addChain(['run-1'], { openLatest: false });
      const closedAtLoad = track(createChain(server));
      const closedListener = vi.fn();
      closedAtLoad.subscribe(closedListener);
      void closedAtLoad.load();
      await settle();
      expect(closedListener).not.toHaveBeenCalled();

      server.addChain(['run-1']);
      const chain = track(await loadChain(server));
      const listener = vi.fn();
      chain.subscribe(listener);
      server.controllers.get('run-1')!.close(completed());
      await settle();

      expect(listener).toHaveBeenCalledExactlyOnceWith({ type: 'closed' });
    });

    it('emits discoveryError once while steps keep failing', async () => {
      server.addChain(runIds(12));
      server.errors.set('describe:run-1', networkError(503));
      const chain = track(await loadChain(server));
      const listener = vi.fn();
      chain.subscribe(listener);

      void chain.loadOlder();
      await vi.advanceTimersByTimeAsync(30_000);
      server.controllers.get('run-12')!.close(completed('run-13'));
      await vi.advanceTimersByTimeAsync(30_000);

      expect(chain.hasDiscoveryError).toBe(true);
      expect(listener).toHaveBeenCalledExactlyOnceWith({
        type: 'discoveryError',
      });
    });

    it('stops after unsubscribe and after dispose', async () => {
      server.addChain(['run-1']);
      const chain = await loadChain(server);
      const unsubscribed = vi.fn();
      const disposed = vi.fn();
      chain.subscribe(unsubscribed)();
      chain.subscribe(disposed);
      server.addChain(['run-1', 'run-2']);

      chain.dispose();
      server.controllers.get('run-1')!.close(completed('run-2'));
      await settle();

      expect(unsubscribed).not.toHaveBeenCalled();
      expect(disposed).not.toHaveBeenCalled();
    });
  });
});
