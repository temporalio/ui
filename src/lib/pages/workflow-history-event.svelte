<script lang="ts">
  import { page } from '$app/stores';

  import EventEmptyRow from '$lib/components/event/event-empty-row.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';

  export let compact = false;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  let loading = false;

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if (!$fullEventHistory.length) {
      loading = true;
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

  $: initialEvents =
    $eventFilterSort === 'descending'
      ? $eventHistory?.end
      : $eventHistory?.start;
  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : initialEvents;
  $: initialItem = currentEvents?.[0];
  $: updating = currentEvents.length && !$fullEventHistory.length;
  $: visibleItems = $fullEventHistory.filter((e) => e.id === $page.params.id);
</script>

<EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
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
