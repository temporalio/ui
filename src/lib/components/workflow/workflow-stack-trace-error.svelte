<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';

  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow, workers } = $workflowRun);
  $: runningWithNoWorkers = workflow?.isRunning && !workers?.pollers?.length;
</script>

{#if runningWithNoWorkers}
  <section class="stack-trace">
    <EmptyState
      icon="warning"
      title={translate('workflows', 'workflow-error-no-workers-title')}
      content={translate('workflows', 'workflow-error-no-workers-description', {
        taskQueue: workflow?.taskQueue,
      })}
      class="my-0"
    />
  </section>
{/if}

<style lang="postcss">
  .stack-trace {
    @apply relative flex w-full flex-col rounded-xl border-2 border-yellow-700 bg-yellow-50 p-4 text-yellow-900;
  }
</style>
