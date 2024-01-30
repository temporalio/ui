import { get } from 'svelte/store';

import { page } from '$app/stores';

import { convertPayloadsWithCodec } from '$lib/services/data-encoder';
import { authUser } from '$lib/stores/auth-user';
import type {
  codecEndpoint,
  includeCredentials,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type { Payloads } from '$lib/types';
import type {
  EventAttribute,
  EventRequestMetadata,
  Payload,
  WorkflowEvent,
} from '$lib/types/events';
import type { Optional, Replace, Settings } from '$lib/types/global';

import { atob } from './atob';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from './get-codec';
import { has } from './has';
import { isObject } from './is';
import { parseWithBigInt } from './parse-with-big-int';

export type PotentiallyDecodable =
  | Payloads
  | Record<string | number | symbol, unknown>;

export type Decode = {
  convertPayloadToJsonWithCodec: typeof convertPayloadToJsonWithCodec;
  decodePayloadAttributes: typeof decodePayloadAttributes;
};

export type DecodeFunctions = {
  convertWithCodec?: Decode['convertPayloadToJsonWithCodec'];
  decodeAttributes?: Decode['decodePayloadAttributes'];
  encoderEndpoint?: typeof codecEndpoint;
  codecPassAccessToken?: typeof passAccessToken;
  codecIncludeCredentials?: typeof includeCredentials;
};

const toArray = (payloads: Payload | Payload[]): Payload[] => {
  if (Array.isArray(payloads)) {
    return payloads;
  } else {
    return [payloads];
  }
};

export function decodePayload(
  payload: Payload,
  returnDataOnly: boolean = true,
  // This could decode to any object. So we either use the payload object passed in or decode it
): unknown | Payload | null {
  if (payload === null) {
    return payload;
  }

  const encoding = atob(String(payload?.metadata?.encoding ?? ''));

  // Help users out with an english encoding
  if (payload?.metadata) {
    (payload.metadata.encodingDecoded as unknown as string) = encoding;
  }

  if (encoding?.startsWith('json/')) {
    try {
      const data = parseWithBigInt(atob(String(payload?.data ?? '')));
      return returnDataOnly ? data : { ...payload, data };
    } catch (_e) {
      console.warn('Could not parse payload: ', _e);
      // Couldn't correctly decode this just let the user deal with the data as is
    }
  }

  if (encoding === 'binary/null') {
    return returnDataOnly ? null : { ...payload, data: null };
  }

  return payload;
}

export const decodePayloadAttributes = <
  T extends Optional<PotentiallyDecodable | EventAttribute | WorkflowEvent>,
>(
  eventAttribute: T,
  returnDataOnly: boolean = true,
): Replace<
  T,
  Optional<PotentiallyDecodable | EventAttribute | WorkflowEvent>
> => {
  // Decode Search Attributes
  if (
    has(eventAttribute, 'searchAttributes') &&
    has(eventAttribute.searchAttributes, 'indexedFields')
  ) {
    const searchAttributes = eventAttribute.searchAttributes.indexedFields;

    Object.entries(searchAttributes).forEach(([key, value]) => {
      searchAttributes[key] = decodePayload(value, returnDataOnly);
    });
  } else if (has(eventAttribute, 'searchAttributes')) {
    // Decode Search Attributes on UpsertWorkflowSearchAttributes
    const searchAttributes = eventAttribute.searchAttributes;

    Object.entries(searchAttributes).forEach(([key, value]) => {
      searchAttributes[key] = decodePayload(value, returnDataOnly);
    });
  }

  // Decode Memo
  if (has(eventAttribute, 'memo') && has(eventAttribute.memo, 'fields')) {
    const memo = eventAttribute.memo.fields;

    Object.entries(memo).forEach(([key, value]) => {
      memo[key] = decodePayload(value, returnDataOnly);
    });
  }

  // Decode Header
  if (has(eventAttribute, 'header') && has(eventAttribute.header, 'fields')) {
    const header = eventAttribute.header.fields;

    Object.entries(header).forEach(([key, value]) => {
      header[key] = decodePayload(value, returnDataOnly);
    });
  }

  // Decode Query Result
  // This one is a best guess from the previous codebase and needs verified
  if (has(eventAttribute, 'queryResult')) {
    const queryResult = eventAttribute?.queryResult;

    Object.entries(queryResult).forEach(([key, value]) => {
      queryResult[key] = decodePayload(value, returnDataOnly);
    });
  }

  return eventAttribute;
};

const decodePayloadWithCodec =
  (namespace: string, settings: Settings, accessToken: string) =>
  async (
    payloads: unknown[],
    returnDataOnly: boolean = true,
  ): Promise<unknown[]> => {
    if (settings?.codec?.endpoint) {
      // Convert Payload data
      const awaitData = await convertPayloadsWithCodec({
        payloads: { payloads },
        namespace,
        settings,
        accessToken,
      });
      return (awaitData?.payloads ?? []).map((p) =>
        decodePayload(p, returnDataOnly),
      );
    } else {
      return payloads.map((p) => decodePayload(p, returnDataOnly));
    }
  };

const keyIs = (key: string, ...validKeys: string[]) => {
  for (const validKey of validKeys) {
    if (key === validKey) return true;
  }
  return false;
};

export const decodeAllPotentialPayloadsWithCodec = async (
  anyAttributes: EventAttribute | PotentiallyDecodable,
  namespace: string = get(page).params.namespace,
  settings: Settings = get(page).data.settings,
  accessToken: string = get(authUser).accessToken,
): Promise<EventAttribute | PotentiallyDecodable> => {
  const endpoint = getCodecEndpoint(settings);
  const passAccessToken = getCodecPassAccessToken(settings);
  const includeCredentials = getCodecIncludeCredentials(settings);
  const settingsWithLocalConfig = {
    ...settings,
    codec: {
      ...settings?.codec,
      endpoint,
      passAccessToken,
      includeCredentials,
    },
  };

  const decode = decodePayloadWithCodec(
    namespace,
    settingsWithLocalConfig,
    accessToken,
  );
  if (anyAttributes) {
    for (const key of Object.keys(anyAttributes)) {
      if (keyIs(key, 'payloads', 'encodedAttributes') && anyAttributes[key]) {
        const data = toArray(anyAttributes[key]);
        const decoded = await decode(data);
        anyAttributes[key] = keyIs(key, 'encodedAttributes')
          ? decoded[0]
          : decoded;
      } else {
        const next = anyAttributes[key];
        if (isObject(next)) {
          anyAttributes[key] = await decodeAllPotentialPayloadsWithCodec(
            next,
            namespace,
            settings,
            accessToken,
          );
        }
      }
    }
  }

  return anyAttributes;
};

export const cloneAllPotentialPayloadsWithCodec = async (
  anyAttributes: PotentiallyDecodable | EventAttribute | WorkflowEvent | null,
  namespace: string,
  settings: Settings,
  accessToken: string,
  returnDataOnly: boolean = true,
): Promise<PotentiallyDecodable | EventAttribute | WorkflowEvent | null> => {
  if (!anyAttributes) return anyAttributes;

  const decode = decodePayloadWithCodec(namespace, settings, accessToken);
  const clone = { ...anyAttributes };
  if (anyAttributes) {
    for (const key of Object.keys(clone)) {
      if (keyIs(key, 'payloads', 'encodedAttributes') && clone[key]) {
        const data = toArray(clone[key]);
        const decoded = await decode(data, returnDataOnly);
        clone[key] = keyIs(key, 'encodedAttributes') ? decoded[0] : decoded;
      } else {
        const next = clone[key];
        if (isObject(next)) {
          clone[key] = await cloneAllPotentialPayloadsWithCodec(
            next,
            namespace,
            settings,
            accessToken,
            returnDataOnly,
          );
        }
      }
    }
  }

  return clone;
};

export const convertPayloadToJsonWithCodec = async ({
  attributes,
  namespace,
  settings,
  accessToken,
}: {
  attributes: EventAttribute | PotentiallyDecodable;
} & EventRequestMetadata): Promise<EventAttribute | PotentiallyDecodable> => {
  const decodedAttributes = await decodeAllPotentialPayloadsWithCodec(
    attributes,
    namespace,
    settings,
    accessToken,
  );
  return decodedAttributes;
};
