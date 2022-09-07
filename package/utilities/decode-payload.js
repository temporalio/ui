import { dataConverterWebsocket } from './data-converter-websocket';
import { convertPayloadWithWebsocket } from '../services/data-converter';
import { convertPayloadsWithCodec } from '../services/data-encoder';
import { atob } from './atob';
export function decodePayload(payload) {
    var _a, _b;
    const encoding = atob(String((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.metadata) === null || _a === void 0 ? void 0 : _a.encoding) !== null && _b !== void 0 ? _b : ''));
    // Help users out with an english encoding
    payload.metadata.encodingDecoded = encoding;
    switch (encoding) {
        case 'json/plain':
        case 'json/protobuf':
            try {
                return JSON.parse(atob(String(payload.data)));
            }
            catch (_e) {
                // Couldn't correctly decode this just let the user deal with the data as is
            }
    }
    return payload;
}
export const decodePayloadAttributes = (eventAttribute) => {
    var _a, _b, _c, _d, _f, _g;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyAttributes = eventAttribute;
    // Decode Search Attributes
    if ((_a = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.searchAttributes) === null || _a === void 0 ? void 0 : _a.indexedFields) {
        const searchAttributes = (_b = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.searchAttributes) === null || _b === void 0 ? void 0 : _b.indexedFields;
        Object.entries(searchAttributes).forEach(([key, value]) => {
            searchAttributes[key] = decodePayload(value);
        });
    }
    // Decode Memo
    if ((_c = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.memo) === null || _c === void 0 ? void 0 : _c.fields) {
        const memo = (_d = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.memo) === null || _d === void 0 ? void 0 : _d.fields;
        Object.entries(memo).forEach(([key, value]) => {
            memo[key] = decodePayload(value);
        });
    }
    // Decode Header
    if ((_f = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.header) === null || _f === void 0 ? void 0 : _f.fields) {
        const header = (_g = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.header) === null || _g === void 0 ? void 0 : _g.fields;
        Object.entries(header).forEach(([key, value]) => {
            header[key] = decodePayload(value);
        });
    }
    // Decode Query Result
    // This one is a best guess from the previous codebase and needs verified
    if (anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.queryResult) {
        const queryResult = anyAttributes === null || anyAttributes === void 0 ? void 0 : anyAttributes.queryResult;
        Object.entries(queryResult).forEach(([key, value]) => {
            queryResult[key] = decodePayload(value);
        });
    }
    return anyAttributes;
};
// List of fields with payloads
const payloadFields = [
    ['data'],
    ['input'],
    ['result'],
    ['details', 'change-id'],
    ['details', 'data'],
    ['details', 'result'],
    ['details', 'version'],
    ['details'],
    ['heartbeatDetails'],
    ['lastHeartbeatDetails'],
    ['lastFailure'],
    ['lastCompletionResult'],
    ['queryArgs'],
    ['answer'],
    ['signalInput'],
];
const getField = (fields, object) => fields.reduce((nestedObject, field) => nestedObject && (nestedObject === null || nestedObject === void 0 ? void 0 : nestedObject[field]) ? nestedObject[field] : null, object);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPotentialPayloads = (anyAttributes) => {
    let payloads = null;
    for (const field of payloadFields) {
        const value = getField(field, anyAttributes);
        if (value && (value === null || value === void 0 ? void 0 : value.payloads)) {
            payloads = value.payloads;
            break;
        }
    }
    return payloads;
};
export const convertPayloadToJsonWithCodec = async ({ attributes, namespace, settings, }) => {
    var _a, _b;
    // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
    // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
    // don't have the same property TS won't let us access that object without verifying the type string like
    // attributes.type === "ATypeWithInput/Result"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyAttributes = attributes;
    const potentialPayloads = getPotentialPayloads(anyAttributes);
    if (potentialPayloads) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let JSONPayload;
        const endpoint = (_a = settings === null || settings === void 0 ? void 0 : settings.codec) === null || _a === void 0 ? void 0 : _a.endpoint;
        if (endpoint) {
            // Convert Payload data
            const awaitData = await convertPayloadsWithCodec({
                payloads: { payloads: potentialPayloads },
                namespace,
                settings,
            });
            JSONPayload = ((_b = awaitData === null || awaitData === void 0 ? void 0 : awaitData.payloads) !== null && _b !== void 0 ? _b : []).map(decodePayload);
        }
        else {
            JSONPayload = potentialPayloads.map(decodePayload);
        }
        for (const field of payloadFields) {
            const value = getField(field, anyAttributes);
            if (value === null || value === void 0 ? void 0 : value.payloads) {
                value.payloads = JSONPayload;
            }
        }
    }
    return anyAttributes;
};
export const convertPayloadToJsonWithWebsocket = async (eventAttribute, websocket) => {
    // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
    // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
    // don't have the same property TS won't let us access that object without verifying the type string like
    // attributes.type === "ATypeWithInput/Result"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyAttributes = eventAttribute;
    const potentialPayloads = getPotentialPayloads(anyAttributes);
    if (potentialPayloads) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let JSONPayload;
        const ws = websocket !== null && websocket !== void 0 ? websocket : dataConverterWebsocket;
        if (ws === null || ws === void 0 ? void 0 : ws.hasWebsocket) {
            // Convert Payload data
            const awaitData = await Promise.all((potentialPayloads !== null && potentialPayloads !== void 0 ? potentialPayloads : []).map(async (payload) => await convertPayloadWithWebsocket(payload, ws.websocket)));
            JSONPayload = awaitData;
        }
        else {
            JSONPayload = potentialPayloads.map(decodePayload);
        }
        for (const field of payloadFields) {
            const value = getField(field, anyAttributes);
            if (value === null || value === void 0 ? void 0 : value.payloads) {
                value.payloads = JSONPayload;
            }
        }
    }
    return anyAttributes;
};
