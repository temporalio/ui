<script lang="ts">
  import type { PotentiallyDecodable } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: PotentiallyDecodable;
    truncateAt?: number;
    class?: string;
  }

  let { value, truncateAt = 60, class: className = '' }: Props = $props();
</script>

<PayloadDecoder {value}>
  {#snippet children(result)}
    {@const stringifiedData = stringifyWithBigInt(result[0].decodedValue.data)}
    <div
      class="overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs text-primary {className}"
    >
      <code>
        <pre class="truncate">{stringifiedData.slice(0, truncateAt)}</pre>
      </code>
    </div>
  {/snippet}
</PayloadDecoder>
