<script lang="ts">
  import { type Snippet } from 'svelte';

  import {
    type DecodableValue,
    decodePayloadValue,
    getInitialPayloadValue,
  } from '$lib/utilities/decode-payload-value';

  interface Props {
    value: DecodableValue;
    fieldName?: string;
    onDecode?: (decodedValue: string) => void;
    children: Snippet<[decodedValue: string]>;
  }

  let { value, fieldName = '', onDecode, children }: Props = $props();

  let decodedValue = $state(getInitialPayloadValue(value, fieldName));

  $effect(() => {
    if (!value) return;
    decodePayloadValue(value, fieldName)
      .then((result) => {
        decodedValue = result;
        onDecode?.(result);
      })
      .catch(() => {
        console.error('Could not decode payloads');
      });
  });
</script>

{@render children(decodedValue)}
