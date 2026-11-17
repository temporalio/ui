import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import type { HistoryEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { getErrorMessage } from '$lib/utilities/error-message';
import { isNotFound } from '$lib/utilities/handle-error';
import { isNetworkError } from '$lib/utilities/is-network-error';

import { client as defaultClient } from './chain-client';
import { LoadQueue } from './load-queue';
import { retryWithBackoff } from './retry-with-backoff';
import type {
  CardLoad,
  ChainBoundary,
  ChainClient,
  ChainError,
  ChainEvent,
  ChainMismatch,
  ChainRun,
  ChainStatus,
  FirstRunState,
  RequestedRun,
  WorkflowExecutionChainIdentity,
} from './types';

export const WALK_SIZE = 10;
export const REFRESH_INTERVAL_MS = 10_000;
export const CARD_LOAD_CONCURRENCY = 1;

type Phase = Exclude<ChainStatus, 'discoveryError'>;
type DiscoveryStep =
  | 'walkBack'
  | 'detachedWalkBack'
  | 'handOff'
  | 'refresh'
  | 'finalDescribe';

const toChainError = (error: unknown): ChainError =>
  error instanceof Error || isNetworkError(error)
    ? error
    : new Error(getErrorMessage(error));

const readStartedEvent = (
  event: HistoryEvent,
): { continuedExecutionRunId?: string; firstExecutionRunId?: string } => {
  const attributes = event.workflowExecutionStartedEventAttributes;
  return {
    continuedExecutionRunId: attributes?.continuedExecutionRunId || undefined,
    firstExecutionRunId: attributes?.firstExecutionRunId || undefined,
  };
};

const readSuccessorRunId = (closeEvent: HistoryEvent): string | undefined =>
  closeEvent.workflowExecutionCompletedEventAttributes?.newExecutionRunId ||
  closeEvent.workflowExecutionFailedEventAttributes?.newExecutionRunId ||
  closeEvent.workflowExecutionTimedOutEventAttributes?.newExecutionRunId ||
  closeEvent.workflowExecutionContinuedAsNewEventAttributes
    ?.newExecutionRunId ||
  undefined;

export class WorkflowExecutionChain {
  readonly identity: Readonly<WorkflowExecutionChainIdentity>;
  readonly controllers = new SvelteMap<string, WorkflowHistoryController>();
  readonly cardLoads = new SvelteMap<string, CardLoad>();
  readonly requestedRuns = new SvelteMap<string, RequestedRun>();

  runs = $state.raw<ChainRun[]>([]);
  boundary = $state<ChainBoundary>(null);
  firstRun = $state.raw<FirstRunState>({ status: 'loading' });
  error = $state.raw<ChainError | null>(null);
  mismatch = $state.raw<ChainMismatch | null>(null);
  redirectFirstRunId = $state<string | null>(null);
  walking = $state(false);
  pendingSuccessorRunId = $state<string | null>(null);
  detachedRuns = $state.raw<ChainRun[]>([]);
  detachedBoundary = $state<ChainBoundary>(null);
  detachedWalking = $state(false);
  detachedOffPath = $state(false);

  private _latestRunId = $state<string | null>(null);
  private _phase = $state<Phase>('loading');
  private _failedSteps = new SvelteMap<DiscoveryStep, () => void>();
  private _handledCloses = new SvelteSet<string>();
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private _prioritizedRunId: string | null = null;
  private _detachedCandidate: ChainRun | null = null;
  private readonly _fetchedRuns = new SvelteMap<string, ChainRun>();
  private readonly _firstEventRunIds = new SvelteSet<string>();
  private readonly _queue = new LoadQueue({
    concurrency: CARD_LOAD_CONCURRENCY,
    start: (runId) => this._loadCard(runId),
  });
  private readonly _client: ChainClient;
  private readonly _abort = new AbortController();
  private readonly _runRequests = new SvelteMap<
    string,
    Promise<RequestedRun>
  >();
  private readonly _listeners = new SvelteSet<(event: ChainEvent) => void>();
  private _resolveLoaded!: () => void;
  private readonly _loaded = new Promise<void>((resolve) => {
    this._resolveLoaded = resolve;
  });

  constructor(
    identity: WorkflowExecutionChainIdentity,
    client: ChainClient = defaultClient,
  ) {
    const { namespace, workflowId, firstRunId } = identity;
    if (!namespace || !workflowId || !firstRunId) {
      throw new Error(
        'Workflow execution chain requires a namespace, Workflow ID, and first Run ID.',
      );
    }
    this.identity = { namespace, workflowId, firstRunId };
    this._client = client;
  }

  get status(): ChainStatus {
    if (this._failedSteps.size > 0) {
      return 'discoveryError';
    }
    return this._phase;
  }

  get latestRunId(): string | null {
    return this._latestRunId;
  }

  private get _disposed(): boolean {
    return this._abort.signal.aborted;
  }

  async load(): Promise<void> {
    try {
      await this._load();
    } finally {
      this._resolveLoaded();
    }
  }

  whenLoaded(): Promise<void> {
    return this._loaded;
  }

  subscribe(listener: (event: ChainEvent) => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private async _load(): Promise<void> {
    const { namespace, workflowId, firstRunId } = this.identity;
    const firstRunTask = this._describeFirstRun();

    let current: WorkflowExecution;
    let currentFirstRunId: string | undefined;
    let startedEvent: HistoryEvent | undefined;
    try {
      current = await this._retry((signal) =>
        this._client.describe({ namespace, workflowId }, signal),
      );
      if (this._disposed) {
        return;
      }
      currentFirstRunId = current.firstRunId;
      if (!currentFirstRunId || currentFirstRunId === firstRunId) {
        startedEvent = await this._fetchStartedEvent(current.runId);
        currentFirstRunId ??=
          readStartedEvent(startedEvent).firstExecutionRunId;
      }
      if (!currentFirstRunId) {
        throw new Error('Missing first Run ID for the current Run.');
      }
    } catch (error) {
      if (this._disposed) {
        return;
      }
      this.error = toChainError(error);
      return;
    }
    if (this._disposed) {
      return;
    }

    if (currentFirstRunId !== firstRunId || !startedEvent) {
      await this._classifyMismatch(currentFirstRunId, await firstRunTask);
      return;
    }

    const latest: ChainRun = {
      runId: current.runId,
      workflow: current,
      startedEvent,
    };
    this.runs = [latest];
    this._latestRunId = latest.runId;
    this._phase = current.isRunning ? 'ready' : 'closed';
    if (current.isRunning) {
      this._scheduleRefresh();
    }
    this._startCard(latest.runId);
    void this._walkBack(WALK_SIZE - 1);
  }

  loadOlder(): Promise<void> {
    if (
      this.walking ||
      this.boundary !== null ||
      this._failedSteps.has('walkBack') ||
      this.runs.length === 0
    ) {
      return Promise.resolve();
    }
    return this._walkBack(WALK_SIZE);
  }

  async loadDetachedPredecessor(): Promise<string | null> {
    const oldest = this.detachedRuns[0];
    if (
      !oldest ||
      this.detachedWalking ||
      this.detachedBoundary !== null ||
      this._failedSteps.has('detachedWalkBack')
    ) {
      return null;
    }
    const predecessor = readStartedEvent(
      oldest.startedEvent,
    ).continuedExecutionRunId;
    if (!predecessor) {
      this.detachedBoundary = 'chainStart';
      return null;
    }
    if (this._isInWindow(predecessor)) {
      this.detachedOffPath = true;
      return predecessor;
    }
    this.detachedWalking = true;
    let run: ChainRun;
    try {
      run = await this._hop(predecessor);
    } catch (error) {
      if (this._disposed || this.detachedRuns[0] !== oldest) {
        return null;
      }
      this.detachedWalking = false;
      if (isNotFound(error)) {
        this.detachedBoundary = 'retention';
        return null;
      }
      this._fail('detachedWalkBack', () => void this.loadDetachedPredecessor());
      return null;
    }
    if (this._disposed || this.detachedRuns[0] !== oldest) {
      return null;
    }
    this.detachedWalking = false;
    if (this._isInWindow(predecessor)) {
      this.detachedOffPath = true;
      return predecessor;
    }
    this.detachedRuns = [run, ...this.detachedRuns];
    this._enqueueCard(run.runId);
    return run.runId;
  }

  requestRun(runId: string): Promise<RequestedRun> {
    const request = this._runRequests.get(runId) ?? this._requestRun(runId);
    this._runRequests.set(runId, request);
    void request.then((result) => this._showRequested(result));
    return request;
  }

  prioritizeRun(runId: string | null): void {
    this._prioritizedRunId = runId;
    const cardLoad = runId ? this.cardLoads.get(runId) : undefined;
    if (runId && cardLoad?.status === 'queued') {
      this._startCard(runId);
    }
    this._syncQueueGate();
  }

  cardLoadOf(runId: string): CardLoad {
    return this.cardLoads.get(runId) ?? { status: 'queued' };
  }

  retryCard(runId: string): void {
    const cardLoad = this.cardLoads.get(runId);
    if (cardLoad?.status !== 'error' || !cardLoad.retryable) {
      return;
    }
    this.cardLoads.set(runId, { status: 'queued' });
    if (runId === this._latestRunId || runId === this._queueGateRunId) {
      this._startCard(runId);
      return;
    }
    this._queue.prioritize(runId);
  }

  retryDiscovery(): void {
    const steps = [...this._failedSteps.values()];
    this._failedSteps.clear();
    for (const step of steps) {
      step();
    }
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._abort.abort();
    this._listeners.clear();
    this._resolveLoaded();
    this._queue.dispose();
    this._stopRefresh();
    for (const controller of this.controllers.values()) {
      controller.dispose();
    }
  }

  private _retry<T>(request: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const signal = this._abort.signal;
    return retryWithBackoff(() => request(signal), signal);
  }

  private _describe(runId: string): Promise<WorkflowExecution> {
    const { namespace, workflowId } = this.identity;
    return this._retry((signal) =>
      this._client.describe({ namespace, workflowId, runId }, signal),
    );
  }

  private _fetchStartedEvent(runId: string): Promise<HistoryEvent> {
    const { namespace, workflowId } = this.identity;
    return this._retry((signal) =>
      this._client.fetchStartedEvent({ namespace, workflowId, runId }, signal),
    );
  }

  private async _hop(runId: string): Promise<ChainRun> {
    const [workflow, startedEvent] = await Promise.all([
      this._describe(runId),
      this._fetchStartedEvent(runId),
    ]);
    const run = { runId, workflow, startedEvent };
    this._fetchedRuns.set(runId, run);
    return run;
  }

  private _isInWindow(runId: string): boolean {
    return this.runs.some((run) => run.runId === runId);
  }

  private _isDetached(runId: string): boolean {
    return this.detachedRuns.some((run) => run.runId === runId);
  }

  private _findRun(runId: string): ChainRun | undefined {
    return (
      this.runs.find((run) => run.runId === runId) ??
      this.detachedRuns.find((run) => run.runId === runId) ??
      this._fetchedRuns.get(runId)
    );
  }

  private async _requestRun(runId: string): Promise<RequestedRun> {
    const loadingRequest: RequestedRun = { status: 'loading' };
    if (this._disposed) {
      return loadingRequest;
    }
    const knownRun = this._findRun(runId);
    if (knownRun) {
      return this._settleRequest(runId, { status: 'found', run: knownRun });
    }
    this.requestedRuns.set(runId, loadingRequest);
    let run: ChainRun;
    try {
      run = await this._hop(runId);
    } catch (error) {
      if (this._disposed) {
        return loadingRequest;
      }
      return this._settleRequest(
        runId,
        isNotFound(error)
          ? { status: 'notFound' }
          : { status: 'failed', error: toChainError(error) },
      );
    }
    if (this._disposed) {
      return loadingRequest;
    }
    const firstRunId =
      run.workflow.firstRunId ??
      readStartedEvent(run.startedEvent).firstExecutionRunId;
    if (firstRunId && firstRunId !== this.identity.firstRunId) {
      return this._settleRequest(runId, { status: 'wrongChain', firstRunId });
    }
    return this._settleRequest(runId, {
      status: 'found',
      run: this._findRun(runId) ?? run,
    });
  }

  private _showRequested(result: RequestedRun): void {
    if (this._disposed || result.status !== 'found') {
      return;
    }
    const { runId } = result.run;
    this._detachedCandidate = this._findRun(runId) ?? result.run;
    this._attachDetached();
    if (this.cardLoadOf(runId).status === 'queued') {
      this._startCard(runId);
    }
  }

  private _attachDetached(): void {
    const candidate = this._detachedCandidate;
    if (!candidate || this.runs.length === 0 || this.walking) {
      return;
    }
    this._detachedCandidate = null;
    if (
      candidate.runId !== this._prioritizedRunId ||
      this._isInWindow(candidate.runId) ||
      this._isDetached(candidate.runId)
    ) {
      return;
    }
    this._replaceDetached([candidate]);
    this._checkDetachedOffPath(this.runs[0]);
  }

  private _replaceDetached(runs: ChainRun[]): void {
    this.detachedRuns = runs;
    this.detachedBoundary = null;
    this.detachedOffPath = false;
    this.detachedWalking = false;
    this._failedSteps.delete('detachedWalkBack');
  }

  private _removeDetached(runId: string): void {
    const rest = this.detachedRuns.filter((run) => run.runId !== runId);
    if (rest.length === 0) {
      this._replaceDetached([]);
      return;
    }
    this._replaceDetached(rest);
    this.detachedOffPath = true;
  }

  private _checkDetachedOffPath(windowRun: ChainRun): void {
    const detached = this.detachedRuns[this.detachedRuns.length - 1];
    if (!detached || this.detachedOffPath) {
      return;
    }
    if (
      Date.parse(windowRun.workflow.startTime) <
      Date.parse(detached.workflow.startTime)
    ) {
      this.detachedOffPath = true;
    }
  }

  private _mergeDetached(): boolean {
    this.runs = [...this.detachedRuns, ...this.runs];
    this.boundary = this.detachedBoundary;
    this._replaceDetached([]);
    return this.boundary !== null;
  }

  private _settleRequest(runId: string, result: RequestedRun): RequestedRun {
    this.requestedRuns.set(runId, result);
    return result;
  }

  private async _describeFirstRun(): Promise<FirstRunState> {
    let state: FirstRunState;
    try {
      const workflow = await this._describe(this.identity.firstRunId);
      state = { status: 'found', workflow };
    } catch (error) {
      state = isNotFound(error)
        ? { status: 'notFound' }
        : { status: 'failed', error: toChainError(error) };
    }
    if (!this._disposed) {
      this.firstRun = state;
    }
    return state;
  }

  private async _classifyMismatch(
    currentFirstRunId: string,
    firstRun: FirstRunState,
  ): Promise<void> {
    if (this._disposed) {
      return;
    }
    const routeRunFirstRunId =
      firstRun.status === 'found'
        ? await this._readFirstRunId(firstRun.workflow)
        : undefined;
    if (this._disposed) {
      return;
    }
    if (routeRunFirstRunId && routeRunFirstRunId !== this.identity.firstRunId) {
      this.redirectFirstRunId = routeRunFirstRunId;
      return;
    }
    this.mismatch = {
      reason: routeRunFirstRunId ? 'workflowIdReused' : 'routeChainNotFound',
      currentFirstRunId,
    };
    this._phase = 'mismatch';
  }

  private async _readFirstRunId(
    workflow: WorkflowExecution,
  ): Promise<string | undefined> {
    if (workflow.firstRunId) {
      return workflow.firstRunId;
    }
    try {
      const startedEvent = await this._fetchStartedEvent(workflow.runId);
      return readStartedEvent(startedEvent).firstExecutionRunId;
    } catch {
      return undefined;
    }
  }

  private async _walkBack(hops: number): Promise<void> {
    this.walking = true;
    try {
      for (let hop = 0; hop < hops; hop++) {
        const predecessor = readStartedEvent(
          this.runs[0].startedEvent,
        ).continuedExecutionRunId;
        if (!predecessor) {
          this.boundary = 'chainStart';
          return;
        }
        const detachedNewest = this.detachedRuns[this.detachedRuns.length - 1];
        if (detachedNewest?.runId === predecessor) {
          hop += this.detachedRuns.length - 1;
          if (this._mergeDetached()) {
            return;
          }
          continue;
        }
        let run: ChainRun;
        try {
          run = await this._hop(predecessor);
        } catch (error) {
          if (this._disposed) {
            return;
          }
          if (isNotFound(error)) {
            this.boundary = 'retention';
            return;
          }
          const remaining = hops - hop;
          this._fail('walkBack', () => void this._walkBack(remaining));
          return;
        }
        if (this._disposed) {
          return;
        }
        this.runs = [run, ...this.runs];
        this._enqueueCard(run.runId);
        this._checkDetachedOffPath(run);
      }
    } finally {
      if (!this._disposed) {
        this.walking = false;
        this._attachDetached();
      }
    }
  }

  private _handleClose(runId: string, closeEvent: HistoryEvent): void {
    if (
      this._disposed ||
      runId !== this._latestRunId ||
      this._handledCloses.has(runId)
    ) {
      return;
    }
    this._handledCloses.add(runId);
    this._stopRefresh();
    this._failedSteps.delete('refresh');

    const run = this.runs.find((chainRun) => chainRun.runId === runId);
    if (run?.workflow.isRunning) {
      void this._finalDescribe(runId);
    }

    const successorRunId = readSuccessorRunId(closeEvent);
    if (!successorRunId) {
      this._phase = 'closed';
      this._emit({ type: 'closed' });
      return;
    }
    void this._handOff(successorRunId);
  }

  private async _handOff(successorRunId: string): Promise<void> {
    this.pendingSuccessorRunId = successorRunId;
    let run: ChainRun;
    try {
      run = await this._hop(successorRunId);
    } catch {
      if (this._disposed) {
        return;
      }
      this.pendingSuccessorRunId = null;
      this._fail('handOff', () => void this._handOff(successorRunId));
      return;
    }
    if (this._disposed) {
      return;
    }
    this.pendingSuccessorRunId = null;
    this.runs = [...this.runs, run];
    if (this._isDetached(run.runId)) {
      this._removeDetached(run.runId);
    }
    this._latestRunId = run.runId;
    this._phase = 'ready';
    this._emit({ type: 'handOff', runId: run.runId });
    if (run.workflow.isRunning) {
      this._scheduleRefresh();
    }
    if (this.cardLoadOf(run.runId).status === 'queued') {
      this._startCard(run.runId);
    }
    this._syncQueueGate();
    const knownCloseEvent = this.controllers.get(run.runId)?.closeEvent;
    if (knownCloseEvent) {
      this._handleClose(run.runId, knownCloseEvent);
    }
  }

  private async _finalDescribe(runId: string): Promise<void> {
    let workflow: WorkflowExecution;
    try {
      workflow = await this._describe(runId);
    } catch {
      if (this._disposed) {
        return;
      }
      this._fail('finalDescribe', () => void this._finalDescribe(runId));
      return;
    }
    if (this._disposed) {
      return;
    }
    this._applyWorkflow(runId, workflow);
  }

  private _scheduleRefresh(): void {
    this._stopRefresh();
    const runId = this._latestRunId;
    if (!runId) {
      return;
    }
    this._refreshTimer = setTimeout(
      () => void this._refresh(runId),
      REFRESH_INTERVAL_MS,
    );
  }

  private _stopRefresh(): void {
    if (this._refreshTimer === null) {
      return;
    }
    clearTimeout(this._refreshTimer);
    this._refreshTimer = null;
  }

  private async _refresh(runId: string): Promise<void> {
    this._refreshTimer = null;
    let workflow: WorkflowExecution;
    try {
      workflow = await this._describe(runId);
    } catch {
      if (this._disposed || !this._isOpenLatest(runId)) {
        return;
      }
      this._fail('refresh', () => void this._refresh(runId));
      return;
    }
    if (this._disposed || !this._isOpenLatest(runId)) {
      return;
    }
    this._applyWorkflow(runId, workflow);
    if (workflow.isRunning) {
      this._scheduleRefresh();
    }
  }

  private _isOpenLatest(runId: string): boolean {
    return runId === this._latestRunId && !this._handledCloses.has(runId);
  }

  private _applyWorkflow(runId: string, workflow: WorkflowExecution): void {
    this.runs = this.runs.map((run) =>
      run.runId === runId ? { ...run, workflow } : run,
    );
    this.controllers.get(runId)?.updateWorkflow(workflow);
  }

  private get _queueGateRunId(): string | null {
    return this._prioritizedRunId ?? this._latestRunId;
  }

  private _syncQueueGate(): void {
    const runId = this._queueGateRunId;
    const status = runId ? this.cardLoads.get(runId)?.status : undefined;
    if (
      runId &&
      (this._firstEventRunIds.has(runId) ||
        status === 'loaded' ||
        status === 'error')
    ) {
      this._queue.release();
      return;
    }
    this._queue.hold();
  }

  private _enqueueCard(runId: string): void {
    if (this.cardLoads.has(runId)) {
      return;
    }
    this.cardLoads.set(runId, { status: 'queued' });
    if (runId === this._prioritizedRunId) {
      this._startCard(runId);
      return;
    }
    this._queue.push(runId);
  }

  private _startCard(runId: string): void {
    this._queue.remove(runId);
    void this._loadCard(runId);
  }

  private async _loadCard(runId: string): Promise<void> {
    if (this._disposed) {
      return;
    }
    const controller = this._controllerFor(runId);
    this.cardLoads.set(runId, { status: 'loading' });
    try {
      await this._retry(async () => {
        const run = this._findRun(runId);
        if (!run) {
          throw new Error('Missing Run for this card.');
        }
        await controller.load(run.workflow);
        if (controller.error) {
          throw controller.error;
        }
      });
    } catch (error) {
      if (this._disposed) {
        return;
      }
      this.cardLoads.set(runId, {
        status: 'error',
        error: toChainError(error),
        retryable: !isNotFound(error),
      });
      this._syncQueueGate();
      return;
    }
    if (this._disposed) {
      return;
    }
    this.cardLoads.set(runId, { status: 'loaded' });
    this._syncQueueGate();
  }

  private _controllerFor(runId: string): WorkflowHistoryController {
    const existing = this.controllers.get(runId);
    if (existing) {
      return existing;
    }
    const { namespace, workflowId } = this.identity;
    const controller = this._client.createController(
      { namespace, workflowId, runId },
      {
        onClose: (closeEvent) => this._handleClose(runId, closeEvent),
        onFirstEvent: () => this._handleFirstEvent(runId),
      },
    );
    this.controllers.set(runId, controller);
    return controller;
  }

  private _handleFirstEvent(runId: string): void {
    if (this._disposed) {
      return;
    }
    this._firstEventRunIds.add(runId);
    this._syncQueueGate();
  }

  private _fail(step: DiscoveryStep, retry: () => void): void {
    const isFirstFailure = this._failedSteps.size === 0;
    this._failedSteps.set(step, retry);
    if (isFirstFailure) {
      this._emit({ type: 'discoveryError' });
    }
  }

  private _emit(event: ChainEvent): void {
    if (this._disposed) {
      return;
    }
    for (const listener of this._listeners) {
      listener(event);
    }
  }
}
