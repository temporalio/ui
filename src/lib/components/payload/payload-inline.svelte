<script lang="ts">
  import { onMount } from 'svelte';

  import {
    type DecodableValue,
    decodePayloadValue,
    getInitialPayloadValue,
  } from '$lib/utilities/decode-payload-value';

  interface Props {
    value: DecodableValue;
    fieldName?: string;
    truncateAt?: number;
    class?: string;
  }

  let {
    value,
    fieldName = '',
    truncateAt = 60,
    class: className = '',
  }: Props = $props();

  let decodedValue = $state(getInitialPayloadValue(value, fieldName));

  onMount(async () => {
    if (!value) return;
    try {
      decodedValue = await decodePayloadValue(value, fieldName);
    } catch {
      console.error('Could not decode payloads');
    }
  });
</script>

<div
  class="overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs text-primary {className}"
>
  <code>
    <pre class="truncate">{decodedValue.slice(0, truncateAt)}</pre>
  </code>
</div>
