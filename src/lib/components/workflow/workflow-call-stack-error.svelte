<script lang="ts">
  import { fly } from 'svelte/transition';

  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow, workers, workersLoaded } = $workflowRun);
  $: runningWithNoWorkers =
    workersLoaded && workflow?.isRunning && !workers?.pollers?.length;
</script>

{#if runningWithNoWorkers}
  <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
    <Alert
      icon="warning"
      intent="warning"
      title={translate('workflows.workflow-error-no-workers-title')}
    >
      {translate('workflows.workflow-error-no-workers-description', {
        taskQueue: workflow?.taskQueue ?? '',
      })}
    </Alert>
  </div>
{/if}
