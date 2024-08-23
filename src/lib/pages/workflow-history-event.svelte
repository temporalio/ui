<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';

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

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  $: updating = !$fullEventHistory.length;
  $: visibleItems = $fullEventHistory.filter((e) => e.id === $page.params.id);
</script>

<div class="px-8">
  <EventSummaryTable
    items={visibleItems}
    {updating}
    on:expandAll={handleExpandChange}
  />
</div>
