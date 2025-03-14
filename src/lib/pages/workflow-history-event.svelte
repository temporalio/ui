<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  const resetFullHistory = () => {
    $fullEventHistory = [];
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if (!$fullEventHistory.length) {
      resetFullHistory();
      $fullEventHistory = await fetchAllEvents({
        namespace,
        workflowId,
        runId,
      });
    }
  };

  $: fetchEvents(namespace, workflowId, runId);

  $: updating = !$fullEventHistory.length;

  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;

  $: ascendingGroups = groupEvents(
    $fullEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );
  $: groups =
    $eventFilterSort === 'ascending'
      ? ascendingGroups
      : [...ascendingGroups].reverse();

  $: visibleItems = $fullEventHistory.filter((e) => e.id === $page.params.id);
</script>

<div class="px-8" data-testid="event-summary-table">
  <EventSummaryTable items={visibleItems} {groups} {updating} expandAll />
</div>
