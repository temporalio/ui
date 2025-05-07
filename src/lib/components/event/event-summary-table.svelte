<script lang="ts">
  import Paginated from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import type {
    IterableEventWithPending,
    // WorkflowEventWithPending,
  } from '$lib/types/events';
  import { getFailedOrPendingEvents } from '$lib/utilities/get-failed-or-pending';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  // import HistoryGraph from '../lines-and-dots/svg/history-graph.svelte';
  import TableHeaderCell from '../workflow/workflows-summary-configurable-table/table-header-cell.svelte';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';
  import PendingActivitySummaryRow from './pending-activity-summary-row.svelte';
  import PendingNexusSummaryRow from './pending-nexus-summary-row.svelte';

  export let items: IterableEventWithPending[];
  export let groups: EventGroups = [];
  export let updating = false;
  export let loading = false;
  export let compact = false;
  export let minimized = true;

  // $: showGraph = !compact;

  $: initialItem = $fullEventHistory?.[0];

  // const history = (items: IterableEventWithPending[]) => {
  //   return items as WorkflowEventWithPending[];
  // };

  $: filteredForStatus = (items: IterableEventWithPending[]) =>
    getFailedOrPendingEvents(items, $eventStatusFilter);

  const columns = [
    { label: 'Event ID', pinned: true },
    { label: 'Timestamp', pinned: true },
    { label: 'Event Type', pinned: true },
    { label: 'Details', pinned: true },
    { label: 'Actions', pinned: true },
  ];
</script>

<Paginated
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(page) => translate('common.go-to-page', { page })}
  {updating}
  items={filteredForStatus(items)}
  let:visibleItems
  maxHeight={minimized ? 'calc(100vh - 200px)' : '20000px'}
>
  <TableHeaderRow slot="headers" class="!h-8">
    {#each columns as column}
      <TableHeaderCell {column} />
    {/each}
  </TableHeaderRow>
  <!-- {#if showGraph}
    <HistoryGraph {groups} history={history(visibleItems)} />
  {/if} -->
  {#each visibleItems as event, index}
    {#if isEventGroup(event)}
      <EventSummaryRow {event} {index} group={event} {compact} {initialItem} />
    {:else if isPendingActivity(event)}
      <PendingActivitySummaryRow
        {event}
        {index}
        group={groups.find(
          (g) =>
            isPendingActivity(event) && g?.pendingActivity?.id === event.id,
        )}
      />
    {:else if isPendingNexusOperation(event)}
      <PendingNexusSummaryRow
        {event}
        {index}
        group={groups.find(
          (g) =>
            isPendingNexusOperation(event) &&
            g?.pendingNexusOperation?.scheduledEventId ===
              event.scheduledEventId,
        )}
      />
    {:else}
      <EventSummaryRow
        {event}
        {index}
        group={groups.find((g) => isEvent(event) && g.eventIds.has(event.id))}
        {compact}
        {initialItem}
      />
    {/if}
  {:else}
    <EventEmptyRow loading={!$fullEventHistory.length || loading} />
  {/each}
</Paginated>
