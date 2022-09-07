import WebSocketAsPromised from 'websocket-as-promised';
import type Options from 'websocket-as-promised/types/options';
export interface DataConverterWebsocketInterface {
    hasWebsocket: boolean;
    websocket: WebSocketAsPromised;
    closeSocket: () => Promise<CloseEvent>;
}
export declare const createWebsocket: (port: string | null, extraParams?: Options) => DataConverterWebsocketInterface;
export declare const dataConverterWebsocket: DataConverterWebsocketInterface;
