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
  import EventShortcutKeys from './event-shortcut-keys.svelte';

  export let compact = false;
  let showShortcuts = false;

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

  const onSpace = (event: KeyboardEvent) => {
    event.preventDefault();
    showShortcuts = !showShortcuts;
  };

  const getEvents = (items: CommonHistoryEvent[]): IterableEvent[] => {
    return compact ? groupEvents(items) : items;
  };
</script>

<EventShortcutKeys open={showShortcuts} {compact} />
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
    {onSpace}
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
  </ApiPagination>
{/key}
