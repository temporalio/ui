import type { Payload } from '$types';
import type WebSocketAsPromised from 'websocket-as-promised';
export declare function convertPayloadWithWebsocket(payload: Payload, websocket: WebSocketAsPromised): Promise<string | Payload>;
