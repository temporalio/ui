<script lang="ts">
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowResetEnabled } from '$lib/utilities/workflow-reset-enabled';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout
  cancelEnabled={workflowCancelEnabled($page.data.settings)}
  signalEnabled={workflowSignalEnabled($page.data.settings)}
  terminateEnabled={workflowTerminateEnabled($page.data.settings)}
  resetEnabled={workflowResetEnabled($page.data.settings)}
>
  <slot />
</WorkflowRunLayout>
