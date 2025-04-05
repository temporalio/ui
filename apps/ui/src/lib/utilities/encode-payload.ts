import { get } from 'svelte/store';

import type { PayloadInputEncoding } from '$lib/components/payload-input-with-encoding.svelte';
import { encodePayloadsWithCodec } from '$lib/services/data-encoder';
import { dataEncoder } from '$lib/stores/data-encoder';
import type { Payloads } from '$lib/types';
import { btoa } from '$lib/utilities/btoa';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

export const getSinglePayload = (decodedValue: string): string => {
  if (decodedValue) {
    const parsedValue = parseWithBigInt(decodedValue);
    const firstPayload = parsedValue?.[0];
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
      data: btoa(JSON.stringify(payload)),
    };
  }
  return {
    metadata: {
      encoding: btoa(encoding),
    },
    data: btoa(JSON.stringify(payload)),
  };
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
}: EncodePayloads): Promise<Payloads> => {
  let payloads = null;

  if (input) {
    const parsedInput = JSON.parse(input);
    payloads = [setBase64Payload(parsedInput, encoding, messageType)];
    const endpoint = get(dataEncoder).endpoint;
    if (endpoint && encodeWithCodec) {
      const awaitData = await encodePayloadsWithCodec({
        payloads: { payloads },
      });
      payloads = awaitData?.payloads ?? null;
    }
  }

  return payloads;
};
