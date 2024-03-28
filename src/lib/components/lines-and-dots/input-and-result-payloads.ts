import type { Payload } from '$lib/types';
import type { PotentiallyDecodable } from '$lib/utilities/decode-payload';
import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

export const parseContent = (c: string): PotentiallyDecodable | undefined => {
  try {
    return parseWithBigInt(c);
  } catch {
    return undefined;
  }
};

export const parsePayloads = (c: string): unknown[] => {
  try {
    const data = parseWithBigInt(c);
    return Array.isArray(data) ? parseWithBigInt(c) : [];
  } catch {
    return [];
  }
};

export const getPayloads = (
  value: PotentiallyDecodable | undefined,
): Payload[] => {
  try {
    const payloads = value?.payloads;
    return Array.isArray(payloads) ? payloads : [];
  } catch {
    return [];
  }
};
