import { createSubscriber } from 'svelte/reactivity';

import { untrack } from 'svelte';

import { EventMarkerGroupRepository } from './data/event-marker-groups/repository';
import type { EventMarkerGroup } from './data/event-marker-groups/types';
import type { ExecutionDetailsState } from './data/execution-details/types';
import { ExecutionGraphRepository } from './data/execution-graph/repository';
import type { ExecutionGraphSnapshot } from './data/execution-graph/types';
import { ExecutionHistoryRepository } from './data/execution-history/repository';
import type { ExecutionHistoryState } from './data/execution-history/types';
import { ExecutionLoader } from './data/execution-loading/execution-loader';
import { isTerminalExecutionEvent } from './data/history-events/is-terminal-execution-event';
import { HistoryEventRepository } from './data/history-events/repository';
import type { QualifiedHistoryEvent } from './data/history-events/types';
import { type ExecutionIdentity, getExecutionKey } from './data/identity-keys';
import { LifecycleGroupRepository } from './data/lifecycle-groups/repository';
import type { LifecycleGroup } from './data/lifecycle-groups/types';

import { useExecutionDetails } from './data/execution-details/use-execution-details.svelte';

/** Shared repositories and reactive data for one mounted workflow view. */
export type WorkflowView = Readonly<{
  executionGraphRepository: ExecutionGraphRepository;
  executionHistoryRepository: ExecutionHistoryRepository;
  historyEventRepository: HistoryEventRepository;
  eventMarkerGroupRepository: EventMarkerGroupRepository;
  lifecycleGroupRepository: LifecycleGroupRepository;
  requestExecution: (identity: ExecutionIdentity) => void;
  discoverExecution: (identity: ExecutionIdentity) => Promise<void>;
  refreshExecutionDetails: () => Promise<void>;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  executionDetails: ExecutionDetailsState;
  historyEvents: readonly QualifiedHistoryEvent[];
  eventMarkerGroups: readonly EventMarkerGroup[];
  lifecycleGroups: readonly LifecycleGroup[];
  executionGraph: ExecutionGraphSnapshot;
  executionHistories: readonly ExecutionHistoryState[];
}>;

/** Owns history loading and shared workflow indexes independently of the timeline. */
export function useWorkflowView(
  getIdentity: () => ExecutionIdentity,
): WorkflowView {
  let autoRefreshEnabled = $state(true);
  const executionDetails = useExecutionDetails(getIdentity);
  const executionGraphRepository = new ExecutionGraphRepository();
  const executionHistoryRepository = new ExecutionHistoryRepository();
  const historyEventRepository = new HistoryEventRepository();
  const eventMarkerGroupRepository = new EventMarkerGroupRepository();
  const lifecycleGroupRepository = new LifecycleGroupRepository();

  const subscribeToExecutionGraph = createSubscriber((update) =>
    executionGraphRepository.subscribe(update),
  );
  const subscribeToExecutionHistories = createSubscriber((update) =>
    executionHistoryRepository.subscribe(update),
  );
  const subscribeToHistoryEvents = createSubscriber((update) =>
    historyEventRepository.subscribe(update),
  );
  const subscribeToEventMarkerGroups = createSubscriber((update) =>
    eventMarkerGroupRepository.subscribe(update),
  );
  const subscribeToLifecycleGroups = createSubscriber((update) =>
    lifecycleGroupRepository.subscribe(update),
  );

  $effect(() => {
    const selectedExecutionKey = getExecutionKey(getIdentity());
    return historyEventRepository.subscribe(
      ({ events }) => {
        lifecycleGroupRepository.addEvents(events);
        eventMarkerGroupRepository.addEvents(events);
        executionGraphRepository.addEvents(events);
        if (
          events.some(
            (event) =>
              event.executionKey === selectedExecutionKey &&
              isTerminalExecutionEvent(event.eventType),
          )
        ) {
          untrack(() => void executionDetails.refresh());
        }
      },
      { emitCurrentSnapshot: true },
    );
  });

  let loader: ExecutionLoader | null = null;
  $effect(() => {
    const identity = getIdentity();
    const currentLoader = new ExecutionLoader(
      executionGraphRepository,
      executionHistoryRepository,
      historyEventRepository,
    );

    loader = currentLoader;
    const unsubscribeGraph = executionGraphRepository.subscribe(
      (notification) => {
        const executions =
          notification.type === 'EXECUTION_GRAPH_SNAPSHOT'
            ? notification.graph.executionsByKey.values()
            : notification.executions;
        currentLoader.addExecutions(executions);
      },
      { emitCurrentSnapshot: true },
    );
    const unsubscribeEvents = historyEventRepository.subscribe(
      ({ events }) => currentLoader.addEvents(events),
      { emitCurrentSnapshot: true },
    );
    currentLoader.setAutoRefreshEnabled(untrack(() => autoRefreshEnabled));
    currentLoader.start(identity);
    return () => {
      loader = null;
      unsubscribeGraph();
      unsubscribeEvents();
      currentLoader.dispose();
    };
  });

  return {
    executionGraphRepository,
    executionHistoryRepository,
    historyEventRepository,
    eventMarkerGroupRepository,
    lifecycleGroupRepository,
    requestExecution: (identity) => loader?.requestExecution(identity),
    discoverExecution: (identity) =>
      loader?.discoverExecution(identity) ?? Promise.resolve(),
    refreshExecutionDetails: () => executionDetails.refresh(),
    get autoRefreshEnabled() {
      return autoRefreshEnabled;
    },
    setAutoRefreshEnabled: (enabled) => {
      autoRefreshEnabled = enabled;
      loader?.setAutoRefreshEnabled(enabled);
    },
    get executionDetails() {
      return executionDetails.state;
    },
    get historyEvents() {
      subscribeToHistoryEvents();
      return historyEventRepository.getSnapshot();
    },
    get eventMarkerGroups() {
      subscribeToEventMarkerGroups();
      return eventMarkerGroupRepository.getSnapshot();
    },
    get lifecycleGroups() {
      subscribeToLifecycleGroups();
      return lifecycleGroupRepository.getSnapshot();
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
