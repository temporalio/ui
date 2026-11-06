import type { HistoryEvent } from '$lib/types/events';
import type { EventType } from '$lib/utilities/is-event-type';

import type { EventKey, ExecutionKey } from '../identity-keys';

/** A history event whose event type has been normalized to readable form. */
export type NormalizedHistoryEvent = Readonly<
  Omit<HistoryEvent, 'eventType'> & {
    eventType: EventType;
    eventTypeFormat: 'readable';
    /** Event timestamp converted to Unix milliseconds. */
    eventTimeMs: number;
  }
>;

/** A history event qualified with stable execution and event keys. */
export type QualifiedHistoryEvent = Readonly<
  NormalizedHistoryEvent & {
    /** Identifies the execution containing this event. */
    executionKey: ExecutionKey;

    /** Identifies this event across all workflow executions in the current account. */
    eventKey: EventKey;
  }
>;

/** Notifies subscribers that history events were added for one execution. */
export type HistoryEventsAddedNotification = Readonly<{
  type: 'HISTORY_EVENTS_ADDED';
  executionKey: ExecutionKey;
  events: readonly QualifiedHistoryEvent[];
}>;

/** Provides a subscriber with the repository's current history events. */
export type HistoryEventsSnapshotNotification = Readonly<{
  type: 'HISTORY_EVENTS_SNAPSHOT';
  events: readonly QualifiedHistoryEvent[];
}>;

/** A notification published by a history event repository. */
export type HistoryEventRepositoryNotification =
  | HistoryEventsSnapshotNotification
  | HistoryEventsAddedNotification;

/** Receives notifications from a history event repository. */
export type HistoryEventRepositorySubscriber = (
  notification: HistoryEventRepositoryNotification,
) => void;
