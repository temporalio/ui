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
  RunLookup,
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

class RunRecord {
  run = $state.raw<ChainRun | null>(null);
  controller = $state.raw<WorkflowHistoryController | undefined>();
  cardLoad = $state.raw<CardLoad | undefined>();
  request = $state.raw<RequestedRun | undefined>();
  pendingFetch: Promise<ChainRun> | null = null;
  pendingRequest: Promise<RequestedRun> | null = null;
  firstEventSeen = false;
  closeHandled = false;

  constructor(readonly runId: string) {}
}

export class WorkflowExecutionChain {
  readonly identity: Readonly<WorkflowExecutionChainIdentity>;
  private readonly _records = new SvelteMap<string, RunRecord>();
  readonly controllers = this._createRunLookup((record) => record.controller);
  readonly cardLoads = this._createRunLookup((record) => record.cardLoad);
  readonly requestedRuns = this._createRunLookup((record) => record.request);

  private _windowIds = $state.raw<string[]>([]);
  private _detachedIds = $state.raw<string[]>([]);
  readonly runs = $derived(this._resolveRuns(this._windowIds));
  readonly detachedRuns = $derived(this._resolveRuns(this._detachedIds));
  boundary = $state<ChainBoundary>(null);
  firstRun = $state.raw<FirstRunState>({ status: 'loading' });
  error = $state.raw<ChainError | null>(null);
  mismatch = $state.raw<ChainMismatch | null>(null);
  redirectFirstRunId = $state<string | null>(null);
  walking = $state(false);
  pendingSuccessorRunId = $state<string | null>(null);
  detachedBoundary = $state<ChainBoundary>(null);
  detachedWalking = $state(false);
  detachedOffPath = $state(false);

  private _latestRunId = $state<string | null>(null);
  private _phase = $state<Phase>('loading');
  private _failedSteps = new SvelteMap<DiscoveryStep, () => void>();
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private _prioritizedRunId: string | null = null;
  private _detachedCandidateId: string | null = null;
  private readonly _queue = new LoadQueue({
    concurrency: CARD_LOAD_CONCURRENCY,
    start: (runId) => this._loadCard(runId),
  });
  private readonly _client: ChainClient;
  private readonly _abort = new AbortController();
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

