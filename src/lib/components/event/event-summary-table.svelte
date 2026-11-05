<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import LiveCountAnnouncer from '$lib/components/live-count-announcer.svelte';
  import Paginated from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { buildGroupIndex, isEventGroup } from '$lib/models/event-groups';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import {
    isLazyGroup,
    type LazyGroup,
  } from '$lib/services/grouped-event-buffer';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { eventStatusFilter } from '$lib/stores/filters';
  import { currentPageKey, perPageKey } from '$lib/stores/pagination';
  import type {
    IterableEventWithPending,
    PendingActivity,
    WorkflowEvent,
    WorkflowEventWithPending,
  } from '$lib/types/events';
  import type { WorkflowExecutionIdentity } from '$lib/types/workflows';
  import {
    getFailedOrPendingEvents,
    getFailedOrPendingGroups,
  } from '$lib/utilities/get-failed-or-pending';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  import HistoryGraph from '../lines-and-dots/history-graph/history-graph.svelte';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';
  import PendingActivitySummaryRow from './pending-activity-summary-row.svelte';
  import PendingNexusSummaryRow from './pending-nexus-summary-row.svelte';

  /** Discriminated on `compact` so `items` narrows without a cast. */
  type Props = {
    workflowExecutionIdentity: WorkflowExecutionIdentity;
    initialEvent: WorkflowEvent | undefined;
    updating?: boolean;
    loading?: boolean;
    minimized?: boolean;
    activityActions?: Snippet<[PendingActivity]>;
  } & (
    | {
        compact: true;
        items: LazyGroup[];
        materializeGroup: (group: LazyGroup) => EventGroup;
        groups?: never;
        workflowTaskGroups?: never;
      }
    | {
        compact?: false;
        items: IterableEventWithPending[];
        materializeGroup?: never;
        groups?: EventGroups;
        workflowTaskGroups?: EventGroups;
      }
  );

  // `const` with no default on `compact` — `let` or a default breaks narrowing.
  const {
    workflowExecutionIdentity,
    initialEvent,
    materializeGroup,
    workflowTaskGroups = [],
    items,
    compact,
    groups = [],
    updating = false,
    loading = false,
    minimized = true,
    activityActions,
  }: Props = $props();

  // Set by a hovered row, read by its siblings to highlight related activities.
  let hoveredEventId = $state<string | undefined>(undefined);

  const showGraph = $derived(!minimized && !compact);
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
      ? filteredItems
          .filter(
            (item): item is WorkflowEventWithPending =>
              !isLazyGroup(item) && !isEventGroup(item),
          )
          .slice(
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
  ) => (isLazyGroup(item) ? (compact ? materializeGroup(item) : item) : item);

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
      <HistoryGraph {groups} history={graphHistory} {workflowTaskGroups} />
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
  >
    {#snippet headers()}
      <TableHeaderRow class="!h-8">
        {#each columns as { label }, i (`${label}:${i}`)}
          <th scope="col" class="relative">
            <div class="flex items-center gap-2 overflow-hidden">
              <span class="truncate">{label}</span>
              {#if label === 'Event Type'}
                <EventHistoryLegend eventTypesOnly />
              {/if}
            </div>
          </th>
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
            {activityActions}
            {workflowExecutionIdentity}
            group={row}
            {compact}
            initialItem={initialEvent}
          />
        {:else if isPendingActivity(row)}
          <PendingActivitySummaryRow
            {workflowExecutionIdentity}
            event={row}
            {index}
            {activityActions}
            group={groups.find(
              (g) =>
                isPendingActivity(row) && g?.pendingActivity?.id === row.id,
            )}
          />
        {:else if isPendingNexusOperation(row)}
          <PendingNexusSummaryRow
            {workflowExecutionIdentity}
            event={row}
            {index}
            {activityActions}
            group={groups.find(
              (g) =>
                isPendingNexusOperation(row) &&
                g?.pendingNexusOperation?.scheduledEventId ===
                  row.scheduledEventId,
            )}
          />
        {:else if !isLazyGroup(row)}
          <EventSummaryRow
            bind:hoveredEventId
            event={row}
            {index}
            {activityActions}
            {workflowExecutionIdentity}
            group={isEvent(row) ? groupIndex.get(row.id) : undefined}
            {compact}
            initialItem={initialEvent}
          />
        {/if}
      {:else}
        <EventEmptyRow loading={loading || updating} />
      {/each}
    {/snippet}
  </Paginated>
</div>
