import {
  codecEndpoint,
  includeCredentials,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type {
  EventAttributeKey,
  EventAttributesWithType,
  EventsWithMetadata,
  EventType,
  EventWithMetadata,
  WorkflowEvent,
  WorkflowEvents,
} from '$lib/types/events';
import {
  convertPayloadToJsonWithCodec,
  convertPayloadToJsonWithWebsocket,
  type DecodeFunctions,
  decodePayloadAttributes,
} from '$lib/utilities/decode-payload';
import { formatDate } from '$lib/utilities/format-date';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from '$lib/utilities/get-codec';
import { has } from '$lib/utilities/has';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';

import { getEventCategory } from './get-event-categorization';
import { getEventClassification } from './get-event-classification';
import { simplifyAttributes } from './simplify-attributes';

export async function getEventAttributes(
  { historyEvent, namespace, settings, accessToken }: EventWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    convertWithWebsocket = convertPayloadToJsonWithWebsocket,
    decodeAttributes = decodePayloadAttributes,
    encoderEndpoint = codecEndpoint,
    codecPassAccessToken = passAccessToken,
    codecIncludeCredentials = includeCredentials,
  }: DecodeFunctions = {},
): Promise<EventAttributesWithType<EventAttributeKey>> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  // Use locally set endpoint over settings endpoint for testing purposes
  const endpoint = getCodecEndpoint(settings, encoderEndpoint);
  const passAccessToken = getCodecPassAccessToken(
    settings,
    codecPassAccessToken,
  );
  const includeCredentials = getCodecIncludeCredentials(
    settings,
    codecIncludeCredentials,
  );
  const _settings = {
    ...settings,
    codec: {
      ...settings?.codec,
      endpoint,
      passAccessToken,
      includeCredentials,
    },
  };

  const convertedAttributes = endpoint
    ? await convertWithCodec({
        attributes,
        namespace,
        settings: _settings,
        accessToken,
      })
    : await convertWithWebsocket(attributes);

  const decodedAttributes = decodeAttributes(convertedAttributes) as object;

  return {
    type: key,
    ...decodedAttributes,
  };
}

export const toEvent = async ({
  historyEvent,
  namespace,
  settings,
  accessToken,
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
    accessToken,
  }).then((attributes) => simplifyAttributes(attributes));

  return {
    ...historyEvent,
    name: eventType,
    id,
    eventType,
    timestamp,
    classification,
    category,
    attributes,
  };
};

export const toEventHistory = async ({
  response,
  namespace,
  settings,
  accessToken,
}: EventsWithMetadata): Promise<WorkflowEvents> => {
  return await Promise.all(
    response.map((historyEvent) =>
      toEvent({ historyEvent, namespace, settings, accessToken }),
    ),
  );
};

export const isEvent = (event: unknown): event is WorkflowEvent => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'eventType')) return true;
  return false;
};
