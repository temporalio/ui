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
      icon="warning"
      title="No Workers Running."
      content="Please make sure you have at least one worker connected to the {workflow.taskQueue} Task Queue."
      class="my-0"
    />
  </section>
{/if}

<style lang="postcss">
  .stack-trace {
    @apply relative flex w-full flex-col rounded-lg border-2 border-yellow-700 bg-yellow-50 p-4 text-yellow-900;
  }
</style>
