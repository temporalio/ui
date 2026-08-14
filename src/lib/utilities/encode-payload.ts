import { get } from 'svelte/store';

import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
import { encodePayloadsWithCodec } from '$lib/services/data-encoder';
import { dataEncoder } from '$lib/stores/data-encoder';
import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
import type { Payload, SearchAttribute } from '$lib/types';
import { atob } from '$lib/utilities/atob';
import { btoa } from '$lib/utilities/btoa';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

export const isBase64EncodedPayload = (value: unknown): value is Payload => {
  if (!value || typeof value !== 'object') return false;
  const { metadata, data } = value as Payload;
  const encoding = metadata?.encoding;
  if (typeof encoding !== 'string' || typeof data !== 'string') return false;
  return atob(encoding) !== encoding;
};

export const getSinglePayload = (decodedValue: string): string => {
  if (decodedValue) {
    const parsedValue = parseWithBigInt(decodedValue);
    const firstPayload = Array.isArray(parsedValue)
      ? parsedValue?.[0]
      : parsedValue;
    if (firstPayload) {
      return stringifyWithBigInt(firstPayload);
    }
  }
  return '';
};

export const setBase64Payload = (
  payload: unknown,
  encoding: PayloadInputEncoding = 'json/plain',
  messageType = '',
) => {
  if (messageType) {
    return {
      metadata: {
        encoding: btoa(encoding),
        messageType: btoa(messageType),
      },
      data: btoa(stringifyWithBigInt(payload)),
    };
  }
  return {
    metadata: {
      encoding: btoa(encoding),
    },
    data: btoa(stringifyWithBigInt(payload)),
  };
};

export const setSearchAttributes = (
  attributes: SearchAttributesSchema,
): NonNullable<SearchAttribute['indexedFields']> => {
  if (!attributes.length) return {};

  const searchAttributes: Record<
    string,
    ReturnType<typeof setBase64Payload>
  > = {};
  attributes.forEach((attribute) => {
    searchAttributes[attribute.label] = setBase64Payload(attribute.value);
  });

  return searchAttributes as unknown as NonNullable<
    SearchAttribute['indexedFields']
  >;
};

type EncodePayloads = {
  input: string;
  encoding: PayloadInputEncoding;
  messageType?: string;
  encodeWithCodec?: boolean;
};

export const encodePayloads = async ({
  input,
  encoding,
  messageType = '',
  encodeWithCodec = true,
}: EncodePayloads): Promise<Payload[] | null> => {
  if (!input) return null;

  const parsedInput = parseWithBigInt(input);
  let payloads: Payload[] = isBase64EncodedPayload(parsedInput)
    ? [parsedInput]
    : [
        setBase64Payload(
          parsedInput,
          encoding,
          messageType,
        ) as unknown as Payload,
      ];

  const endpoint = get(dataEncoder).endpoint;
  if (endpoint && encodeWithCodec) {
    const awaitData = await encodePayloadsWithCodec({
      payloads: { payloads },
    });
    payloads = (awaitData?.payloads as Payload[]) ?? null;
  }
  return payloads;
};
