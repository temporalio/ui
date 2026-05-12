<script lang="ts">
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
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

  let {
    items,
    groups = [],
    updating = false,
    loading = false,
    compact = false,
    minimized = true,
    hoveredEventId = $bindable(undefined),
  }: {
    items: IterableEventWithPending[];
    groups?: EventGroups;
    updating?: boolean;
    loading?: boolean;
    compact?: boolean;
    minimized?: boolean;
    hoveredEventId?: string;
  } = $props();

  const showGraph = $derived(!minimized && !compact);
  const initialItem = $derived($fullEventHistory?.[0]);
  const url = $derived(page.url);
  const perPageParam = $derived(url.searchParams.get(perPageKey) ?? '100');
  const currentPageParam = $derived(
    url.searchParams.get(currentPageKey) || '1',
  );

  const filteredForStatus = (items: IterableEventWithPending[]) =>
    getFailedOrPendingEvents(items, $eventStatusFilter);

  const paginatedHistory = (items: IterableEventWithPending[]) => {
    return filteredForStatus(items).slice(
      (parseInt(currentPageParam) - 1) * parseInt(perPageParam),
      parseInt(currentPageParam) * parseInt(perPageParam),
    ) as WorkflowEventWithPending[];
  };

  const columns = $derived([
    { label: 'Event ID' },
    { label: 'Timestamp' },
    { label: 'Event Type' },
    { label: 'Details' },
    ...($isCloud ? [{ label: 'Billable Actions' }] : []),
  ]);

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
    class="border-t-0"
  >
    <TableHeaderRow slot="headers" class="!h-8">
      {#each columns as column, i (`${column.label}:${i}`)}
        <TableHeaderCell {column}>
          {#if column.label === 'Event Type'}
            <EventHistoryLegend eventTypesOnly />
          {/if}
        </TableHeaderCell>
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
