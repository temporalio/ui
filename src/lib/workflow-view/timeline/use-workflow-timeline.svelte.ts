import { createSubscriber } from 'svelte/reactivity';

import type { LifecycleKey } from '../data/identity-keys';
import { LifecycleFilterRepository } from '../data/lifecycle-group-filters/repository';
import type {
  LifecycleFilterDefinition,
  LifecycleFilterQuery,
} from '../data/lifecycle-group-filters/types';
import type { WorkflowView } from '../use-workflow-view.svelte';
import { TimelineRowRepository } from './scene/timeline-rows/repository';
import type { TimelineEventRow } from './scene/timeline-rows/types';

/** Presentation repositories and reactive state owned by one mounted timeline. */
export type WorkflowTimeline = Readonly<{
  lifecycleFilterRepository: LifecycleFilterRepository;
  timelineRowRepository: TimelineRowRepository;
  getQuerySnapshot: (query: LifecycleFilterQuery) => readonly LifecycleKey[];
  timelineRows: readonly TimelineEventRow[];
}>;

/** Derives timeline rows and filters from shared workflow data. */
export function useWorkflowTimeline(
  workflowView: WorkflowView,
  filters: readonly LifecycleFilterDefinition[] = [],
): WorkflowTimeline {
  const timelineRowRepository = new TimelineRowRepository();
  const getEvent = workflowView.historyEventRepository.getEvent.bind(
    workflowView.historyEventRepository,
  );
  const lifecycleFilterRepository = new LifecycleFilterRepository(
    filters,
    getEvent,
  );

  $effect(() =>
    workflowView.lifecycleGroupRepository.subscribe(
      ({ groups }) => {
        timelineRowRepository.upsertGroups(groups, getEvent);
        lifecycleFilterRepository.upsertGroups(groups);
      },
      { emitCurrentSnapshot: true },
    ),
  );

  const subscribeToTimelineRows = createSubscriber((update) =>
    timelineRowRepository.subscribe(update),
  );
  const querySubscribers = new WeakMap<
    LifecycleFilterQuery,
    ReturnType<typeof createSubscriber>
  >();

  return {
    lifecycleFilterRepository,
    timelineRowRepository,
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
    get timelineRows() {
      subscribeToTimelineRows();
      return timelineRowRepository.getSnapshot();
    },
  };
}
