<script lang="ts">
  import EventSummaryTimeline from '$lib/components/eventV2/event-summary-timeline.svelte';
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import WorkflowOptionsV2 from '$lib/components/eventV2/workflow-options-v2.svelte';
  import { importEvents } from '$lib/stores/import-events';

  let debugMode = false;
  let advancedMode = false;
</script>

<div class="flex flex-col gap-2">
  <EventSummaryTimeline fullHistory={$importEvents} />
  <!-- <EventSummaryV2 importingHistory {debugMode} {advancedMode} /> -->
</div>
