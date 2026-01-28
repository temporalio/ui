<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Payloads } from '$lib/types';
  import type { ActivityExecutionOutcome } from '$lib/types/activity-execution';
  import { has } from '$lib/utilities/has';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  interface Props {
    input?: Payloads;
    outcome?: ActivityExecutionOutcome;
  }

  let { input, outcome }: Props = $props();
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <div class="flex flex-col gap-2">
    <h5>Input</h5>
    <PayloadDecoder value={input} key="payloads">
      {#snippet children(decodedValue)}
        <CodeBlock content={decodedValue} />
      {/snippet}
    </PayloadDecoder>
  </div>
  <div class="flex flex-col gap-2">
    <h5>Outcome</h5>
    {#if has(outcome, 'failure')}
      <CodeBlock content={JSON.stringify(outcome.failure, null, 2)} />
    {:else if has(outcome, 'result')}
      <PayloadDecoder value={outcome.result} key="payloads">
        {#snippet children(decodedValue)}
          <CodeBlock content={decodedValue} />
        {/snippet}
      </PayloadDecoder>
    {:else}
      <CodeBlock content={JSON.stringify({}, null, 2)} />
    {/if}
  </div>
</div>
