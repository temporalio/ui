import type { HistoryEvent } from '$lib/types/events';
import { type EventType } from '$lib/utilities/is-event-type';

/** Identifies a history event within one workflow execution. */
export type HistoryEventId = string;

/** A history event whose event type has been normalized to readable form. */
export type NormalizedHistoryEvent = Readonly<
  Omit<HistoryEvent, 'eventType' | 'eventId'> & {
    eventId: HistoryEventId;
    eventType: EventType;
    eventTypeFormat: 'readable';
    /** Event timestamp converted to Unix milliseconds. */
    eventTimeMs: number;
  }
>;

/** A workflow start event with the chain metadata required for discovery. */
export type DiscoveredStartEvent = NormalizedHistoryEvent & {
  workflowExecutionStartedEventAttributes: NonNullable<
    NormalizedHistoryEvent['workflowExecutionStartedEventAttributes']
  > & {
    firstExecutionRunId: string;
  };
};
