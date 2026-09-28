import type { ExecutionGraphRepository } from './repository';
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

/** Coordinates history loading and polling for executions in the graph. */
export class ExecutionGraphCoordinator {
  private _initialLoads = new Map<ExecutionKey, AbortController>();
  private _activeStreams = new Map<ExecutionKey, AbortController>();
  private _terminalExecutions = new Set<ExecutionKey>();
  private _isDisposed = false;
  private _executionGraph: ExecutionGraphRepository;
  private _executionHistories: ExecutionHistoryRepository;
  private _historyEvents: HistoryEventRepository;
  private _unsubscribeGraph: () => void;
  private _unsubscribeEvents: () => void;

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
            ? notification.graph.executions
            : notification.executions;

        for (const execution of executions) {
          this._executionHistories.register(execution.identity);
        }
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

  /** Starts loading an execution, then polls it if no terminal event was seen. */
  start(identity: ExecutionIdentity): void {
    if (this._isDisposed) {
      return;
    }

    this._executionGraph.addExecution(identity);
    const executionHistory = this._executionHistories.startLoad(identity);

    if (!executionHistory) {
      return;
    }

    const controller = new AbortController();
    const executionKey = executionHistory.executionKey;
    this._initialLoads.set(executionKey, controller);
    void this._load(identity, executionKey, controller);
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
      }
    }
  }

  private _startStream(identity: ExecutionIdentity): void {
    const executionKey = getExecutionKey(identity);

    if (
      this._isDisposed ||
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

      this._executionHistories.stopStream(executionKey, cursor);
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

    for (const [executionKey, controller] of this._activeStreams) {
      controller.abort();
      const cursor =
        this._executionHistories.getExecutionHistory(executionKey)?.stream
          .cursor ?? '';
      this._executionHistories.stopStream(executionKey, cursor);
    }

    this._initialLoads.clear();
    this._activeStreams.clear();
  }
}
