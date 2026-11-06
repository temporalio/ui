import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';
import type { LifecycleGroup } from '../lifecycle-groups/types';
import type { WorkflowExecutionDetails } from '../workflow-execution/types';

export type LifecycleGroupFilterKey = string;

/** A named predicate whose inputs are determined by its details dependency. */
export type LifecycleGroupFilterDefinition =
  | Readonly<{
      key: LifecycleGroupFilterKey;
      dependsOnExecutionDetails?: false;
      matches: (
        lifecycleGroup: LifecycleGroup,
        getEvent: (
          eventId: HistoryEventId,
        ) => NormalizedHistoryEvent | undefined,
      ) => boolean;
    }>
  | Readonly<{
      key: LifecycleGroupFilterKey;
      dependsOnExecutionDetails: true;
      matches: (
        lifecycleGroup: LifecycleGroup,
        getEvent: (
          eventId: HistoryEventId,
        ) => NormalizedHistoryEvent | undefined,
        details: WorkflowExecutionDetails | null,
      ) => boolean;
    }>;

/** A filter whose lifecycle group membership changed. */
export type LifecycleGroupFilterIndexProjectionChange = Readonly<{
  type: 'LIFECYCLE_GROUP_FILTER_INDEX_CHANGED';
  lifecycleGroupFilterKey: LifecycleGroupFilterKey;
}>;
