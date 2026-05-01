import type { Memo, Payload as RawPayload } from '$lib/types';
import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
import {
  decodeEventAttributes,
  parsePayloadAttributes,
  type PotentiallyDecodable,
} from '$lib/utilities/decode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export type DecodableValue =
  | PotentiallyDecodable
  | EventAttribute
  | WorkflowEvent
  | Memo
  | RawPayload
  | null
  | undefined;

export const getInitialPayloadValue = (
  value: DecodableValue,
  fieldName: string,
): string => {
  if (!value) return stringifyWithBigInt(value);
  const keyedValue = fieldName && value?.[fieldName] ? value[fieldName] : value;
  return stringifyWithBigInt(keyedValue);
};

export const decodePayloadValue = async (
  value: DecodableValue,
  fieldName: string,
): Promise<string> => {
  const convertedAttributes = await decodeEventAttributes(
    value as PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
  );
  const decodedAttributes = parsePayloadAttributes(
    convertedAttributes,
  ) as object;
  const keyExists = fieldName && decodedAttributes?.[fieldName];
  let finalValue = keyExists ? decodedAttributes[fieldName] : decodedAttributes;
  if (Array.isArray(finalValue) && finalValue.length === 1) {
    finalValue = finalValue[0];
  }
  return stringifyWithBigInt(finalValue);
};
