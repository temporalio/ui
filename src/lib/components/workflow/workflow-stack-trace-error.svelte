<script lang="ts">
  import { fly } from 'svelte/transition';

  import Alert from '$lib/holocene/alert.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { workflowIsCompatibleWithWorkers } from '$lib/utilities/task-queue-compatibility';

  $: ({ workflow, workers, compatibility } = $workflowRun);
  $: runningWithNoWorkers = workflow?.isRunning && !workers?.pollers?.length;
  $: runningWithNoCompatibleWorkers =
    workflow?.isRunning &&
    !workflowIsCompatibleWithWorkers(workflow, workers.pollers, compatibility);
</script>

{#if runningWithNoWorkers}
  <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
    <Alert
      bold
      icon="warning"
      intent="warning"
      title={translate('workflows', 'workflow-error-no-workers-title')}
    >
      {translate('workflows', 'workflow-error-no-workers-description', {
        taskQueue: workflow?.taskQueue,
      })}
    </Alert>
  </div>
{/if}
{#if !runningWithNoWorkers && runningWithNoCompatibleWorkers}
  <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
    <Alert
      bold
      icon="warning"
      intent="warning"
      title={translate(
        'workflows',
        'workflow-error-no-compatible-workers-title',
      )}
    >
      {translate(
        'workflows',
        'workflow-error-no-compatible-workers-description',
        {
          taskQueue: workflow?.taskQueue,
        },
      )}
    </Alert>
  </div>
{/if}
