<script lang="ts">
  import { onDestroy } from 'svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout>
  <slot />
</WorkflowRunLayout>
