import { get } from 'svelte/store';

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

export const setBase64Payload = (payload: unknown, encoding = 'json/plain') => {
  return {
    metadata: {
      encoding: btoa(encoding),
    },
    data: btoa(JSON.stringify(payload)),
  };
};

export const encodePayloads = async (
  input: string,
  encoding: string,
  encodeWithCodec: boolean = true,
): Promise<Payloads> => {
  let payloads = null;

  if (input) {
    const parsedInput = JSON.parse(input);
    payloads = [setBase64Payload(parsedInput, encoding)];
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
