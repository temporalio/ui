<script lang="ts">
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout cancelEnabled signalEnabled>
  <slot />
</WorkflowRunLayout>
