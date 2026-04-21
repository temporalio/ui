<script lang="ts">
  import {
    type DecodableValue,
    decodePayloadValue,
    getInitialPayloadValue,
  } from './decode-payload-value';

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

  $effect(() => {
    if (!value) return;
    decodePayloadValue(value, fieldName)
      .then((result) => {
        decodedValue = result;
      })
      .catch(() => {
        console.error('Could not decode payloads');
      });
  });
</script>

<div
  class="overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs text-primary {className}"
>
  <code>
    <pre class="truncate">{decodedValue.slice(0, truncateAt)}</pre>
  </code>
</div>
