<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Payload } from '$lib/types';
  import type { NexusOperationExecutionOutcome } from '$lib/types/nexus-operation-execution';
  import { has } from '$lib/utilities/has';

  interface Props {
    input?: Payload;
    outcome?: NexusOperationExecutionOutcome;
  }

  let { input, outcome }: Props = $props();
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <div class="flex flex-col gap-2">
    <h5>Input</h5>
    {#if input}
      <PayloadCodeBlock value={input} />
    {:else}
      <CodeBlock content={JSON.stringify({}, null, 2)} />
    {/if}
  </div>
  <div class="flex flex-col gap-2">
    <h5>Result</h5>
    {#if has(outcome, 'failure')}
      <CodeBlock content={JSON.stringify(outcome.failure, null, 2)} />
    {:else if has(outcome, 'result')}
      <PayloadCodeBlock value={outcome.result} />
    {:else}
      <CodeBlock content={JSON.stringify({}, null, 2)} />
    {/if}
  </div>
</div>
