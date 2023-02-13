<script lang="ts">
  import { onDestroy } from 'svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import EmbeddedContentSlotGuard from '$lib/components/embedded-content-slot-guard.svelte';

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<EmbeddedContentSlotGuard page="WORKFLOW">
  <WorkflowRunLayout>
    <slot />
  </WorkflowRunLayout>
</EmbeddedContentSlotGuard>
