<script lang="ts">
<<<<<<< HEAD
  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
=======
  import { faRedo } from '@fortawesome/free-solid-svg-icons';

  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
>>>>>>> fa47f99 (Add stack trace to header of layout, WIP of responsive. Have most of table responsive)
  import EmptyState from '$lib/components/empty-state.svelte';
  import { onMount } from 'svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;

<<<<<<< HEAD
=======
  let currentdate = new Date();
  let isLoading = false;
>>>>>>> fa47f99 (Add stack trace to header of layout, WIP of responsive. Have most of table responsive)
  let stackTrace;

  onMount(() => {
    const getStackTrace = () =>
      getWorkflowStackTrace({
        workflow,
        namespace,
      });

    stackTrace = getStackTrace();
  });
<<<<<<< HEAD
</script>

{#if String(workflow.status) === 'Running'}
  <section class="stack-trace">
    <h3 class="text-lg mb-2 w-full">Stack Trace</h3>
=======

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
>>>>>>> fa47f99 (Add stack trace to header of layout, WIP of responsive. Have most of table responsive)
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
<<<<<<< HEAD
  </section>
{/if}
=======
  {:else}
    <EmptyState title="No Stack Traces Found" />
  {/if}
</section>
>>>>>>> fa47f99 (Add stack trace to header of layout, WIP of responsive. Have most of table responsive)

<style lang="postcss">
  .stack-trace {
    @apply relative w-full border-2 border-gray-300 rounded-lg p-4 flex flex-col;
  }
</style>
