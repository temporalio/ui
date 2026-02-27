<script lang="ts">
  import { fly } from 'svelte/transition';

  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow, workers, workersLoaded } = $workflowRun);
  $: isPending = workflow?.isRunning || workflow?.isPaused;
  $: runningWithNoWorkers =
    workersLoaded && isPending && !workers?.pollers?.length;
</script>

{#if runningWithNoWorkers}
  <div in:fly={{ duration: 200, delay: 100 }}>
    <Alert
      icon="warning"
      intent="warning"
      title={translate('workflows.workflow-error-no-workers-title')}
      class="max-w-screen-lg xl:w-2/3"
    >
      {translate('workflows.workflow-error-no-workers-description', {
        taskQueue: workflow?.taskQueue ?? '',
      })}
    </Alert>
  </div>
{/if}
