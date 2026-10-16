import type { HistoryEvent } from '$lib/types/events';
import { validTimeToDate } from '$lib/utilities/format-time';
import { eventTypes } from '$lib/utilities/is-event-type';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

import type { NormalizedHistoryEvent } from './types';

const knownReadableEventTypes = new Set<string>(eventTypes);

/** A history event in the format returned by the API. */
type RawHistoryEvent = Readonly<
  Omit<HistoryEvent, 'eventType'> & {
    eventType: string;
  }
>;

function getEventTimeMs(eventTime: HistoryEvent['eventTime']): number {
  if (!eventTime) {
    throw new TypeError('History event is missing its event time');
  }

  return validTimeToDate(eventTime).getTime();
}

function getReadableEventType(
  eventType: string,
): NormalizedHistoryEvent['eventType'] {
  const readableEventType = fromScreamingEnum(eventType, 'EventType');

  if (!knownReadableEventTypes.has(readableEventType)) {
    console.warn(`Unrecognized history event type: ${eventType}`);
  }

  return readableEventType as NormalizedHistoryEvent['eventType'];
}

/** Normalizes a raw API history event for use by event-processing code. */
export function normalizeHistoryEvent(
  historyEvent: RawHistoryEvent,
): NormalizedHistoryEvent {
  return {
    ...historyEvent,
    eventType: getReadableEventType(historyEvent.eventType),
    eventTypeFormat: 'readable',
    eventTimeMs: getEventTimeMs(historyEvent.eventTime),
  };
}
