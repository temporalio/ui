<script lang="ts">
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import LiveCountAnnouncer from '$lib/components/live-count-announcer.svelte';
  import Paginated from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { buildGroupIndex, isEventGroup } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import {
    isLazyGroup,
    type LazyGroup,
    materializeGroup,
  } from '$lib/services/grouped-event-buffer';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import { currentPageKey, perPageKey } from '$lib/stores/pagination';
  import type {
    IterableEventWithPending,
    WorkflowEventWithPending,
  } from '$lib/types/events';
  import {
    getFailedOrPendingEvents,
    getFailedOrPendingGroups,
  } from '$lib/utilities/get-failed-or-pending';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  import HistoryGraph from '../lines-and-dots/history-graph/history-graph.svelte';
  import TableHeaderCell from '../workflow/workflows-summary-configurable-table/table-header-cell.svelte';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';
  import PendingActivitySummaryRow from './pending-activity-summary-row.svelte';
  import PendingNexusSummaryRow from './pending-nexus-summary-row.svelte';

  /** Discriminated on `compact` so `items` narrows without a cast. */
  type Props = {
    updating?: boolean;
    loading?: boolean;
    minimized?: boolean;
  } & (
    | { compact: true; items: LazyGroup[]; groups?: never }
    | {
        compact?: false;
        items: IterableEventWithPending[];
        groups?: EventGroups;
      }
  );

  // `const` with no default on `compact` — `let` or a default breaks narrowing.
  const {
    items,
    compact,
    groups = [],
    updating = false,
    loading = false,
    minimized = true,
  }: Props = $props();

  // Set by a hovered row, read by its siblings to highlight related activities.
  let hoveredEventId = $state<string | undefined>(undefined);

  const showGraph = $derived(!minimized && !compact);
  const initialItem = $derived($fullEventHistory?.[0]);
  const groupIndex = $derived(buildGroupIndex(groups));
  const url = $derived(page.url);
  const perPageParam = $derived(url.searchParams.get(perPageKey) ?? '100');
  const currentPageParam = $derived(
    url.searchParams.get(currentPageKey) || '1',
  );

  // Array-of-union, not union-of-arrays: Paginated is generic over one Item,
  // which `LazyGroup[] | IterableEventWithPending[]` gives it no way to pick.
  const filteredItems: (IterableEventWithPending | LazyGroup)[] = $derived(
    compact
      ? getFailedOrPendingGroups(items, $eventStatusFilter)
      : getFailedOrPendingEvents(items, $eventStatusFilter),
  );

  // The gutter graph sits outside Paginated, so it re-derives the page.
  const graphHistory = $derived(
    showGraph
      ? (filteredItems as WorkflowEventWithPending[]).slice(
          (parseInt(currentPageParam) - 1) * parseInt(perPageParam),
          parseInt(currentPageParam) * parseInt(perPageParam),
        )
      : [],
  );

  const columns = $derived([
    { label: 'Event ID' },
    { label: 'Timestamp' },
    { label: 'Event Type' },
    { label: 'Details' },
    ...($isCloud ? [{ label: 'Billable Actions' }] : []),
  ]);

  const materializeRowReactive = (
    item: IterableEventWithPending | LazyGroup,
  ) => {
    void eventBuffer.version;
    return isLazyGroup(item) ? materializeGroup(item) : item;
  };

  const iterableKey = (event: IterableEventWithPending | LazyGroup) => {
    if (isPendingNexusOperation(event)) {
      return `pending-nexus-${event.scheduledEventId}`;
    }

    if (isPendingActivity(event)) {
      return `pending-activity-${event.id}`;
    }

    if (isLazyGroup(event)) {
      return `group-${event.id}`;
    }

    return `event-${event.id}`;
  };
</script>

<LiveCountAnnouncer
  count={items.length}
  getMessage={(count) =>
    translate('workflows.new-events-announcement', { count })}
/>
<div class="flex">
  <div class="pt-9">
    {#if showGraph}
      <HistoryGraph {groups} history={graphHistory} />
    {/if}
  </div>
  <Paginated
    perPageLabel={translate('common.per-page')}
    nextPageButtonLabel={translate('common.next-page')}
    previousPageButtonLabel={translate('common.previous-page')}
    pageButtonLabel={(page) => translate('common.go-to-page', { page })}
    {updating}
    items={filteredItems}
    maxHeight="none"
    class="border-t-0"
  >
    {#snippet headers()}
      <TableHeaderRow class="!h-8">
        {#each columns as column, i (`${column.label}:${i}`)}
          <TableHeaderCell {column}>
            {#if column.label === 'Event Type'}
              <EventHistoryLegend eventTypesOnly />
            {/if}
          </TableHeaderCell>
        {/each}
      </TableHeaderRow>
    {/snippet}
    {#snippet rows({ visibleItems })}
      {#each visibleItems as item, index (iterableKey(item))}
        {@const row = materializeRowReactive(item)}
        {#if isEventGroup(row)}
          <EventSummaryRow
            bind:hoveredEventId
            event={row}
            {index}
            group={row}
            {compact}
            {initialItem}
          />
        {:else if isPendingActivity(row)}
          <PendingActivitySummaryRow
            event={row}
            {index}
            group={groups.find(
              (g) =>
                isPendingActivity(row) && g?.pendingActivity?.id === row.id,
            )}
          />
        {:else if isPendingNexusOperation(row)}
          <PendingNexusSummaryRow
            event={row}
            {index}
            group={groups.find(
              (g) =>
                isPendingNexusOperation(row) &&
                g?.pendingNexusOperation?.scheduledEventId ===
                  row.scheduledEventId,
            )}
          />
        {:else}
          <EventSummaryRow
            bind:hoveredEventId
            event={row}
            {index}
            group={isEvent(row) ? groupIndex.get(row.id) : undefined}
            {compact}
            {initialItem}
          />
        {/if}
      {:else}
        <EventEmptyRow loading={!$fullEventHistory.length || loading} />
      {/each}
    {/snippet}
  </Paginated>
</div>
