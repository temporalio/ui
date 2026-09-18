import { createSubscriber } from 'svelte/reactivity';

import { ExecutionGraphRepository } from './data/execution-graph/repository';
import type { ExecutionGraphSnapshot } from './data/execution-graph/types';
import { loadExecutionHistory } from './data/execution-history/load-execution-history';
import { ExecutionHistoryRepository } from './data/execution-history/repository';
import type { ExecutionHistoryState } from './data/execution-history/types';
import { HistoryEventRepository } from './data/history-events/repository';
import type { QualifiedHistoryEvent } from './data/history-events/types';
import type {
  EventKey,
  ExecutionIdentity,
  ExecutionKey,
} from './data/identity-keys';
import { LifecycleGroupRepository } from './data/lifecycle-groups/repository';
import type { LifecycleGroup } from './data/lifecycle-groups/types';
import { TimelineRowRepository } from './scene/timeline-rows/repository';
import type { TimelineEventRow } from './scene/timeline-rows/types';

/** Reactive state and repositories owned by one mounted workflow timeline. */
export type WorkflowTimeline = Readonly<{
  executionGraphRepository: ExecutionGraphRepository;
  executionHistoryRepository: ExecutionHistoryRepository;
  historyEventRepository: HistoryEventRepository;
  lifecycleGroupRepository: LifecycleGroupRepository;
  timelineRowRepository: TimelineRowRepository;
  historyEvents: readonly QualifiedHistoryEvent[];
  lifecycleGroups: readonly LifecycleGroup[];
  timelineRows: readonly TimelineEventRow[];
  executionGraph: ExecutionGraphSnapshot;
  executionHistories: readonly ExecutionHistoryState[];
}>;

/** Creates and connects the repositories for a mounted workflow timeline. */
export function useWorkflowTimeline(
  getIdentity: () => ExecutionIdentity,
): WorkflowTimeline {
  const executionGraphRepository = new ExecutionGraphRepository();
  const executionHistoryRepository = new ExecutionHistoryRepository();
  const historyEventRepository = new HistoryEventRepository();
  const lifecycleGroupRepository = new LifecycleGroupRepository();
  const timelineRowRepository = new TimelineRowRepository();
  const activeLoads: {
    executionKey: ExecutionKey;
    controller: AbortController;
  }[] = [];
  const getHistoryEvent = (eventKey: EventKey) =>
    historyEventRepository.getEvent(eventKey);

  const subscribeToExecutionGraph = createSubscriber((update) =>
    executionGraphRepository.subscribe(update),
  );
  const subscribeToExecutionHistories = createSubscriber((update) =>
    executionHistoryRepository.subscribe(update),
  );
  const subscribeToHistoryEvents = createSubscriber((update) =>
    historyEventRepository.subscribe(update),
  );
  const subscribeToLifecycleGroups = createSubscriber((update) =>
    lifecycleGroupRepository.subscribe(update),
  );
  const subscribeToTimelineRows = createSubscriber((update) =>
    timelineRowRepository.subscribe(update),
  );

  function abortActiveLoads(): void {
    for (const activeLoad of activeLoads) {
      activeLoad.controller.abort();
    }

    activeLoads.length = 0;
  }

  async function loadHistory(identity: ExecutionIdentity): Promise<void> {
    const executionHistory = executionHistoryRepository.startLoad(identity);

    if (!executionHistory) {
      return;
    }

    const controller = new AbortController();
    activeLoads.push({
      executionKey: executionHistory.executionKey,
      controller,
    });

    try {
      const stats = await loadExecutionHistory({
        identity,
        historyEvents: historyEventRepository,
        signal: controller.signal,
        onProgress: (progress) => {
          if (!controller.signal.aborted) {
            executionHistoryRepository.updateLoadProgress(
              executionHistory.executionKey,
              progress,
            );
          }
        },
      });

      if (!controller.signal.aborted) {
        executionHistoryRepository.completeLoad(
          executionHistory.executionKey,
          stats,
        );
      }
    } catch {
      if (!controller.signal.aborted) {
        executionHistoryRepository.failLoad(executionHistory.executionKey);
      }
    } finally {
      const activeLoadIndex = activeLoads.findIndex(
        (activeLoad) =>
          activeLoad.executionKey === executionHistory.executionKey &&
          activeLoad.controller === controller,
      );

      if (activeLoadIndex >= 0) {
        activeLoads.splice(activeLoadIndex, 1);
      }
    }
  }

  $effect(() => {
    return historyEventRepository.subscribe(
      (notification) => {
        lifecycleGroupRepository.addEvents(notification.events);
      },
      { emitCurrentSnapshot: true },
    );
  });

  $effect(() => {
    return historyEventRepository.subscribe(
      (notification) => {
        executionGraphRepository.addEvents(notification.events);
      },
      { emitCurrentSnapshot: true },
    );
  });

  $effect(() => {
    return lifecycleGroupRepository.subscribe(
      (notification) => {
        timelineRowRepository.upsertGroups(
          notification.groups,
          getHistoryEvent,
        );
      },
      { emitCurrentSnapshot: true },
    );
  });

  $effect(() => {
    return executionGraphRepository.subscribe(
      (notification) => {
        const executions =
          notification.type === 'EXECUTION_GRAPH_SNAPSHOT'
            ? notification.graph.executions
            : notification.executions;

        for (const execution of executions) {
          executionHistoryRepository.register(execution.identity);
        }
      },
      { emitCurrentSnapshot: true },
    );
  });

  $effect(() => {
    const identity = getIdentity();

    executionGraphRepository.addExecution(identity);
    void loadHistory(identity);

    return abortActiveLoads;
  });

  return {
    executionGraphRepository,
    executionHistoryRepository,
    historyEventRepository,
    lifecycleGroupRepository,
    timelineRowRepository,
    get historyEvents() {
      subscribeToHistoryEvents();
      return historyEventRepository.getSnapshot();
    },
    get lifecycleGroups() {
      subscribeToLifecycleGroups();
      return lifecycleGroupRepository.getSnapshot();
    },
    get timelineRows() {
      subscribeToTimelineRows();
      return timelineRowRepository.getSnapshot();
    },
    get executionGraph() {
      subscribeToExecutionGraph();
      return executionGraphRepository.getSnapshot();
    },
    get executionHistories() {
      subscribeToExecutionHistories();
      return executionHistoryRepository.getSnapshot();
    },
  };
}
