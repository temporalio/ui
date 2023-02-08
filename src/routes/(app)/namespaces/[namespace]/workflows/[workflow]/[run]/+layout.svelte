<script lang="ts">
  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout>
  <slot />
</WorkflowRunLayout>
