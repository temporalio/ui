import { get } from 'svelte/store';

import { page } from '$app/stores';

import { decodePayloadsWithCodec } from '$lib/services/data-encoder';
import { authUser } from '$lib/stores/auth-user';
import type {
  codecEndpoint,
  includeCredentials,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type { DownloadEventHistorySetting } from '$lib/stores/events';
import type {
  Failure,
  Memo,
  Payloads,
  Payload as RawPayload,
} from '$lib/types';
import type {
  EventAttribute,
  EventRequestMetadata,
  Payload,
  WorkflowEvent,
} from '$lib/types/events';
import type { Optional, Replace, Settings } from '$lib/types/global';

import { atob } from './atob';
import { getCodecEndpoint } from './get-codec';
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

const decodeMetadata = (metadata: Record<string, unknown>) => {
  return Object.entries(metadata).reduce(
    (acc, [key, value]) => {
      acc[key] = atob(String(value));
      return acc;
    },
    {} as Record<string, string>,
  );
};

export function decodePayload(
  payload: Payload,
  returnDataOnly: boolean = true,
  // This could decode to any object. So we either use the payload object passed in or decode it
): unknown | Payload | null {
  if (payload === null) {
    return payload;
  }

  try {
    const data = parseWithBigInt(atob(String(payload?.data ?? '')));
    if (returnDataOnly) return data;
    const metadata = decodeMetadata(payload?.metadata);
    return {
      metadata,
      data,
    };
  } catch (_e) {
    console.warn('Could not parse payload: ', _e);
    // Couldn't correctly decode this just let the user deal with the data as is
  }

  const encoding = atob(String(payload?.metadata?.encoding ?? ''));
  if (encoding === 'binary/null') {
    if (returnDataOnly) return null;
    const metadata = decodeMetadata(payload?.metadata);
    return {
      metadata,
      data: null,
    };
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

const decodeReadablePayloads =
  (settings: Settings) =>
  async (
    payloads: unknown[],
    returnDataOnly: boolean = true,
  ): Promise<unknown[]> => {
    if (getCodecEndpoint(settings)) {
      // Convert Payload data
      const awaitData = await decodePayloadsWithCodec({
        payloads: { payloads },
        settings,
      });
      return (awaitData?.payloads ?? []).map((p) =>
        decodePayload(p, returnDataOnly),
      );
    } else {
      return payloads.map((p) => decodePayload(p, returnDataOnly));
    }
  };

export const decodePayloads =
  (settings: Settings) =>
  async (payloads: unknown[]): Promise<unknown[]> => {
    if (getCodecEndpoint(settings)) {
      // Convert Payload data
      const awaitData = await decodePayloadsWithCodec({
        payloads: { payloads },
        settings,
      });
      return awaitData?.payloads ?? [];
    } else {
      return payloads;
    }
  };

const keyIs = (key: string, ...validKeys: string[]) => {
  for (const validKey of validKeys) {
    if (key === validKey) return true;
  }
  return false;
};

export const decodeSingleReadablePayloadWithCodec = async (
  payload: RawPayload | Payload,
  settings: Settings = get(page).data.settings,
): Promise<string | Payload> => {
  try {
    const decode = decodeReadablePayloads(settings);
    const data = await decode([payload]);
    const result = data[0];
    return result || '';
  } catch {
    return '';
  }
};

export const decodeAllPotentialPayloadsWithCodec = async (
  anyAttributes: EventAttribute | PotentiallyDecodable | Failure,
  namespace: string = get(page).params.namespace,
  settings: Settings = get(page).data.settings,
  accessToken: string = get(authUser).accessToken,
): Promise<EventAttribute | PotentiallyDecodable | Failure> => {
  const decode = decodeReadablePayloads(settings);

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

export const isSinglePayload = (payload: unknown): boolean => {
  if (!isObject(payload)) return false;
  const keys = Object.keys(payload);
  return (
    keys.length === 2 && keys.includes('metadata') && keys.includes('data')
  );
};

export const cloneAllPotentialPayloadsWithCodec = async (
  anyAttributes:
    | PotentiallyDecodable
    | EventAttribute
    | WorkflowEvent
    | Memo
    | null,
  namespace: string,
  settings: Settings,
  accessToken: string,
  decodeSetting: DownloadEventHistorySetting = 'readable',
  returnDataOnly: boolean = true,
): Promise<
  PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo | null
> => {
  if (!anyAttributes) return anyAttributes;

  const decode =
    decodeSetting === 'readable'
      ? decodeReadablePayloads(settings)
      : decodePayloads(settings);
  const clone = { ...anyAttributes };
  if (anyAttributes) {
    // Now that we can have single Payload that is not an array (Nexus)
    if (isSinglePayload(clone)) {
      const data = toArray(clone as Payload);
      const decoded = await decode(data, returnDataOnly);
      return decoded?.[0] || clone;
    }

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
            decodeSetting,
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
  attributes: EventAttribute | PotentiallyDecodable | Failure;
} & EventRequestMetadata): Promise<
  EventAttribute | PotentiallyDecodable | Failure
> => {
  const decodedAttributes = await decodeAllPotentialPayloadsWithCodec(
    attributes,
    namespace,
    settings,
    accessToken,
  );
  return decodedAttributes;
};
