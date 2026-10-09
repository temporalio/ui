import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';
import type { LifecycleGroup } from '../lifecycle-groups/types';

export type LifecycleGroupFilterKey = string;

/** A named predicate evaluated against a group's known events. */
export type LifecycleGroupFilterDefinition = Readonly<{
  key: LifecycleGroupFilterKey;
  matches: (
    lifecycleGroup: LifecycleGroup,
    getEvent: (eventId: HistoryEventId) => NormalizedHistoryEvent | undefined,
  ) => boolean;
}>;

/** A filter whose lifecycle group membership changed. */
export type LifecycleGroupFilterIndexProjectionChange = Readonly<{
  type: 'LIFECYCLE_GROUP_FILTER_INDEX_CHANGED';
  lifecycleGroupFilterKey: LifecycleGroupFilterKey;
}>;
