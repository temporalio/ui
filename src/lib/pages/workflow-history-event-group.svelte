<script lang="ts">
  import { page } from '$app/stores';

  import EventEmptyRow from '$lib/components/event/event-empty-row.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';

  const compact = true;

  $: ({
    namespace,
    workflow: workflowId,
    run: runId,
    id: groupId,
  } = $page.params);

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
      loading = true;
      resetFullHistory();
      $fullEventHistory = await fetchAllEvents({
        namespace,
        workflowId,
        runId,
        sort: 'ascending',
      });
      loading = false;
    }
  };

  $: fetchEvents(namespace, workflowId, runId);

  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : $eventHistory?.start;
  $: initialItem = currentEvents?.[0];
  $: updating = currentEvents.length && !$fullEventHistory.length;
  $: visibleItems = groupEvents($fullEventHistory).filter(
    (e) => e.id === groupId,
  );
</script>

<EventSummaryTable {updating} {compact}>
  {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
    <EventSummaryRow
      {event}
      {compact}
      expandAll={true}
      {initialItem}
      active={true}
    />
  {:else}
    <EventEmptyRow
      {loading}
      title={translate('events.group-empty-state-title')}
      content=""
    />
  {/each}
</EventSummaryTable>
