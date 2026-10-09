import type { EventGroupMarkerKey } from '../event-group-markers/types';
export type WorkflowExecutionIdentity = Readonly<{
  namespace: string;
  workflowId: string;
  runId: string;
}>;

export type WorkflowExecutionKey = `workflow-execution:(${string})`;

/** An individual change produced while ingesting a history event. */
export type WorkflowExecutionChange =
  | Readonly<{
      type: 'EVENT_ADDED';
      eventId: string;
    }>
  | Readonly<{
      type: 'LIFECYCLE_GROUP_CHANGED';
      headEventId: string;
    }>
  | Readonly<{
      type: 'EVENT_GROUP_MARKER_GROUP_CHANGED';
      eventGroupMarkerKey: EventGroupMarkerKey;
    }>;

/** Consolidated batch payloads for each execution subscription topic. */
export type NotificationByTopic = {
  EVENTS_ADDED: Readonly<{
    eventIds: readonly string[];
  }>;
  LIFECYCLE_GROUPS_CHANGED: Readonly<{
    headEventIds: readonly string[];
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
