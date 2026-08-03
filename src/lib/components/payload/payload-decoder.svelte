<script lang="ts" module>
  export type DecodedPayloadResult = {
    decodedValue: ParsedPayload | PayloadContainingObject;
    originalValue: Payload | PayloadContainingObject;
  }[];
</script>

<script lang="ts">
  import { type Snippet, untrack } from 'svelte';

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
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

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
        originalValue: value.payloads![idx],
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
    const result: DecodedPayloadResult = [
      {
        decodedValue: decodedValue ?? value,
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
    error?: Snippet<[{ error: unknown; retry: () => void }]>;
  };

  let { value, children, onDecode, loading, error }: Props = $props();

  // `value` does not have referential integrity (its reference may change while the underlying value does not)
  // stringifying it allows us to only re-compute `decodePromise` below when the value itself changes.
  const valueJson = $derived(stringifyWithBigInt(value));

  // we do not want this derived state to be invalidated by referential updates to `value`, thus we `untrack()` it.
  // we do however want this derived state to be invalidated by updates to `valueJson`, thus we `void` it.
  let decodePromise = $derived.by(() => {
    void valueJson;
    return decodeValue(untrack(() => value));
  });

  // re-assigning the value of decodePromise triggers the #await block below. This `retry` function is exposed in the error
  // snippet so that callers can render a retry button which calls this function.
  const retry = () => {
    decodePromise = decodeValue(value);
  };
</script>

{#await decodePromise}
  {@render loading?.()}
{:then decodeResult}
  {@render children(decodeResult)}
{:catch e}
  {@render error?.({ error: e, retry })}
{/await}
