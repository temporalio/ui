<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

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

  onMount(async () => {
    if (!value) return;
    try {
      decodedValue = await decodePayloadValue(value, fieldName);
      onDecode?.(decodedValue);
    } catch {
      console.error('Could not decode payloads');
    }
  });
</script>

{@render children(decodedValue)}
