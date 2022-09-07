import type { Payload } from '$types';
import type { DataConverterWebsocketInterface } from '../../utilities/data-converter-websocket';
export declare type Decode = {
    convertPayloadToJsonWithCodec: typeof convertPayloadToJsonWithCodec;
    convertPayloadToJsonWithWebsocket: typeof convertPayloadToJsonWithWebsocket;
    decodePayloadAttributes: typeof decodePayloadAttributes;
};
export declare function decodePayload(payload: Payload): Payload | Record<any, any> | string;
export declare const decodePayloadAttributes: (eventAttribute: EventAttribute) => EventAttribute;
export declare const getPotentialPayloads: (anyAttributes: any) => Payload[] | null;
export declare const convertPayloadToJsonWithCodec: ({ attributes, namespace, settings, }: any) => Promise<EventAttribute>;
export declare const convertPayloadToJsonWithWebsocket: (eventAttribute: EventAttribute, websocket?: DataConverterWebsocketInterface) => Promise<EventAttribute>;
