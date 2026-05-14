<script lang="ts">
  import {
    isParsedPayload,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: PotentiallyDecodable;
    truncateAt?: number;
    class?: string;
  }

  let { value, truncateAt = 60, class: className = '' }: Props = $props();
</script>

{#snippet codeBlock(value: string)}
  <div
    class="overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs text-primary {className}"
  >
    <code>
      <pre class="truncate">{value.slice(0, truncateAt)}</pre>
    </code>
  </div>
{/snippet}

<PayloadDecoder {value}>
  {#snippet children(result)}
    {#if isParsedPayload(result[0]?.decodedValue)}
      {@const stringifiedData = stringifyWithBigInt(
        result[0].decodedValue.data,
      )}
      {@render codeBlock(stringifiedData)}
    {/if}
  {/snippet}
</PayloadDecoder>
