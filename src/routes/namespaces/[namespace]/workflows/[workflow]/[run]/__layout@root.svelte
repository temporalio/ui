<script lang="ts">
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/events';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout>
  <slot />
</WorkflowRunLayout>
