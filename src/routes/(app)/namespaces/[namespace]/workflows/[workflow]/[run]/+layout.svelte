<script lang="ts">
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { initialWorkflowRun, workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory, initialEventHistory } from '$lib/stores/events';

  onDestroy(() => {
    clearPreviousEventParameters();
    $workflowRun = initialWorkflowRun;
    $eventHistory = initialEventHistory;
  });
</script>

<WorkflowRunLayout
  cancelEnabled={workflowCancelEnabled($page.data.settings)}
  signalEnabled={workflowSignalEnabled($page.data.settings)}
  terminateEnabled={workflowTerminateEnabled($page.data.settings)}
>
  <slot />
</WorkflowRunLayout>
