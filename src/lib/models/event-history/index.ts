import type {
  EventAttributeKey,
  EventAttributesWithType,
  EventWithMetadata,
  HistoryEvent,
  WorkflowEvent,
  WorkflowEvents,
} from '$lib/types/events';
import {
  convertPayloadToJsonWithCodec,
  type DecodeFunctions,
  decodePayloadAttributes,
} from '$lib/utilities/decode-payload';
import { formatDate } from '$lib/utilities/format-date';
import { has } from '$lib/utilities/has';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';
import { toEventNameReadable } from '$lib/utilities/screaming-enums';

import { getEventBillableActions } from './get-event-billable-actions';
import { getEventCategory } from './get-event-categorization';
import { getEventClassification } from './get-event-classification';
import { simplifyAttributes } from './simplify-attributes';

export async function getEventAttributes(
  { historyEvent, namespace, settings, accessToken }: EventWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    decodeAttributes = decodePayloadAttributes,
  }: DecodeFunctions = {},
): Promise<EventAttributesWithType<EventAttributeKey>> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  const convertedAttributes = await convertWithCodec({
    attributes,
    namespace,
    settings,
    accessToken,
  });

  const decodedAttributes = decodeAttributes(convertedAttributes) as object;

  return {
    type: key,
    ...decodedAttributes,
  };
}

export const toBillableEvent = (event: WorkflowEvent) => {
  return {
    ...event,
    billableActions: getEventBillableActions(event),
  };
};

export const toEvent = (historyEvent: HistoryEvent): WorkflowEvent => {
  const id = String(historyEvent.eventId);
  const eventType = toEventNameReadable(historyEvent.eventType);
  const timestamp = formatDate(String(historyEvent.eventTime));
  const classification = getEventClassification(eventType);
  const category = getEventCategory(eventType);

  const { key, attributes } = findAttributesAndKey(historyEvent);
  const links = historyEvent?.links || [];
  const event = {
    ...historyEvent,
    name: eventType,
    id,
    eventType,
    timestamp,
    classification,
    category,
    links,
    billableActions: 0,
    attributes: simplifyAttributes({ type: key, ...attributes }),
  };
  return toBillableEvent(event);
};

export const toEventHistory = (events: HistoryEvent[]): WorkflowEvents => {
  return events.map(toEvent);
};

export const isEvent = (event: unknown): event is WorkflowEvent => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'eventType')) return true;
  return false;
};

export const fromEventToRawEvent = (event: WorkflowEvent): HistoryEvent => {
  const workflowEvent = { ...event };
  delete workflowEvent.name;
  delete workflowEvent.id;
  delete workflowEvent.timestamp;
  delete workflowEvent.classification;
  delete workflowEvent.category;
  delete workflowEvent.attributes;
  return workflowEvent;
};
