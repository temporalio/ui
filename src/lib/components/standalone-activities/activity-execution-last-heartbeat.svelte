<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Payloads } from '$lib/types';

  import PayloadDecoder from '../event/payload-decoder.svelte';
  import { timestamp } from '../timestamp.svelte';

  interface Props {
    heartbeatDetails: Payloads;
    lastHeartbeat: string | undefined;
  }

  let { heartbeatDetails, lastHeartbeat }: Props = $props();
</script>

<Card class="flex flex-col gap-1 py-5">
  <h5 class="text-xs font-semibold uppercase tracking-wide">Last Heartbeat</h5>
  <p class="text-sm text-secondary">
    {#if lastHeartbeat}
      {$timestamp(lastHeartbeat)}
    {:else}
      None
    {/if}
  </p>
  {#if heartbeatDetails}
    <PayloadDecoder value={heartbeatDetails}>
      {#snippet children(content)}
        <CodeBlock {content} />
      {/snippet}
    </PayloadDecoder>
  {/if}
</Card>
