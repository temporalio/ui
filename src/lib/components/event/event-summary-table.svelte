<script lang="ts">
  import PaginatedTable from '$lib/holocene/table/paginated-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import type { WorkflowEvents } from '$lib/types/events';

  import EventEmptyRow from './event-empty-row.svelte';
  import EventSummaryRow from './event-summary-row.svelte';

  // import Button from '$lib/holocene/button.svelte';
  // import HistoryGraph from '../lines-and-dots/svg/history-graph.svelte';
  // import Icon from '$lib/holocene/icon/icon.svelte';

  export let items: WorkflowEvents;
  export let groups: EventGroups;
  export let canvasWidth: number;
  export let updating = false;
  export let compact = false;
  export let onExpandCollapse: () => void;

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
  <!-- <div
    class="relative hidden pt-12 lg:block"
    style="width: {canvasWidth}px;"
    slot="visual"
  >
    <Button
      size="xs"
      variant="ghost"
      class="absolute right-1 top-1"
      on:click={onExpandCollapse}
    >
      <Icon
        name={canvasWidth === 120 ? 'chevron-right' : 'chevron-left'}
        x={4}
        y={8}
      />
    </Button>
    <HistoryGraph {groups} history={[]} {canvasWidth} />
  </div> -->
  {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
    <EventSummaryRow {event} {compact} {expandAll} {initialItem} />
  {:else}
    <EventEmptyRow loading={!$fullEventHistory.length} />
  {/each}
  <!-- </div> -->
</PaginatedTable>
