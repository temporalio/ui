<script lang="ts">
  import { faRedo } from '@fortawesome/free-solid-svg-icons';

  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import { onMount } from 'svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;

  let currentdate = new Date();
  let isLoading = false;
  let stackTrace;

  onMount(() => {
    const getStackTrace = () =>
      getWorkflowStackTrace({
        workflow,
        namespace,
      });

    stackTrace = getStackTrace();
  });

  const refreshStackTrace = () => {
    stackTrace = getWorkflowStackTrace({
      workflow,
      namespace,
    });

    stackTrace.then(() => {
      currentdate = new Date();
    });
  };
</script>

<section class="stack-trace">
  <h3 class="text-lg mb-2 w-full">Stack Trace</h3>
  {#if String(workflow.status) === 'Running'}
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
  {:else}
    <EmptyState title="No Stack Traces Found" />
  {/if}
</section>

<style lang="postcss">
  .stack-trace {
    @apply relative w-full border-2 border-gray-300 rounded-lg p-4 flex flex-col;
  }
</style>
