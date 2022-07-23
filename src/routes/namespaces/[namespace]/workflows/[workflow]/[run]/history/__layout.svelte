<script lang="ts">
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import EventHistoryTimelineContainer from '$lib/components/event/event-history-timeline-container.svelte';
</script>

<WorkflowHistoryLayout>
  <svelte:fragment slot="timeline">
    <!-- <EventHistoryTimelineContainer /> -->
  </svelte:fragment>
  <slot />
</WorkflowHistoryLayout>
