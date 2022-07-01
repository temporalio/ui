import { get } from 'svelte/store';
import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
import {
  convertPayloadToJsonWithCodec,
  convertPayloadToJsonWithWebsocket,
  decodePayloadAttributes,
} from '$lib/utilities/decode-payload';
import { formatDate } from '$lib/utilities/format-date';
import { has } from '$lib/utilities/has';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';

import { groupEvents } from '../event-groups';
import { getEventCategory } from './get-event-categorization';
import { getEventClassification } from './get-event-classification';
import { simplifyAttributes } from './simplify-attributes';

export async function getEventAttributes({
  historyEvent,
  namespace,
  settings,
}: {
  historyEvent: HistoryEvent;
  namespace: string;
  settings: Settings;
}): Promise<EventAttributesWithType> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  // Use locally set endpoint over settings endpoint for testing purposes
  const endpoint: string =
    get(dataEncoderEndpoint) || settings?.codec?.endpoint || '';
  const _settings = { ...settings, codec: { ...settings?.codec, endpoint } };

  const convertedAttributes = endpoint
    ? await convertPayloadToJsonWithCodec({
        attributes,
        namespace,
        settings: _settings,
      })
    : await convertPayloadToJsonWithWebsocket(attributes);

  const decodedAttributes = decodePayloadAttributes(convertedAttributes);

  return {
    type: key,
    ...decodedAttributes,
  };
}

const toEvent = async ({
  historyEvent,
  namespace,
  settings,
}: {
  historyEvent: HistoryEvent;
  namespace: string;
  settings: Settings;
}): Promise<WorkflowEvent> => {
  const id = String(historyEvent.eventId);
  const eventType = historyEvent.eventType as unknown as EventType;
  const timestamp = formatDate(String(historyEvent.eventTime));
  const classification = getEventClassification(eventType);
  const category = getEventCategory(eventType);
  const attributes = await getEventAttributes({
    historyEvent,
    namespace,
    settings,
  }).then((attributes) => simplifyAttributes(attributes));

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

export const toEventHistory = async ({
  response,
  namespace,
  settings,
}: {
  response: HistoryEvent[];
  namespace: string;
  settings: Settings;
}): Promise<{
  events: WorkflowEvents;
  eventGroups: EventGroups;
}> => {
  const events = await Promise.all(
    response.map((historyEvent) =>
      toEvent({ historyEvent, namespace, settings }),
    ),
  );

  const eventGroups = groupEvents(events);

  return { events, eventGroups };
};

export const isEvent = (event: unknown): event is WorkflowEvent => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'eventType')) return true;
  return false;
};
