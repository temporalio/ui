import { getExecutionWorkPlan } from './get-execution-work-plan';
import type { ExecutionGraphRepository } from '../execution-graph/repository';
import type { ExecutionNode } from '../execution-graph/types';
import { discoverExecutionHistory } from '../execution-history/discover-execution-history';
import { loadExecutionHistory } from '../execution-history/load-execution-history';
import { pollExecutionHistory } from '../execution-history/poll-execution-history';
import type { ExecutionHistoryRepository } from '../execution-history/repository';
import { isTerminalExecutionEvent } from '../history-events/is-terminal-execution-event';
import type { HistoryEventRepository } from '../history-events/repository';
import type { QualifiedHistoryEvent } from '../history-events/types';
import {
  type ExecutionIdentity,
  type ExecutionKey,
  getExecutionKey,
} from '../identity-keys';

const MAX_CONCURRENT_INITIAL_LOADS = 4;
const MAX_CONCURRENT_DISCOVERIES = 4;

/** Schedules execution discovery, history loading, and polling using shared repositories. */
export class ExecutionLoader {
  private _initialLoads = new Map<ExecutionKey, AbortController>();
  private _discoveries = new Map<
    ExecutionKey,
    { controller: AbortController; promise: Promise<void> }
  >();
  private _activeStreams = new Map<ExecutionKey, AbortController>();
  private _terminalExecutions = new Set<ExecutionKey>();
  private _requestedExecutionKeys = new Set<ExecutionKey>();
  private _isDisposed = false;
  private _autoRefreshEnabled = true;
  private _executionGraph: ExecutionGraphRepository;
  private _executionHistories: ExecutionHistoryRepository;
  private _historyEvents: HistoryEventRepository;

  private _rootExecutionKey: ExecutionKey | null = null;

  /** Stores shared repositories without subscribing or starting requests. */
  constructor(
    executionGraph: ExecutionGraphRepository,
    executionHistories: ExecutionHistoryRepository,
    historyEvents: HistoryEventRepository,
  ) {
    this._executionGraph = executionGraph;
    this._executionHistories = executionHistories;
    this._historyEvents = historyEvents;
  }

  /** Registers history state for graph executions and schedules eligible work. */
  addExecutions(executions: Iterable<ExecutionNode>): void {
    if (this._isDisposed) return;

    for (const execution of executions) {
      this._executionHistories.register(execution.identity);
    }

    this._scheduleWork();
  }

  /** Records discovery completion and stops polling executions with terminal events. */
  addEvents(events: readonly QualifiedHistoryEvent[]): void {
    if (this._isDisposed) return;

    for (const event of events) {
      if (
        event.eventType === 'WorkflowExecutionStarted' &&
        event.eventId === '1' &&
        event.workflowExecutionStartedEventAttributes
      ) {
        this._executionHistories.completeDiscovery(event.executionKey);
      }

      if (!isTerminalExecutionEvent(event.eventType)) {
        continue;
      }

      this._terminalExecutions.add(event.executionKey);
      this._activeStreams.get(event.executionKey)?.abort();
    }
  }

  /** Registers the root execution and schedules eligible discovery, loading, and polling. */
  start(identity: ExecutionIdentity): void {
    if (this._isDisposed) {
      return;
    }

    this._rootExecutionKey = getExecutionKey(identity);
    this._executionGraph.addExecution(identity);
    this._scheduleWork();
  }

  /** Adds a known execution to the full-history loading candidates. */
  requestExecution(identity: ExecutionIdentity): void {
    const key = getExecutionKey(identity);
    if (
      this._isDisposed ||
      !this._rootExecutionKey ||
      this._requestedExecutionKeys.has(key) ||
      !this._executionGraph.getExecution(key)
    ) {
      return;
    }

    this._requestedExecutionKeys.add(key);
    this._scheduleWork();
  }

  /** Discovers a known execution's predecessor, reusing active requests or retrying failed discovery. */
  discoverExecution(identity: ExecutionIdentity): Promise<void> {
    const key = getExecutionKey(identity);
    if (
      this._isDisposed ||
      !this._rootExecutionKey ||
      !this._executionGraph.getExecution(key)
    ) {
      return Promise.resolve();
    }

    const existing = this._discoveries.get(key);
    if (existing) {
      return existing.promise;
    }

    if (!this._executionHistories.startDiscovery(identity)) {
      return Promise.resolve();
    }

    const controller = new AbortController();
    const promise = Promise.resolve().then(() =>
      this._discover(identity, key, controller),
    );

    this._discoveries.set(key, { controller, promise });

    return promise;
  }

  private async _discover(
    identity: ExecutionIdentity,
    executionKey: ExecutionKey,
    controller: AbortController,
  ): Promise<void> {
    try {
      await discoverExecutionHistory({
        identity,
        historyEvents: this._historyEvents,
        signal: controller.signal,
      });
      if (
        !controller.signal.aborted &&
        this._discoveries.get(executionKey)?.controller === controller
      ) {
        this._executionHistories.completeDiscovery(executionKey);
      }
    } catch {
      if (
        !controller.signal.aborted &&
        this._discoveries.get(executionKey)?.controller === controller
      ) {
        this._executionHistories.failDiscovery(executionKey);
      }
    } finally {
      if (this._discoveries.get(executionKey)?.controller === controller) {
        this._discoveries.delete(executionKey);
        this._scheduleWork();
      }
    }
  }

