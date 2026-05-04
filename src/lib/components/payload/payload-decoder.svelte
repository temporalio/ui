<script lang="ts" module>
  export type DecodedPayloadResult = {
    decodedValue: ParsedPayload | PayloadContainingObject;
    originalValue: Payload | PayloadContainingObject;
  }[];
</script>

<script lang="ts">
  import { type Snippet } from 'svelte';

  import type { Payload, Payloads } from '$lib/types';
  import {
    decodeEventAttributes,
    decodePayloadAndParseDataToJSON,
    decodePayloadsAndParseDataToJSON,
    isRawPayload,
    isRawPayloads,
    type ParsedPayload,
    type PayloadContainingObject,
  } from '$lib/utilities/decode-payload';

  type T = $$Generic<PayloadContainingObject>;

  const decodePayloadValue = async (
    value: Payload,
  ): Promise<DecodedPayloadResult> => {
    const decodedPayload = await decodePayloadAndParseDataToJSON(value, false);
    const result = [
      {
        decodedValue: decodedPayload,
        originalValue: value,
      },
    ];

    onDecode?.(result);
    return result;
  };

  const decodePayloadsValue = async (
    value: Payloads,
  ): Promise<DecodedPayloadResult> => {
    const decodedPayloads = await decodePayloadsAndParseDataToJSON(
      value,
      false,
    );
    const result = decodedPayloads.map((decodedPayload, idx) => {
      return {
        decodedValue: decodedPayload,
        originalValue: value.payloads[idx],
      };
    });

    onDecode?.(result);
    return result;
  };

  const decodePayloadContainingObjectValue = async <
    T extends PayloadContainingObject,
  >(
    value: T,
  ): Promise<DecodedPayloadResult> => {
    const decodedValue = await decodeEventAttributes(value);
    const result = [
      {
        decodedValue,
        originalValue: value,
      },
    ];

    onDecode?.(result);
    return result;
  };

  const decodeValue = (
    value: Payload | Payloads | T,
  ): Promise<DecodedPayloadResult> => {
    if (isRawPayload(value)) {
      return decodePayloadValue(value);
    }

    if (isRawPayloads(value)) {
      return decodePayloadsValue(value);
    }

    return decodePayloadContainingObjectValue(value);
  };

  type Props = {
    value: Payload | Payloads | T;
    children: Snippet<[DecodedPayloadResult]>;
    onDecode?: (result: DecodedPayloadResult) => void;
    loading?: Snippet<[]>;
  };

  let { value, children, onDecode, loading }: Props = $props();
</script>

{#await decodeValue(value)}
  {@render loading?.()}
{:then decodeResult}
  {@render children(decodeResult)}
{/await}
