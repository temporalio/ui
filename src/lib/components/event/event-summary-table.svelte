<script lang="ts">
  import Paginated from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
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

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';
  import PendingActivitySummaryRow from './pending-activity-summary-row.svelte';
  import PendingNexusSummaryRow from './pending-nexus-summary-row.svelte';

  export let items: IterableEventWithPending[];
  export let groups: EventGroups = [];
  export let updating = false;
  export let compact = false;
  export let openExpanded = false;

  $: initialItem = $fullEventHistory?.[0];

  $: expandAll = openExpanded || $expandAllEvents === 'true';

  const history = (items: IterableEventWithPending[]) => {
    return items as WorkflowEventWithPending[];
  };

  $: filteredForStatus = (items: IterableEventWithPending[]) =>
    getFailedOrPendingEvents(items, $eventStatusFilter);
</script>

<Paginated
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(page) => translate('common.go-to-page', { page })}
  {updating}
  items={filteredForStatus(items)}
  let:visibleItems
  variant="split"
  maxHeight="calc(100vh - 200px)"
  fixed
>
  {#if !compact}
    <HistoryGraph {groups} history={history(visibleItems)} />
  {/if}
  <div class="w-full">
    {#each visibleItems as event, index}
      {#if isEventGroup(event)}
        <EventSummaryRow
          {event}
          {index}
          group={event}
          {compact}
          {expandAll}
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
          {expandAll}
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
          {expandAll}
        />
      {:else}
        <EventSummaryRow
          {event}
          {index}
          group={groups.find((g) => isEvent(event) && g.eventIds.has(event.id))}
          {compact}
          {expandAll}
          {initialItem}
        />
      {/if}
    {:else}
      <EventEmptyRow loading={!$fullEventHistory.length} />
    {/each}
  </div>
</Paginated>
