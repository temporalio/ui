var _a;
import { get } from 'svelte/store';
import WebSocketAsPromised from 'websocket-as-promised';
import { dataConverterPort, setLastDataConverterFailure, } from '../stores/data-converter-config';
export const createWebsocket = (port, extraParams) => {
    if (!port) {
        return {
            hasWebsocket: false,
            websocket: null,
            closeSocket: function () {
                return null;
            },
        };
    }
    try {
        sock = new WebSocketAsPromised(`ws://localhost:${port}/`, {
            packMessage: (data) => JSON.stringify(data),
            unpackMessage: (data) => JSON.parse(data),
            attachRequestId: (data, requestId) => Object.assign({ requestId: requestId }, data),
            extractRequestId: (data) => data && data.requestId,
            ...extraParams,
        });
        sock.onError.addListener((event) => {
            console.error(`Websocket connection error: ${event}`);
        });
    }
    catch (err) {
        setLastDataConverterFailure(`Error creating websocket: ${err}`);
    }
    sock.open();
    return {
        hasWebsocket: true,
        websocket: sock,
        closeSocket: function () {
            return sock.close();
        },
    };
};
let sock = null;
const port = (_a = get(dataConverterPort)) !== null && _a !== void 0 ? _a : null;
export const dataConverterWebsocket = createWebsocket(port);
