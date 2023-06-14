<script lang="ts">
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
  import { fullEventHistory } from '$lib/stores/events';

  let showCompleted = true;
  let expandAll = false;
  let showWorkflowTasks = false;

  $: {
    console.log('fullEventHistory', $fullEventHistory);
  }
</script>

<LabsModeGuard>
  <svelte:fragment slot="labs">
    <EventSummaryV2
      fullHistory={$fullEventHistory}
      {showCompleted}
      {expandAll}
      {showWorkflowTasks}
    />
  </svelte:fragment>
  <EventSummary compact={true} />
</LabsModeGuard>
