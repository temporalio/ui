<script>import { expandAllEvents } from '../../stores/event-view';
import Pagination from '$holocene/pagination.svelte';
import EventSummaryTable from './event-summary-table.svelte';
import EventSummaryRow from './event-summary-row.svelte';
import EventEmptyRow from './event-empty-row.svelte';
export let items;
export let groups;
export let compact = false;
function handleExpandChange(event) {
    $expandAllEvents = event.detail.expanded;
}
</script>

<Pagination
  {items}
  floatId="event-view-toggle"
  let:visibleItems
  let:initialItem
>
  <EventSummaryTable {compact} on:expandAll={handleExpandChange}>
    {#each visibleItems as event (`${event.id}-${event.timestamp}`)}
      <EventSummaryRow
        {event}
        {groups}
        {compact}
        expandAll={$expandAllEvents === 'true'}
        {initialItem}
        {visibleItems}
      />
    {:else}
      <EventEmptyRow />
    {/each}
  </EventSummaryTable>
</Pagination>
