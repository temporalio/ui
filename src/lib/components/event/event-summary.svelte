<script lang="ts">
  import { page } from '$app/stores';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory, fetchPaginatedEvents } from '$lib/stores/events';
  import { refresh } from '$lib/stores/workflow-run';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import EmptyState from '$lib/holocene/empty-state.svelte';

  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  $: category = $page.url.searchParams.get('category');
  $: total = category ? '' : $eventHistory.total;
  $: initialItem = $eventHistory?.start?.[0];

  const onShiftUp = (_event: KeyboardEvent) => {
    if (!compact) {
      const sort = 'ascending';
      $eventFilterSort = sort;
      updateQueryParameters({
        parameter: 'sort',
        value: 'ascending',
        url: $page.url,
      });
    }
  };

  const onShiftDown = (_event: KeyboardEvent) => {
    if (!compact) {
      const sort = 'descending';
      $eventFilterSort = sort;
      updateQueryParameters({
        parameter: 'sort',
        value: sort,
        url: $page.url,
      });
    }
  };

  const getEvents = (items: CommonHistoryEvent[]): IterableEvent[] => {
    return compact ? groupEvents(items) : items;
  };
</script>

{#key [$eventFilterSort, category, $refresh]}
  <ApiPagination
    let:visibleItems
    let:updating
    let:activeIndex
    let:setActiveIndex
    onFetch={() => $fetchPaginatedEvents}
    pageSizeOptions={[]}
    {onShiftUp}
    {onShiftDown}
    {total}
  >
    <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
      {#each getEvents(visibleItems) as event, index (`${event.id}-${event.timestamp}`)}
        <EventSummaryRow
          {event}
          {compact}
          {visibleItems}
          expandAll={$expandAllEvents === 'true'}
          {initialItem}
          active={activeIndex === index}
          onRowClick={() => setActiveIndex(index)}
        />
      {:else}
        <EventEmptyRow />
      {/each}
    </EventSummaryTable>
    <div slot="empty">
      <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
        <tr>
          <td colspan="6">
            <EmptyState
              title="No Events Match"
              content="There are no events that match your filters or selected view. Adjust your filters or view to see your events."
            />
          </td>
        </tr>
      </EventSummaryTable>
    </div>
  </ApiPagination>
{/key}