    const latest = this._storeRun(current.runId, current, startedEvent);
    this._windowIds = [latest.runId];
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
      this._windowIds.length === 0
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
      run = await this._fetchRun(predecessor);
    } catch (error) {
      if (this._disposed || this._detachedIds[0] !== oldest.runId) {
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
    if (this._disposed || this._detachedIds[0] !== oldest.runId) {
      return null;
    }
    this.detachedWalking = false;
    if (this._isInWindow(predecessor)) {
      this.detachedOffPath = true;
      return predecessor;
    }
    this._detachedIds = [run.runId, ...this._detachedIds];
    this._enqueueCard(run.runId);
    return run.runId;
  }

  requestRun(runId: string): Promise<RequestedRun> {
    const record = this._recordFor(runId);
    record.pendingRequest ??= this._requestRun(record);
    const request = record.pendingRequest;
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
    const record = this._records.get(runId);
    const cardLoad = record?.cardLoad;
    if (!record || cardLoad?.status !== 'error' || !cardLoad.retryable) {
      return;
    }
    record.cardLoad = { status: 'queued' };
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
    for (const record of this._records.values()) {
      record.controller?.dispose();
    }
  }

  private _createRunLookup<T>(
    read: (record: RunRecord) => T | undefined,
  ): RunLookup<T> {
    const get = (runId: string): T | undefined => {
      const record = this._records.get(runId);
      return record ? read(record) : undefined;
    };
    return { get, has: (runId) => get(runId) !== undefined };
  }

  private _recordFor(runId: string): RunRecord {
    const existing = this._records.get(runId);
    if (existing) {
      return existing;
    }
    const record = new RunRecord(runId);
    this._records.set(runId, record);
    return record;
  }

  private _resolveRuns(runIds: string[]): ChainRun[] {
    return runIds.flatMap((runId) => {
      const run = this._records.get(runId)?.run;
      return run ? [run] : [];
    });
  }

  private _storeRun(
    runId: string,
    workflow: WorkflowExecution,
    startedEvent: HistoryEvent,
  ): ChainRun {
    const run = { runId, workflow, startedEvent };
    this._recordFor(runId).run = run;
    return run;
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

  private _fetchRun(runId: string): Promise<ChainRun> {
    const run = this._records.get(runId)?.run;
    if (run) {
      return Promise.resolve(run);
    }
    return this._refetchRun(runId);
  }

  private _refetchRun(runId: string): Promise<ChainRun> {
    const record = this._recordFor(runId);
    record.pendingFetch ??= this._hop(runId).finally(() => {
      record.pendingFetch = null;
    });
    return record.pendingFetch;
  }

  private async _hop(runId: string): Promise<ChainRun> {
    const [workflow, startedEvent] = await Promise.all([
      this._describe(runId),
      this._fetchStartedEvent(runId),
    ]);
    return this._storeRun(runId, workflow, startedEvent);
  }

  private _isInWindow(runId: string): boolean {
    return this._windowIds.includes(runId);
  }

  private _isDetached(runId: string): boolean {
    return this._detachedIds.includes(runId);
  }

  private async _requestRun(record: RunRecord): Promise<RequestedRun> {
    const loadingRequest: RequestedRun = { status: 'loading' };
    if (this._disposed) {
      return loadingRequest;
    }
    if (record.run) {
      record.request = { status: 'found', run: record.run };
      return record.request;
    }
    record.request = loadingRequest;
    let run: ChainRun;
    try {
      run = await this._fetchRun(record.runId);
    } catch (error) {
      if (this._disposed) {
        return loadingRequest;
      }
      record.request = isNotFound(error)
        ? { status: 'notFound' }
        : { status: 'failed', error: toChainError(error) };
      return record.request;
    }
    if (this._disposed) {
      return loadingRequest;
    }
    const firstRunId =
      run.workflow.firstRunId ??
      readStartedEvent(run.startedEvent).firstExecutionRunId;
    if (firstRunId && firstRunId !== this.identity.firstRunId) {
      record.request = { status: 'wrongChain', firstRunId };
      return record.request;
    }
    record.request = { status: 'found', run };
    return record.request;
  }

  private _showRequested(result: RequestedRun): void {
    if (this._disposed || result.status !== 'found') {
      return;
    }
    const { runId } = result.run;
    this._detachedCandidateId = runId;
    this._attachDetached();
    if (this.cardLoadOf(runId).status === 'queued') {
      this._startCard(runId);
    }
  }

  private _attachDetached(): void {
    const candidateId = this._detachedCandidateId;
    if (!candidateId || this._windowIds.length === 0 || this.walking) {
      return;
    }
    this._detachedCandidateId = null;
    if (
      candidateId !== this._prioritizedRunId ||
      this._isInWindow(candidateId) ||
      this._isDetached(candidateId)
    ) {
      return;
    }
    this._replaceDetached([candidateId]);
    this._checkDetachedOffPath(this.runs[0]);
  }

  private _replaceDetached(runIds: string[]): void {
    this._detachedIds = runIds;
    this.detachedBoundary = null;
    this.detachedOffPath = false;
    this.detachedWalking = false;
    this._failedSteps.delete('detachedWalkBack');
  }

  private _removeDetached(runId: string): void {
    const rest = this._detachedIds.filter((detachedId) => detachedId !== runId);
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
    this._windowIds = [...this._detachedIds, ...this._windowIds];
    this.boundary = this.detachedBoundary;
    this._replaceDetached([]);
    return this.boundary !== null;
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
        if (this._detachedIds.at(-1) === predecessor) {
          hop += this._detachedIds.length - 1;
          if (this._mergeDetached()) {
            return;
          }
          continue;
        }
        let run: ChainRun;
        try {
          run = await this._fetchRun(predecessor);
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
        this._windowIds = [run.runId, ...this._windowIds];
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
    const record = this._records.get(runId);
    if (
      this._disposed ||
      !record ||
      runId !== this._latestRunId ||
      record.closeHandled
    ) {
      return;
    }
    record.closeHandled = true;
    this._stopRefresh();
    this._failedSteps.delete('refresh');

    if (record.run?.workflow.isRunning) {
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
      run = await this._refetchRun(successorRunId);
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
    this._windowIds = [...this._windowIds, run.runId];
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
    return (
      runId === this._latestRunId && !this._records.get(runId)?.closeHandled
    );
  }

  private _applyWorkflow(runId: string, workflow: WorkflowExecution): void {
    const record = this._records.get(runId);
    if (!record) {
      return;
    }
    if (record.run) {
      record.run = { ...record.run, workflow };
    }
    record.controller?.updateWorkflow(workflow);
  }

  private get _queueGateRunId(): string | null {
    return this._prioritizedRunId ?? this._latestRunId;
  }

  private _syncQueueGate(): void {
    const runId = this._queueGateRunId;
    const record = runId ? this._records.get(runId) : undefined;
    const status = record?.cardLoad?.status;
    if (
      record &&
      (record.firstEventSeen || status === 'loaded' || status === 'error')
    ) {
      this._queue.release();
      return;
    }
    this._queue.hold();
  }

  private _enqueueCard(runId: string): void {
    const record = this._recordFor(runId);
    if (record.cardLoad) {
      return;
    }
    record.cardLoad = { status: 'queued' };
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
    const record = this._recordFor(runId);
    const controller = this._controllerFor(record);
    record.cardLoad = { status: 'loading' };
    try {
      await this._retry(async () => {
        const run = record.run;
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
      record.cardLoad = {
        status: 'error',
        error: toChainError(error),
        retryable: !isNotFound(error),
      };
      this._syncQueueGate();
      return;
    }
    if (this._disposed) {
      return;
    }
    record.cardLoad = { status: 'loaded' };
    this._syncQueueGate();
  }

  private _controllerFor(record: RunRecord): WorkflowHistoryController {
    if (record.controller) {
      return record.controller;
    }
    const { runId } = record;
    const { namespace, workflowId } = this.identity;
    const controller = this._client.createController(
      { namespace, workflowId, runId },
      {
        onClose: (closeEvent) => this._handleClose(runId, closeEvent),
        onFirstEvent: () => this._handleFirstEvent(runId),
      },
    );
    record.controller = controller;
    return controller;
  }

  private _handleFirstEvent(runId: string): void {
    if (this._disposed) {
      return;
    }
    this._recordFor(runId).firstEventSeen = true;
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
