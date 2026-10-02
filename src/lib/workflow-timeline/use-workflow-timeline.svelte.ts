import { createSubscriber } from 'svelte/reactivity';

import { ExecutionGraphCoordinator } from './data/execution-graph/coordinator';
import { ExecutionGraphRepository } from './data/execution-graph/repository';
import type { ExecutionGraphSnapshot } from './data/execution-graph/types';
import { ExecutionHistoryRepository } from './data/execution-history/repository';
import type { ExecutionHistoryState } from './data/execution-history/types';
import { HistoryEventRepository } from './data/history-events/repository';
import type { QualifiedHistoryEvent } from './data/history-events/types';
import type { ExecutionIdentity, LifecycleKey } from './data/identity-keys';
import { LifecycleFilterRepository } from './data/lifecycle-group-filters/repository';
import type {
  LifecycleFilterDefinition,
  LifecycleFilterQuery,
} from './data/lifecycle-group-filters/types';
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
  lifecycleFilterRepository: LifecycleFilterRepository;
  timelineRowRepository: TimelineRowRepository;
  requestExecution: (identity: ExecutionIdentity) => void;
  getQuerySnapshot: (query: LifecycleFilterQuery) => readonly LifecycleKey[];
  historyEvents: readonly QualifiedHistoryEvent[];
  lifecycleGroups: readonly LifecycleGroup[];
  timelineRows: readonly TimelineEventRow[];
  executionGraph: ExecutionGraphSnapshot;
  executionHistories: readonly ExecutionHistoryState[];
}>;

type TimelineRepositories = Pick<
  WorkflowTimeline,
  | 'executionGraphRepository'
  | 'executionHistoryRepository'
  | 'historyEventRepository'
  | 'lifecycleGroupRepository'
  | 'lifecycleFilterRepository'
  | 'timelineRowRepository'
>;

function connectRepositories({
  executionGraphRepository,
  historyEventRepository,
  lifecycleGroupRepository,
  lifecycleFilterRepository,
  timelineRowRepository,
}: TimelineRepositories): () => void {
  const unsubscribeLifecycleGroups = historyEventRepository.subscribe(
    (notification) => lifecycleGroupRepository.addEvents(notification.events),
    { emitCurrentSnapshot: true },
  );
  const unsubscribeExecutionGraph = historyEventRepository.subscribe(
    (notification) => executionGraphRepository.addEvents(notification.events),
    { emitCurrentSnapshot: true },
  );
  const unsubscribeTimelineRows = lifecycleGroupRepository.subscribe(
    (notification) =>
      timelineRowRepository.upsertGroups(notification.groups, (eventKey) =>
        historyEventRepository.getEvent(eventKey),
      ),
    { emitCurrentSnapshot: true },
  );

  const unsubscribeLifecycleFilters = lifecycleGroupRepository.subscribe(
    (notification) =>
      lifecycleFilterRepository.upsertGroups(notification.groups),
    { emitCurrentSnapshot: true },
  );

  return () => {
    unsubscribeLifecycleFilters();
    unsubscribeLifecycleGroups();
    unsubscribeExecutionGraph();
    unsubscribeTimelineRows();
  };
}

function createReactiveTimeline(
  {
    executionGraphRepository,
    executionHistoryRepository,
    historyEventRepository,
    lifecycleGroupRepository,
    lifecycleFilterRepository,
    timelineRowRepository,
  }: TimelineRepositories,
  requestExecution: (identity: ExecutionIdentity) => void,
): WorkflowTimeline {
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
  const querySubscribers = new WeakMap<
    LifecycleFilterQuery,
    ReturnType<typeof createSubscriber>
  >();
  const subscribeToTimelineRows = createSubscriber((update) =>
    timelineRowRepository.subscribe(update),
  );

  return {
    executionGraphRepository,
    executionHistoryRepository,
    historyEventRepository,
    lifecycleGroupRepository,
    lifecycleFilterRepository,
    timelineRowRepository,
    requestExecution,
    /** Returns a query snapshot with reactive membership updates. */
    getQuerySnapshot(query) {
      let subscribe = querySubscribers.get(query);
      if (!subscribe) {
        subscribe = createSubscriber((update) =>
          lifecycleFilterRepository.subscribeQuery(query, update),
        );
        querySubscribers.set(query, subscribe);
      }
      subscribe();
      return lifecycleFilterRepository.getQuerySnapshot(query);
    },
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

/** Creates and connects the repositories for a mounted workflow timeline. */
export function useWorkflowTimeline(
  getIdentity: () => ExecutionIdentity,
  filters: readonly LifecycleFilterDefinition[] = [],
): WorkflowTimeline {
  const historyEventRepository = new HistoryEventRepository();
  const repositories: TimelineRepositories = {
    executionGraphRepository: new ExecutionGraphRepository(),
    executionHistoryRepository: new ExecutionHistoryRepository(),
    historyEventRepository,
    lifecycleGroupRepository: new LifecycleGroupRepository(),
    lifecycleFilterRepository: new LifecycleFilterRepository(
      filters,
      (eventKey) => historyEventRepository.getEvent(eventKey),
    ),
    timelineRowRepository: new TimelineRowRepository(),
  };

  let coordinator: ExecutionGraphCoordinator | null = null;
  $effect(() => connectRepositories(repositories));

  $effect(() => {
    const identity = getIdentity();
    const currentCoordinator = new ExecutionGraphCoordinator(
      repositories.executionGraphRepository,
      repositories.executionHistoryRepository,
      repositories.historyEventRepository,
    );

    coordinator = currentCoordinator;
    currentCoordinator.start(identity);
    return () => {
      coordinator = null;
      currentCoordinator.dispose();
    };
  });

  return createReactiveTimeline(repositories, (identity) =>
    coordinator?.requestExecution(identity),
  );
}
