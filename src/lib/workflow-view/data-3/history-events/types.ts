import type { HistoryEvent } from '$lib/types/events';
import { type EventType } from '$lib/utilities/is-event-type';

/** A history event whose event type has been normalized to readable form. */
export type NormalizedHistoryEvent = Readonly<
  Omit<HistoryEvent, 'eventType'> & {
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
