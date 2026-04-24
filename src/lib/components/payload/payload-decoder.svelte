<script lang="ts">
  import { type Snippet } from 'svelte';

  import {
    decodeEventAttributes,
    decodePayloadAndParseDataToJSON,
    decodePayloadsAndParseDataToJSON,
    isRawPayload,
    isRawPayloads,
    type ParsedPayload,
    type PayloadContainingObject,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  export const decodePayloadValue = async (
    value: PotentiallyDecodable | PayloadContainingObject,
  ): Promise<ParsedPayload[]> => {
    if (isRawPayload(value)) {
      const decodedPayload = await decodePayloadAndParseDataToJSON(
        value,
        false,
      );
      // const stringified = stringifyWithBigInt(decodedPayload.data);
      onDecode?.([decodedPayload]);
      return [decodedPayload];
    } else if (isRawPayloads(value)) {
      const decodedPayloads = await decodePayloadsAndParseDataToJSON(
        value,
        false,
      );
      // const stringified = decodedPayloads.map((payload) =>
      //   stringifyWithBigInt(payload.data),
      // );
      onDecode?.(decodedPayloads);
      return decodedPayloads;
    } else {
      const decoded = await decodeEventAttributes(value);
      // const stringified = stringifyWithBigInt(decoded);
      // onDecode?.(decoded);
      // return [stringified];
    }
  };

  interface Props {
    value: PotentiallyDecodable | PayloadContainingObject;
    onDecode?: (decodedPayloads: ParsedPayload[]) => void;
    children: Snippet<[decodedPayloads: ParsedPayload[]]>;
    loading?: Snippet;
  }

  let { value, onDecode, children, loading }: Props = $props();
</script>

{#await decodePayloadValue(value)}
  {@render loading?.()}
{:then decodedValue}
  {@render children(decodedValue)}
{/await}
