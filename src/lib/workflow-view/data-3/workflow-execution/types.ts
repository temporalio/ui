import type {
  PendingActivityInfo,
  PendingNexusOperation,
} from '$lib/types/events';
import type { WorkflowExecutionAPIResponse } from '$lib/types/workflows';

import type {
  EventGroupMarkerGroupsProjectionChange,
  EventGroupMarkerKey,
} from '../event-group-markers/types';
import type { HistoryEventId } from '../history-events/types';
import type {
  LifecycleGroupFilterIndexProjectionChange,
  LifecycleGroupFilterKey,
} from '../lifecycle-group-filter-indexes/types';
import type { LifecycleGroupsProjectionChange } from '../lifecycle-groups/types';
export type WorkflowExecutionIdentity = Readonly<{
  namespace: string;
  workflowId: string;
  runId: string;
}>;

export type WorkflowExecutionKey = `workflow-execution:(${string})`;

/** A replaceable DescribeWorkflowExecution snapshot, separate from history. */
export type WorkflowExecutionDetails = Readonly<
  Omit<
    WorkflowExecutionAPIResponse,
    'pendingActivities' | 'pendingNexusOperations'
  > & {
    pendingActivitiesByActivityId: ReadonlyMap<string, PendingActivityInfo>;
    pendingNexusOperationsByHeadEventId: ReadonlyMap<
      HistoryEventId,
      PendingNexusOperation
    >;
  }
>;

/** An individual change produced while ingesting a history event. */
export type WorkflowExecutionChange =
  | Readonly<{
      type: 'EVENT_ADDED';
      eventId: HistoryEventId;
    }>
  | LifecycleGroupsProjectionChange
  | EventGroupMarkerGroupsProjectionChange
  | LifecycleGroupFilterIndexProjectionChange;

/** Consolidated batch payloads for each execution subscription topic. */
export type NotificationByTopic = {
  EXECUTION_DETAILS_CHANGED: Readonly<{
    details: WorkflowExecutionDetails;
  }>;
  LIFECYCLE_GROUP_FILTER_INDEXES_CHANGED: Readonly<{
    lifecycleGroupFilterKeys: readonly LifecycleGroupFilterKey[];
  }>;
  EVENTS_ADDED: Readonly<{
    eventIds: readonly HistoryEventId[];
  }>;
  LIFECYCLE_GROUPS_CHANGED: Readonly<{
    headEventIds: readonly HistoryEventId[];
  }>;

  EVENT_GROUP_MARKER_GROUPS_CHANGED: Readonly<{
    eventGroupMarkerKeys: readonly EventGroupMarkerKey[];
  }>;
};

/** A supported execution notification topic. */
export type SubscriptionTopic = keyof NotificationByTopic;

/** Receives the batch payload associated with one topic. */
export type Subscriber<T extends SubscriptionTopic> = (
  notification: NotificationByTopic[T],
) => void;

/** Preserves the relationship between a topic and its subscriber type. */
export type SubscriptionArgs = {
  [T in SubscriptionTopic]: [topic: T, handler: Subscriber<T>];
}[SubscriptionTopic];
