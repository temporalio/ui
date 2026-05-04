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

  interface Props {
    value: PotentiallyDecodable | PayloadContainingObject;
    onDecode?: (decodedPayloads: string[]) => void;
    children: Snippet<[decodedPayloads: string[]]>;
    loading?: Snippet;
  }

  let { value, onDecode, children, loading }: Props = $props();

  let decodedValue = $state<string[]>([]);
  let isDecoding = $state(true);

  $effect(() => {
    const controller = new AbortController();
    isDecoding = true;

    (async () => {
      try {
        let result: string[];
        if (isRawPayload(value)) {
          const decodedPayloadData =
            await decodePayloadAndParseDataToJSON(value);
          if (controller.signal.aborted) return;
          result = [stringifyWithBigInt(decodedPayloadData)];
        } else if (isRawPayloads(value)) {
          const parsedPayloadsData =
            await decodePayloadsAndParseDataToJSON(value);
          if (controller.signal.aborted) return;
          result = parsedPayloadsData.map((data) => stringifyWithBigInt(data));
        } else {
          const decoded = await decodeEventAttributes(value);
          if (controller.signal.aborted) return;
          result = [stringifyWithBigInt(decoded)];
        }
        decodedValue = result;
        isDecoding = false;
        onDecode?.(result);
      } catch {
        if (!controller.signal.aborted) {
          isDecoding = false;
        }
      }
    })();

    return () => {
      controller.abort();
      isDecoding = false;
    };
  });
</script>

{#if isDecoding}
  {@render loading?.()}
{:else}
  {@render children(decodedValue)}
{/if}
