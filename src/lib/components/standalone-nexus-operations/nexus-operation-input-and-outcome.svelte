<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Failure, Payload } from '$lib/types';

  interface Props {
    input?: Payload;
    result?: Payload;
    failure?: Failure;
  }

  let { input, result, failure }: Props = $props();
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
    {#if failure}
      <CodeBlock content={JSON.stringify(failure, null, 2)} />
    {:else if result}
      <PayloadCodeBlock value={result} />
    {:else}
      <CodeBlock content={JSON.stringify({}, null, 2)} />
    {/if}
  </div>
</div>
