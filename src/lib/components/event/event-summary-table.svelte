<script lang="ts">
  import PaginatedTable from '$lib/holocene/table/paginated-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import type { WorkflowEvents } from '$lib/types/events';

  import HistoryGraph from '../lines-and-dots/svg/history-graph.svelte';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';

  export let items: WorkflowEvents;
  export let groups: EventGroups;
  export let updating = false;
  export let compact = false;

  $: initialItem = $fullEventHistory?.[0];

  let expandAll = $expandAllEvents === 'true';
</script>

<PaginatedTable
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(page) => translate('common.go-to-page', { page })}
  {updating}
  {items}
  let:visibleItems
  variant="ghost"
>
  {#if !compact}
    <HistoryGraph {groups} history={visibleItems} />
  {/if}
  <div class="grow">
    {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow {event} {compact} {expandAll} {initialItem} />
    {:else}
      <EventEmptyRow loading={!$fullEventHistory.length} />
    {/each}
  </div>
</PaginatedTable>
