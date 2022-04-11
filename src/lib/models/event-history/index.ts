import { convertPayloadToJson } from '$lib/utilities/decode-payload';
import { formatDate } from '$lib/utilities/format-date';
import { has } from '$lib/utilities/has';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';

import { groupEvents } from '../group-events';
import { getEventCategory } from './get-event-categorization';
import { getEventClassification } from './get-event-classification';
import { simplifyAttributes } from './simplify-attributes';

export async function getEventAttributes(
  historyEvent: HistoryEvent,
): Promise<EventAttributesWithType> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  const decodedAttributes = await convertPayloadToJson(attributes);

  return {
    type: key,
    ...decodedAttributes,
  };
}

const toEvent = async (
  historyEvent: HistoryEvent,
): Promise<HistoryEventWithId> => {
  const id = String(historyEvent.eventId);
  const eventType = historyEvent.eventType as unknown as EventType;
  const timestamp = formatDate(String(historyEvent.eventTime));
  const classification = getEventClassification(eventType);
  const category = getEventCategory(eventType);
  const attributes = await getEventAttributes(historyEvent).then((attributes) =>
    simplifyAttributes(attributes),
  );

  return {
    ...historyEvent,
    attributes,
    eventType,
    classification,
    category,
    id,
    name: eventType,
    timestamp,
  };
};

export const toEventHistory = async (
  response: HistoryEvent[],
): Promise<{
  events: HistoryEventWithId[];
  eventGroups: CompactEventGroups;
}> => {
  const events = await Promise.all(response.map(toEvent));
  const eventGroups = groupEvents(events);

  return { events, eventGroups };
};

export const isEvent = (event: unknown): event is HistoryEventWithId => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'eventType')) return true;
  return false;
};
