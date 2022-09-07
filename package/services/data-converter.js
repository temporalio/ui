import { setLastDataConverterFailure, setLastDataConverterSuccess, } from '../stores/data-converter-config';
export async function convertPayloadWithWebsocket(payload, websocket) {
    if (!websocket.isOpened) {
        try {
            await websocket.open();
        }
        catch (_e) {
            setLastDataConverterFailure(`Error opening websocket: ${_e}`);
        }
    }
    if (!websocket.isOpened) {
        return Promise.resolve(payload);
    }
    const socketResponse = websocket
        .sendRequest({
        payload: JSON.stringify(payload),
    })
        .then((response) => {
        setLastDataConverterSuccess();
        try {
            const decodedResponse = JSON.parse(response.content);
            return decodedResponse;
        }
        catch {
            // This doesn't seem to be a failure the worker _could_ send back a text response
            // instead of JSON
            return response.content;
        }
    })
        .catch((error) => {
        setLastDataConverterFailure(`Error decoding websocket response: ${error}`);
    });
    return socketResponse;
}
