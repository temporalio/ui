<script lang="ts">
  import EmptyState from '$lib/components/empty-state.svelte';

  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

  $: runningWithNoWorkers = workflow.isRunning && !workers?.pollers?.length;
</script>

{#if runningWithNoWorkers}
  <section class="stack-trace">
    <EmptyState
      title="An Error Occured"
      content="Please make sure you have at least one worker running."
      class="my-0"
    />
  </section>
{/if}

<style lang="postcss">
  .stack-trace {
    @apply relative w-full border-2 border-yellow-700 bg-yellow-50 text-yellow-900 rounded-lg p-4 flex flex-col;
  }
</style>
