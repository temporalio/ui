import { createSubscriber } from 'svelte/reactivity';

import { EventMarkerGroupRepository } from './data/event-marker-groups/repository';
import type { EventMarkerGroup } from './data/event-marker-groups/types';
import type { ExecutionDetailsState } from './data/execution-details/types';
import { ExecutionGraphCoordinator } from './data/execution-graph/coordinator';
import { ExecutionGraphRepository } from './data/execution-graph/repository';
import type { ExecutionGraphSnapshot } from './data/execution-graph/types';
import { ExecutionHistoryRepository } from './data/execution-history/repository';
import type { ExecutionHistoryState } from './data/execution-history/types';
import { HistoryEventRepository } from './data/history-events/repository';
import type { QualifiedHistoryEvent } from './data/history-events/types';
import type { ExecutionIdentity } from './data/identity-keys';
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
  refreshExecutionDetails: () => Promise<void>;
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

  $effect(() =>
    historyEventRepository.subscribe(
      ({ events }) => {
        lifecycleGroupRepository.addEvents(events);
        eventMarkerGroupRepository.addEvents(events);
        executionGraphRepository.addEvents(events);
      },
      { emitCurrentSnapshot: true },
    ),
  );

  let coordinator: ExecutionGraphCoordinator | null = null;
  $effect(() => {
    const identity = getIdentity();
    const currentCoordinator = new ExecutionGraphCoordinator(
      executionGraphRepository,
      executionHistoryRepository,
      historyEventRepository,
    );

    coordinator = currentCoordinator;
    currentCoordinator.start(identity);
    return () => {
      coordinator = null;
      currentCoordinator.dispose();
    };
  });

  return {
    executionGraphRepository,
    executionHistoryRepository,
    historyEventRepository,
    eventMarkerGroupRepository,
    lifecycleGroupRepository,
    requestExecution: (identity) => coordinator?.requestExecution(identity),
    refreshExecutionDetails: () => executionDetails.refresh(),
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
