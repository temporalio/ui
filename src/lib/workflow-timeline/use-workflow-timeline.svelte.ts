import { createSubscriber } from 'svelte/reactivity';

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

type TimelineRepositories = Pick<
  WorkflowTimeline,
  | 'executionGraphRepository'
  | 'executionHistoryRepository'
  | 'historyEventRepository'
  | 'lifecycleGroupRepository'
  | 'timelineRowRepository'
>;

function connectRepositories({
  executionGraphRepository,
  historyEventRepository,
  lifecycleGroupRepository,
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

  return () => {
    unsubscribeLifecycleGroups();
    unsubscribeExecutionGraph();
    unsubscribeTimelineRows();
  };
}

function createReactiveTimeline({
  executionGraphRepository,
  executionHistoryRepository,
  historyEventRepository,
  lifecycleGroupRepository,
  timelineRowRepository,
}: TimelineRepositories): WorkflowTimeline {
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

/** Creates and connects the repositories for a mounted workflow timeline. */
export function useWorkflowTimeline(
  getIdentity: () => ExecutionIdentity,
): WorkflowTimeline {
  const repositories: TimelineRepositories = {
    executionGraphRepository: new ExecutionGraphRepository(),
    executionHistoryRepository: new ExecutionHistoryRepository(),
    historyEventRepository: new HistoryEventRepository(),
    lifecycleGroupRepository: new LifecycleGroupRepository(),
    timelineRowRepository: new TimelineRowRepository(),
  };

  $effect(() => connectRepositories(repositories));

  $effect(() => {
    const identity = getIdentity();
    const coordinator = new ExecutionGraphCoordinator(
      repositories.executionGraphRepository,
      repositories.executionHistoryRepository,
      repositories.historyEventRepository,
    );

    coordinator.start(identity);
    return () => coordinator.dispose();
  });

  return createReactiveTimeline(repositories);
}
