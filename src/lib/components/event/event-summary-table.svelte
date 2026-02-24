<script lang="ts">
  import { page } from '$app/stores';

  import Paginated from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import { currentPageKey, perPageKey } from '$lib/stores/pagination';
  import type {
    IterableEventWithPending,
    WorkflowEventWithPending,
    // WorkflowEventWithPending,
  } from '$lib/types/events';
  import { getFailedOrPendingEvents } from '$lib/utilities/get-failed-or-pending';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  import HistoryGraph from '../lines-and-dots/svg/history-graph.svelte';
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
  export let hoveredEventId: string | undefined = undefined;

  $: showGraph = !minimized && !compact;

  $: initialItem = $fullEventHistory?.[0];

  $: url = $page.url;
  $: perPageParam = url.searchParams.get(perPageKey) ?? '100';
  $: currentPageParam = url.searchParams.get(currentPageKey) || '1';
  $: paginatedHistory = (items: IterableEventWithPending[]) => {
    return filteredForStatus(items).slice(
      (parseInt(currentPageParam) - 1) * parseInt(perPageParam),
      parseInt(currentPageParam) * parseInt(perPageParam),
    ) as WorkflowEventWithPending[];
  };
  $: filteredForStatus = (items: IterableEventWithPending[]) =>
    getFailedOrPendingEvents(items, $eventStatusFilter);

  const columns = [
    { label: 'Event ID' },
    { label: 'Timestamp' },
    { label: 'Event Type' },
    { label: 'Details' },
  ];

  $: if ($isCloud && columns.length === 4) {
    columns.push({ label: 'Billable Actions' });
  }

  const iterableKey = (event: IterableEventWithPending) => {
    if (isPendingNexusOperation(event))
      return `pending-nexus-${event.scheduledEventId}`;
    if (isPendingActivity(event)) return `pending-activity-${event.id}`;
    return `event-${event.id}`;
  };
</script>

<div class="flex">
  <div class="pt-9">
    {#if showGraph}
      <HistoryGraph {groups} history={paginatedHistory(items)} />
    {/if}
  </div>
  <Paginated
    perPageLabel={translate('common.per-page')}
    nextPageButtonLabel={translate('common.next-page')}
    previousPageButtonLabel={translate('common.previous-page')}
    pageButtonLabel={(page) => translate('common.go-to-page', { page })}
    {updating}
    items={filteredForStatus(items)}
    let:visibleItems
    maxHeight="none"
  >
    <TableHeaderRow slot="headers" class="!h-8">
      {#each columns as column}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visibleItems as event, index (iterableKey(event))}
      {#if isEventGroup(event)}
        <EventSummaryRow
          bind:hoveredEventId
          {event}
          {index}
          group={event}
          {compact}
          {initialItem}
        />
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
          bind:hoveredEventId
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
</div>
