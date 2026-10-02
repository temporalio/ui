import { getEagerExecutions } from './get-eager-executions';
import type { ExecutionGraphRepository } from './repository';
import type { ExecutionGraphSnapshot, ExecutionNode } from './types';
import { loadExecutionHistory } from '../execution-history/load-execution-history';
import { pollExecutionHistory } from '../execution-history/poll-execution-history';
import type { ExecutionHistoryRepository } from '../execution-history/repository';
import { isTerminalExecutionEvent } from '../history-events/is-terminal-execution-event';
import type { HistoryEventRepository } from '../history-events/repository';
import {
  type ExecutionIdentity,
  type ExecutionKey,
  getExecutionKey,
} from '../identity-keys';

const MAX_CONCURRENT_INITIAL_LOADS = 4;

/** Coordinates history loading and polling for executions in the graph. */
export class ExecutionGraphCoordinator {
  private _initialLoads = new Map<ExecutionKey, AbortController>();
  private _activeStreams = new Map<ExecutionKey, AbortController>();
  private _terminalExecutions = new Set<ExecutionKey>();
  private _requestedExecutionKeys = new Set<ExecutionKey>();
  private _isDisposed = false;
  private _autoRefreshEnabled = true;
  private _executionGraph: ExecutionGraphRepository;
  private _executionHistories: ExecutionHistoryRepository;
  private _historyEvents: HistoryEventRepository;
  private _unsubscribeGraph: () => void;
  private _unsubscribeEvents: () => void;
  private _rootExecutionKey: ExecutionKey | null = null;
  private _eligibleExecutionsCache: Readonly<{
    graph: ExecutionGraphSnapshot;
    rootExecutionKey: ExecutionKey;
    executions: readonly ExecutionNode[];
  }> | null = null;

  constructor(
    executionGraph: ExecutionGraphRepository,
    executionHistories: ExecutionHistoryRepository,
    historyEvents: HistoryEventRepository,
  ) {
    this._executionGraph = executionGraph;
    this._executionHistories = executionHistories;
    this._historyEvents = historyEvents;

    this._unsubscribeGraph = this._executionGraph.subscribe(
      (notification) => {
        const executions =
          notification.type === 'EXECUTION_GRAPH_SNAPSHOT'
            ? notification.graph.executionsByKey.values()
            : notification.executions;

        for (const execution of executions) {
          this._executionHistories.register(execution.identity);
        }

        this._loadEligibleExecutions();
      },
      { emitCurrentSnapshot: true },
    );

    this._unsubscribeEvents = this._historyEvents.subscribe(
      (notification) => {
        for (const event of notification.events) {
          if (!isTerminalExecutionEvent(event.eventType)) {
            continue;
          }

          this._terminalExecutions.add(event.executionKey);
          this._activeStreams.get(event.executionKey)?.abort();
        }
      },
      { emitCurrentSnapshot: true },
    );
  }

  /** Registers the root execution and begins loading eligible graph histories. */
  start(identity: ExecutionIdentity): void {
    if (this._isDisposed) {
      return;
    }

    this._rootExecutionKey = getExecutionKey(identity);
    this._executionGraph.addExecution(identity);
    this._loadEligibleExecutions();
  }

  /** Schedules a discovered execution when its row becomes visible. */
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
    this._eligibleExecutionsCache = null;
    this._loadEligibleExecutions();
  }

  /** Enables or stops live polling without interrupting initial history loads. */
  setAutoRefreshEnabled(enabled: boolean): void {
    if (this._isDisposed || this._autoRefreshEnabled === enabled) return;

    this._autoRefreshEnabled = enabled;
    if (!enabled) {
      this._stopStreams();
      return;
    }

    if (!this._rootExecutionKey) return;
    for (const execution of this._getEligibleExecutions(
      this._rootExecutionKey,
    )) {
      const history = this._executionHistories.getExecutionHistory(
        execution.executionKey,
      );
      if (history?.load.status === 'loaded') {
        this._startStream(execution.identity);
      }
    }
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

  private _getEligibleExecutions(
    rootExecutionKey: ExecutionKey,
  ): readonly ExecutionNode[] {
    const graph = this._executionGraph.getSnapshot();
    const cache = this._eligibleExecutionsCache;

    if (cache?.graph === graph && cache.rootExecutionKey === rootExecutionKey) {
      return cache.executions;
    }

    const eligibleByKey = new Map(
      getEagerExecutions(graph, rootExecutionKey).map((execution) => [
        execution.executionKey,
        execution,
      ]),
    );
    for (const key of this._requestedExecutionKeys) {
      const execution = graph.executionsByKey.get(key);
      if (execution) eligibleByKey.set(key, execution);
    }
    const executions = [...eligibleByKey.values()];
    this._eligibleExecutionsCache = { graph, rootExecutionKey, executions };
    return executions;
  }

  private _loadEligibleExecutions(): void {
    if (this._isDisposed || !this._rootExecutionKey) {
      return;
    }

    const eligible = this._getEligibleExecutions(this._rootExecutionKey);

    for (const execution of eligible) {
      if (this._initialLoads.size >= MAX_CONCURRENT_INITIAL_LOADS) {
        break;
      }

      const history = this._executionHistories.getExecutionHistory(
        execution.executionKey,
      );

      if (history?.load.status !== 'pending') {
        continue;
      }

      const started = this._executionHistories.startLoad(execution.identity);

      if (!started) {
        continue;
      }

      const controller = new AbortController();
      this._initialLoads.set(started.executionKey, controller);
      void this._load(execution.identity, started.executionKey, controller);
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

      if (!this._terminalExecutions.has(executionKey)) {
        this._startStream(identity);
      }
    } catch {
      if (!controller.signal.aborted) {
        this._executionHistories.failLoad(executionKey);
      }
    } finally {
      if (this._initialLoads.get(executionKey) === controller) {
        this._initialLoads.delete(executionKey);
        this._loadEligibleExecutions();
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

  /** Aborts outstanding requests and releases repository subscriptions. */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;
    this._unsubscribeGraph();
    this._unsubscribeEvents();

    for (const controller of this._initialLoads.values()) {
      controller.abort();
    }

    this._stopStreams();
    this._initialLoads.clear();
  }
}
