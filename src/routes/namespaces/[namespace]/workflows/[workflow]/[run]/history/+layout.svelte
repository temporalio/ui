<script lang="ts">
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
</script>

<WorkflowHistoryLayout>
  <svelte:fragment slot="timeline">
    <!-- <EventHistoryTimelineContainer /> -->
  </svelte:fragment>
  <slot />
</WorkflowHistoryLayout>
