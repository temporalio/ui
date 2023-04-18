<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';
  import EventHistoryGroupTimeline from './event-history-group-timeline.svelte';
  import { groupEvents } from '$lib/models/event-groups';

  $: ({ workflow } = $workflowRun);
  export let fullHistory: CommonHistoryEvent[] = [];

  $: isRunning = workflow?.isRunning;
</script>

<div class="w-full w-full md:w-1/2">
  <EventHistoryGroupTimeline
    events={fullHistory}
    eventGroups={groupEvents(fullHistory)}
    {isRunning}
  />
</div>
