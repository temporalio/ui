import { get } from 'svelte/store';
import { dataEncoderEndpoint } from '../../stores/data-encoder-config';
import { convertPayloadToJsonWithCodec, convertPayloadToJsonWithWebsocket, decodePayloadAttributes, } from '../../utilities/decode-payload';
import { formatDate } from '../../utilities/format-date';
import { has } from '../../utilities/has';
import { findAttributesAndKey } from '../../utilities/is-event-type';
import { groupEvents } from '../event-groups';
import { getEventCategory } from './get-event-categorization';
import { getEventClassification } from './get-event-classification';
import { simplifyAttributes } from './simplify-attributes';
const getEndpoint = (settings, encoderEndpoint = dataEncoderEndpoint) => {
    var _a;
    return get(encoderEndpoint) || ((_a = settings === null || settings === void 0 ? void 0 : settings.codec) === null || _a === void 0 ? void 0 : _a.endpoint) || '';
};
export async function getEventAttributes({ historyEvent, namespace, settings }, { convertWithCodec = convertPayloadToJsonWithCodec, convertWithWebsocket = convertPayloadToJsonWithWebsocket, decodeAttributes = decodePayloadAttributes, encoderEndpoint = dataEncoderEndpoint, } = {}) {
    const { key, attributes } = findAttributesAndKey(historyEvent);
    // Use locally set endpoint over settings endpoint for testing purposes
    const endpoint = getEndpoint(settings, encoderEndpoint);
    const _settings = { ...settings, codec: { ...settings === null || settings === void 0 ? void 0 : settings.codec, endpoint } };
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
const toEvent = async ({ historyEvent, namespace, settings, }) => {
    const id = String(historyEvent.eventId);
    const eventType = historyEvent.eventType;
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
export const toEventHistory = async ({ response, namespace, settings, }) => {
    const events = await Promise.all(response.map((historyEvent) => toEvent({ historyEvent, namespace, settings })));
    const eventGroups = groupEvents(events);
    return { events, eventGroups };
};
export const isEvent = (event) => {
    if (event === null)
        return false;
    if (typeof event !== 'object')
        return false;
    if (Array.isArray(event))
        return false;
    if (has(event, 'eventType'))
        return true;
    return false;
};
