import type { Payload } from '$types';
import { dataConverterPort } from '$lib/stores/data-converter-config';
import { dataConverterWebsocket } from '$lib/stores/data-converter-websocket';
import { get } from 'svelte/store';
import { convertPayload } from '$lib/services/data-converter';

export const convertPayloadToJson = async (
  eventAttribute: EventAttribute,
): Promise<EventAttribute> => {
  if (!eventAttribute) return eventAttribute;

  // This anyAttribues allows us to use ?. notation to introspect the object which is a safe access pattern.
  // Because of the way we wrote our discrimited union we have to use this any. If we have two objects that
  // don't have the same property TS won't let us access that object without verifying the type string like
  // attributes.type === "ATypeWithInput/Result"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyAttributes = eventAttribute as any;

  const port = get(dataConverterPort);

  const potentialPayload = (anyAttributes?.input?.payloads ??
    anyAttributes?.result?.payloads ??
    null) as Payload[] | null;

  if (potentialPayload === null) {
    return Promise.resolve(eventAttribute);
  }

  // This is a very sneaky array[0].data It's a holdover from a previous version of this code we could probably actually iterate
  // over this and get each entry decoded from base64
  // This was set to any because we just want whatever comes out of here to be base64 decoded and reset to the other value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let [JSONPayload]: any[] = potentialPayload.map((payload) => payload.data);

  JSONPayload = window.atob(JSONPayload);

  if (port) {
    const webSocket = dataConverterWebsocket.websocket;

    const awaitData = await Promise.all(
      potentialPayload.map(
        async (payload) => await convertPayload(payload, webSocket),
      ),
    );
    JSONPayload = awaitData;
  }

  if (anyAttributes?.input?.payloads) {
    anyAttributes.input.payloads = JSONPayload;
  }
  if (anyAttributes?.result?.payloads) {
    anyAttributes.result.payloads = JSONPayload;
  }

  return anyAttributes;
};
