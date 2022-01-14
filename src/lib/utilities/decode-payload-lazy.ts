import type { Payload } from '$types';

export function decodePayload(
  payload: Payload,
  // This could decode to any object. So we either use the payload object passed in or decode it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Payload | Record<any, any> | string {
  const encoding = window.atob(String(payload.metadata.encoding));
  // Help users out with an english encoding
  (payload.metadata.encodingDecrypted as unknown as string) = encoding;

  switch (encoding) {
    case 'json/plain':
    case 'json/protobuf':
      try {
        return JSON.parse(window.atob(String(payload.data)));
      } catch (_e) {
        // Couldn't correctly decode this just let the user deal with the data as is
      }
  }

  return payload;
}
