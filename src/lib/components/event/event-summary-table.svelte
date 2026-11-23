<script lang="ts">
  import type { Snippet } from 'svelte';

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
  import type {
    IterableEventWithPending,
    PendingActivity,
    WorkflowEvent,
  } from '$lib/types/events';
  import type {
    WorkflowExecution,
    WorkflowExecutionIdentity,
  } from '$lib/types/workflows';
  import {
    getFailedOrPendingEvents,
    getFailedOrPendingGroups,
  } from '$lib/utilities/get-failed-or-pending';
  import {
    isPendingActivity,
    isPendingNexusOperation,
  } from '$lib/utilities/is-pending-activity';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';
  import PendingActivitySummaryRow from './pending-activity-summary-row.svelte';
  import PendingNexusSummaryRow from './pending-nexus-summary-row.svelte';

  /** Discriminated on `compact` so `items` narrows without a cast. */
  type Props = {
    workflowExecutionIdentity: WorkflowExecutionIdentity;
    workflow: WorkflowExecution | null;
    initialEvent: WorkflowEvent | undefined;
    updating?: boolean;
    loading?: boolean;
    activityActions?: Snippet<[PendingActivity]>;
  } & (
    | {
        compact: true;
        items: LazyGroup[];
        materializeGroup: (group: LazyGroup) => EventGroup;
        groups?: never;
      }
    | {
        compact?: false;
        items: IterableEventWithPending[];
        materializeGroup?: never;
        groups?: EventGroups;
      }
  );

  // `const` with no default on `compact` — `let` or a default breaks narrowing.
  const {
    workflowExecutionIdentity,
    workflow,
    initialEvent,
    materializeGroup,
    items,
    compact,
    groups = [],
    updating = false,
    loading = false,
    activityActions,
  }: Props = $props();

  // Set by a hovered row, read by its siblings to highlight related activities.
  let hoveredEventId = $state<string | undefined>(undefined);

  const groupIndex = $derived(buildGroupIndex(groups));

  // Array-of-union, not union-of-arrays: Paginated is generic over one Item,
  // which `LazyGroup[] | IterableEventWithPending[]` gives it no way to pick.
  const filteredItems: (IterableEventWithPending | LazyGroup)[] = $derived(
    compact
      ? getFailedOrPendingGroups(items, $eventStatusFilter)
      : getFailedOrPendingEvents(items, $eventStatusFilter),
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
            {workflow}
            group={row}
            {compact}
            initialItem={initialEvent}
          />
        {:else if isPendingActivity(row)}
          <PendingActivitySummaryRow
            {workflowExecutionIdentity}
            {workflow}
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
            {workflow}
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
            {workflow}
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
