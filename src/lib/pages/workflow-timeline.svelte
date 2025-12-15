<script lang="ts">
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import { workflowHistoryInformation } from '$lib/runes/workflow-history-information.svelte';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { filteredEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';

  const workflow = $derived($workflowRun.workflow);
  const { groups } = $derived(
    workflowHistoryInformation(
      workflow,
      $filteredEventHistory,
      $eventFilterSort,
    ),
  );
</script>

<TimelineGraph {workflow} {groups} />
