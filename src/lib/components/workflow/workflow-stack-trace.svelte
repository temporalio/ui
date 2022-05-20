<script lang="ts">
  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import EmptyState from '$lib/components/empty-state.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  import type { ParsedQuery } from '$lib/services/query-service';
  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

  const getStackTrace = () =>
    getWorkflowStackTrace({
      workflow,
      namespace,
    });

  let stackTrace: Eventual<ParsedQuery>;
  $: runningWithNoWorkers = workflow.isRunning && !workers?.pollers?.length;

  $: {
    if (runningWithNoWorkers) stackTrace = getStackTrace();
  }
</script>

{#if runningWithNoWorkers}
  <section class="stack-trace">
    <h3 class="text-lg mb-2 w-full">Stack Trace</h3>
    {#await stackTrace}
      <div class="text-center">
        <h2 class="font-bold text-2xl mb-4">Loading…</h2>
        <p>(This will fail if you have no workers running.)</p>
      </div>
    {:then result}
      <div class="flex items-start h-full">
        <CodeBlock content={result} language="text" class={$$props.class} />
      </div>
    {:catch _error}
      <EmptyState
        title="An Error Occured"
        content="Please make sure you have at least one worker running."
      />
    {/await}
  </section>
{/if}

<style lang="postcss">
  .stack-trace {
    @apply relative w-full border-2 border-gray-300 rounded-lg p-4 flex flex-col;
  }
</style>
