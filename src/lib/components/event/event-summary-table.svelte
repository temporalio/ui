<script lang="ts">
  import Paginated from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import type { IterableEvent, WorkflowEvents } from '$lib/types/events';

  import HistoryGraph from '../lines-and-dots/svg/history-graph.svelte';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';

  export let items: IterableEvent[];
  export let groups: EventGroups = [];
  export let updating = false;
  export let compact = false;

  $: initialItem = $fullEventHistory?.[0];

  $: expandAll = $expandAllEvents === 'true';

  const history = (items: IterableEvent[]) => {
    return items as WorkflowEvents;
  };
</script>

<Paginated
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(page) => translate('common.go-to-page', { page })}
  {updating}
  {items}
  let:visibleItems
  variant="split"
  maxHeight="calc(100vh - 200px)"
>
  {#if !compact}
    <HistoryGraph {groups} history={history(visibleItems)} />
  {/if}
  <div class="w-full">
    {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        group={isEventGroup(event)
          ? event
          : groups.find((g) => g.eventIds.has(event.id))}
        {compact}
        {expandAll}
        {initialItem}
      />
    {:else}
      <EventEmptyRow loading={!$fullEventHistory.length} />
    {/each}
  </div>
</Paginated>
