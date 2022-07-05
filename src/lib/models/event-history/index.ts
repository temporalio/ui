import { get } from 'svelte/store';
import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
import {
  Decode,
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

type DecodeFunctions = {
  convertWithCodec?: Decode['convertPayloadToJsonWithCodec'];
  convertWithWebsocket?: Decode['convertPayloadToJsonWithWebsocket'];
  decodeAttributes?: Decode['decodePayloadAttributes'];
  encoderEndpoint?: typeof dataEncoderEndpoint;
};

const getEndpoint = (
  settings: Settings,
  encoderEndpoint = dataEncoderEndpoint,
): string => {
  return get(encoderEndpoint) || settings?.codec?.endpoint || '';
};

export async function getEventAttributes(
  { historyEvent, namespace, settings }: EventWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    convertWithWebsocket = convertPayloadToJsonWithWebsocket,
    decodeAttributes = decodePayloadAttributes,
    encoderEndpoint = dataEncoderEndpoint,
  }: DecodeFunctions = {},
): Promise<EventAttributesWithType> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  // Use locally set endpoint over settings endpoint for testing purposes
  const endpoint = getEndpoint(settings, encoderEndpoint);
  const _settings = { ...settings, codec: { ...settings?.codec, endpoint } };

  const convertedAttributes = endpoint
    ? await convertWithCodec({
        attributes,
        namespace,
        settings: _settings,
      })
    : await convertWithWebsocket(attributes);

  const decodedAttributes = decodeAttributes(convertedAttributes);

  return {
    type: key,
    ...decodedAttributes,
  };
}

const toEvent = async ({
  historyEvent,
  namespace,
  settings,
}: EventWithMetadata): Promise<WorkflowEvent> => {
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
}: EventsWithMetadata): Promise<{
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
