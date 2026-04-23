<script lang="ts">
  import { type Snippet } from 'svelte';

  import {
    decodeEventAttributes,
    decodePayloadAndParseDataToJSON,
    decodePayloadsAndParseDataToJSON,
    isRawPayload,
    isRawPayloads,
    type PayloadContainingObject,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  export const decodePayloadValue = async (
    value: PotentiallyDecodable | PayloadContainingObject,
  ): Promise<string[]> => {
    if (isRawPayload(value)) {
      const decodedPayloadData = await decodePayloadAndParseDataToJSON(value);
      const stringified = stringifyWithBigInt(decodedPayloadData);
      onDecode?.([stringified]);
      return [stringified];
    } else if (isRawPayloads(value)) {
      const parsedPayloadsData = await decodePayloadsAndParseDataToJSON(value);
      const stringified = parsedPayloadsData.map((data) =>
        stringifyWithBigInt(data),
      );
      onDecode?.(stringified);
      return stringified;
    } else {
      const decoded = await decodeEventAttributes(value);
      const stringified = stringifyWithBigInt(decoded);
      onDecode?.([stringified]);
      return [stringified];
    }
  };

  interface Props {
    value: PotentiallyDecodable | PayloadContainingObject;
    onDecode?: (decodedPayloads: string[]) => void;
    children: Snippet<[decodedPayloads: string[]]>;
    loading?: Snippet;
  }

  let { value, onDecode, children, loading }: Props = $props();
</script>

{#await decodePayloadValue(value)}
  {@render loading?.()}
{:then decodedValue}
  {@render children(decodedValue)}
{/await}