  private _cancelDiscovery(executionKey: ExecutionKey): void {
    const discovery = this._discoveries.get(executionKey);
    if (!discovery) {
      return;
    }

    discovery.controller.abort();
    this._discoveries.delete(executionKey);
    this._executionHistories.cancelDiscovery(executionKey);
  }

  /** Enables or stops live polling without interrupting initial history loads. */
  setAutoRefreshEnabled(enabled: boolean): void {
    if (this._isDisposed || this._autoRefreshEnabled === enabled) return;

    this._autoRefreshEnabled = enabled;
    if (!enabled) {
      this._stopStreams();
      return;
    }

    this._scheduleWork();
  }

  private _stopStreams(): void {
    for (const [executionKey, controller] of this._activeStreams) {
      controller.abort();
      const cursor =
        this._executionHistories.getExecutionHistory(executionKey)?.stream
          .cursor ?? '';
      this._executionHistories.stopStream(executionKey, cursor);
    }
    this._activeStreams.clear();
  }

  private _getWorkPlan(rootExecutionKey: ExecutionKey) {
    return getExecutionWorkPlan({
      graph: this._executionGraph.getSnapshot(),
      histories: this._executionHistories.getSnapshot(),
      rootExecutionKey,
      requestedExecutionKeys: this._requestedExecutionKeys,
      terminalExecutionKeys: this._terminalExecutions,
      autoRefreshEnabled: this._autoRefreshEnabled,
    });
  }

  private _scheduleWork(): void {
    if (this._isDisposed || !this._rootExecutionKey) {
      return;
    }

    const plan = this._getWorkPlan(this._rootExecutionKey);

    for (const execution of plan.load) {
      if (this._initialLoads.size >= MAX_CONCURRENT_INITIAL_LOADS) {
        break;
      }

      const started = this._executionHistories.startLoad(execution.identity);

      if (!started) {
        continue;
      }

      this._cancelDiscovery(started.executionKey);
      const controller = new AbortController();
      this._initialLoads.set(started.executionKey, controller);
      void this._load(execution.identity, started.executionKey, controller);
    }

    const updatedPlan = this._getWorkPlan(this._rootExecutionKey);
    for (const execution of updatedPlan.discover) {
      if (this._discoveries.size >= MAX_CONCURRENT_DISCOVERIES) {
        break;
      }

      void this.discoverExecution(execution.identity);
    }

    for (const execution of updatedPlan.poll) {
      this._startStream(execution.identity);
    }
  }

  private async _load(
    identity: ExecutionIdentity,
    executionKey: ExecutionKey,
    controller: AbortController,
  ): Promise<void> {
    try {
      const stats = await loadExecutionHistory({
        identity,
        historyEvents: this._historyEvents,
        signal: controller.signal,
        onProgress: (progress) => {
          if (!controller.signal.aborted) {
            this._executionHistories.updateLoadProgress(executionKey, progress);
          }
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      this._executionHistories.completeLoad(executionKey, stats);
    } catch {
      if (!controller.signal.aborted) {
        this._executionHistories.failLoad(executionKey);
      }
    } finally {
      if (this._initialLoads.get(executionKey) === controller) {
        this._initialLoads.delete(executionKey);
        this._scheduleWork();
      }
    }
  }

  private _startStream(identity: ExecutionIdentity): void {
    const executionKey = getExecutionKey(identity);

    if (
      this._isDisposed ||
      !this._autoRefreshEnabled ||
      this._terminalExecutions.has(executionKey) ||
      this._activeStreams.has(executionKey)
    ) {
      return;
    }

    const executionHistory = this._executionHistories.startStream(executionKey);

    if (!executionHistory) {
      return;
    }

    const controller = new AbortController();
    this._activeStreams.set(executionKey, controller);
    void this._poll(
      identity,
      executionKey,
      controller,
      executionHistory.stream.cursor,
    );
  }

  private async _poll(
    identity: ExecutionIdentity,
    executionKey: ExecutionKey,
    controller: AbortController,
    startCursor: string,
  ): Promise<void> {
    try {
      const cursor = await pollExecutionHistory({
        identity,
        historyEvents: this._historyEvents,
        signal: controller.signal,
        startCursor,
        onCursorChange: (nextCursor) => {
          if (!controller.signal.aborted) {
            this._executionHistories.updateStreamCursor(
              executionKey,
              nextCursor,
            );
          }
        },
        onStatusChange: (status) => {
          if (controller.signal.aborted) {
            return;
          }

          if (status === 'retrying') {
            this._executionHistories.markStreamRetrying(executionKey);
          } else {
            this._executionHistories.markStreamPolling(executionKey);
          }
        },
      });

      if (this._activeStreams.get(executionKey) === controller) {
        this._executionHistories.stopStream(executionKey, cursor);
      }
    } finally {
      if (this._activeStreams.get(executionKey) === controller) {
        this._activeStreams.delete(executionKey);
      }
    }
  }

  /** Aborts outstanding discovery, history-loading, and polling requests. */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;

    for (const controller of this._initialLoads.values()) {
      controller.abort();
    }

    for (const executionKey of this._discoveries.keys()) {
      this._cancelDiscovery(executionKey);
    }

    this._stopStreams();
    this._initialLoads.clear();
  }
}
