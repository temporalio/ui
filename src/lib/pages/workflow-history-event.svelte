<script lang="ts">
  import { page } from '$app/stores';

  import EventEmptyRow from '$lib/components/event/event-empty-row.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';

  export let compact = false;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  let loading = false;

  const resetFullHistory = () => {
    $fullEventHistory = [];
    loading = true;
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
      loading = false;
    }
  };

  $: fetchEvents(namespace, workflowId, runId);

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  $: initialItem = $fullEventHistory?.[0];
  $: updating = !$fullEventHistory.length;
  $: visibleItems = $fullEventHistory.filter((e) => e.id === $page.params.id);
</script>

<EventSummaryTable {updating} on:expandAll={handleExpandChange}>
  {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
    <EventSummaryRow
      {event}
      {compact}
      expandAll={true}
      {initialItem}
      active={true}
    />
  {:else}
    <EventEmptyRow {loading} />
  {/each}
</EventSummaryTable>
