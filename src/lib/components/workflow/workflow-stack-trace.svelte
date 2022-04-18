<script lang="ts">
  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import { onMount } from 'svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;

  let stackTrace;

  onMount(() => {
    const getStackTrace = () =>
      getWorkflowStackTrace({
        workflow,
        namespace,
      });

    stackTrace = getStackTrace();
  });
</script>

{#if String(workflow.status) === 'Running'}
  <section class="stack-trace">
    <h3 class="text-lg mb-2 w-full">Stack Trace</h3>
    {#await stackTrace}
      <div class="text-center">
        <h2 class="font-bold text-2xl mb-4">Loading…</h2>
        <p>(This will fail if you have no workers running.)</p>
      </div>
    {:then result}
      <div class="flex items-start h-full">
        <CodeBlock content={result} language="text" />
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
