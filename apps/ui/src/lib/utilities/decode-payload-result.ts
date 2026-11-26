import type { Payload, Payloads } from '$lib/types';

import {
  decodeEventAttributes,
  decodePayloadAndParseDataToJSON,
  decodePayloadsAndParseDataToJSON,
  isRawPayload,
  isRawPayloads,
  type ParsedPayload,
  type PayloadContainingObject,
} from './decode-payload';

export type DecodedPayloadResult = {
  decodedValue: ParsedPayload | PayloadContainingObject;
  originalValue: Payload | PayloadContainingObject;
}[];

export const decodePayloadResult = async (
  value: Payload | Payloads | PayloadContainingObject,
): Promise<DecodedPayloadResult> => {
  if (isRawPayload(value)) {
    const decodedValue = await decodePayloadAndParseDataToJSON(value, false);
    return [{ decodedValue, originalValue: value }];
  }

  if (isRawPayloads(value)) {
    const decodedPayloads = await decodePayloadsAndParseDataToJSON(
      value,
      false,
    );
    return decodedPayloads.map((decodedValue, idx) => ({
      decodedValue,
      originalValue: value.payloads![idx],
    }));
  }

  const decodedValue = await decodeEventAttributes(value);
  return [
    {
      decodedValue: decodedValue ?? value,
      originalValue: value,
    },
  ];
};
